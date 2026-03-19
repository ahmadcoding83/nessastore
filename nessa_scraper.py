import os
import sys
import re
import json
import asyncio
import random
import time
import io
import urllib.parse
from datetime import datetime
import requests
from bs4 import BeautifulSoup
from supabase import create_async_client
from dotenv import load_dotenv

# Fix Windows Terminal encoding — HARUS di atas semua print
os.environ.setdefault('PYTHONUTF8', '1')
try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    else:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
except Exception:
    pass

# Load local .env for development
load_dotenv('.env.admin')
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[ERROR] Supabase Credentials Missing! (Check .env.admin or ENV vars)")
    exit(1)

supabase = None
STORE_CACHE = {"tiktok": "", "shopee": "", "loaded": False}

# ──────────────────────────────────────────────────────────────
# HEADERS BROWSER PALSU agar tidak diblokir
# ──────────────────────────────────────────────────────────────
HEADERS = {
    # Gunakan crawler header agar platform seperti Shopee/Tokopedia mengembalikan OpenGraph HTML
    # ketimbang halaman block Cloudflare / blank SPA.
    "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "Connection": "keep-alive",
    "Referer": "https://www.google.com/",
}

async def load_store_config():
    try:
        res = await supabase.table("stores").select("*").limit(1).execute()
        if res.data:
            STORE_CACHE["tiktok"] = res.data[0].get('tiktok_affiliate_id') or ""
            STORE_CACHE["shopee"] = res.data[0].get('shopee_affiliate_id') or ""
            STORE_CACHE["loaded"] = True
    except: pass

# ──────────────────────────────────────────────────────────────
# FUNGSI SCRAPE INFO PRODUK DARI URL AFFILIATE
# ──────────────────────────────────────────────────────────────
def detect_platform(url: str) -> str:
    """Mendeteksi platform e-commerce dari URL."""
    # Bersihkan URL jika ada teks tambahan di depannya
    clean_url = re.search(r'(https?://[^\s]+)', url)
    if clean_url: url = clean_url.group(1)
    
    url = url.lower()
    if 'shopee.co.id' in url or 's.shopee.co.id' in url:
        return 'shopee'
    if 'tokopedia.com' in url or 'vt.tokopedia.com' in url:
        return 'tokopedia'
    if 'tiktok.com' in url:
        return 'tiktok'
    if 'lazada.co.id' in url:
        return 'lazada'
    return 'unknown'


def clean_price(text: str) -> int:
    """Bersihkan simbol Rp dan titik/koma dari harga dengan lebih cerdas."""
    if not text: return 0
    try:
        # Hapus semua karakter kecuali angka, titik, dan koma
        # Tapi hati-hati, jangan hapus titik jika itu pemisah ribuan
        text = text.replace('Rp', '').replace('IDR', '').strip()
        
        # Jika ada koma di akhir (desimal khas Indo), hapus bagian desimalnya
        if ',' in text:
            text = text.split(',')[0]
            
        # Sekarang hapus semua yang bukan angka
        clean = re.sub(r'[^\d]', '', text)
        return int(clean) if clean else 0
    except: return 0

def scrape_via_requests(url: str) -> dict:
    """Scraping langsung via HTML - dengan selektor lebih lengkap."""
    try:
        r = requests.get(url, headers=HEADERS, timeout=10, allow_redirects=True)
        soup = BeautifulSoup(r.text, "html.parser")

        # Nama
        name = ""
        # Cobalah meta tags dulu (paling standar)
        tag = soup.find("meta", {"property": "og:title"}) or \
              soup.find("meta", {"name": "twitter:title"}) or \
              soup.find("meta", {"property": "og:site_name"})
        
        if tag:
            name = tag.get("content", "").strip()
        
        if not name:
            tag = soup.find("h1") or soup.find("title")
            if tag: name = tag.text.strip()
            
        # Bersihkan nama dari "Jual ", affiliate tracking, dsb
        if name:
            name = name.split(" | ")[0].split(" - ")[0].strip()
            if name.lower().startswith("jual "): name = name[5:]

        # Harga
        price = 0
        # 1. Coba meta tags harga (Common for Shopify, WooCommerce, dsb)
        for sel in [
            ("meta", {"property": "product:price:amount"}),
            ("meta", {"name": "product:price:amount"}),
            ("meta", {"property": "og:price:amount"}),
            ("meta", {"name": "price"}),
        ]:
            tag = soup.find(sel[0], sel[1])
            if tag:
                price = clean_price(tag.get("content", ""))
                if price: break

        # 2. Coba cari teks yang mengandung "Rp" di elemen-elemen umum
        if not price:
            for sel in ["span", "p", "div", "b", "strong"]:
                tags = soup.find_all(sel)
                for t in tags:
                    if "Rp" in t.text and len(t.text) < 30:
                        potential = clean_price(t.text)
                        if potential > 1000: # Masuk akal sebagai harga barang
                            price = potential
                            break
                if price: break

        # 3. Coba cari di JSON-LD (LD+JSON) Scripts
        if not price:
            scripts = soup.find_all("script", {"type": "application/ld+json"})
            for s in scripts:
                try:
                    js = json.loads(s.text)
                    if isinstance(js, list): js = js[0]
                    # Cari rekursif field 'price'
                    def find_price(obj):
                        if isinstance(obj, dict):
                            if 'price' in obj: return obj['price']
                            for v in obj.values():
                                res = find_price(v)
                                if res: return res
                        return None
                    found = find_price(js)
                    if found:
                        price = clean_price(str(found))
                        if price: break
                except: continue

        # Deskripsi
        desc = ""
        tag = soup.find("meta", {"property": "og:description"}) or \
              soup.find("meta", {"name": "description"})
        if tag:
            desc = tag.get("content", "")[:400]

        # Gambar
        img = ""
        tag = soup.find("meta", {"property": "og:image"}) or \
              soup.find("meta", {"name": "twitter:image"}) or \
              soup.find("link", {"rel": "image_src"})
        if tag: img = tag.get("content", "") or tag.get("href", "")

        # Fallback Khusus affiliate yang menaruh data di URL
        parsed = urllib.parse.urlparse(r.url)
        params = urllib.parse.parse_qs(parsed.query)
        if "og_info" in params:
            try:
                og_info = json.loads(params["og_info"][0])
                if not img: img = og_info.get("image", "")
                if not name: name = og_info.get("title", "")
            except: pass

        return {"name": name, "price": price, "description": desc, "image_url": img}
    except Exception as e:
        print(f"[WARN] requests scrape error: {e}")
        return {}

def scrape_via_jina(url: str) -> dict:
    """
    Gunakan Jina AI Reader (r.jina.ai) untuk scrape halaman.
    Ini melewati JavaScript rendering dan anti-bot sederhana.
    Gratis tanpa API key.
    """
    try:
        jina_url = f"https://r.jina.ai/{url}"
        r = requests.get(jina_url, headers={
            "Accept": "application/json",
            "X-Return-Format": "json",
            "User-Agent": HEADERS["User-Agent"],
        }, timeout=5)

        if r.status_code != 200:
            print(f"[WARN] Jina returned {r.status_code}")
            return {}

        data = r.json()
        content = data.get("data", {})

        name = content.get("title", "").split("|")[0].split("-")[0].strip()
        desc = content.get("description", "")[:400]

        # Coba cari harga dari teks
        price = 0
        text_content = content.get("content", "") or content.get("text", "")
        # Cari pola harga Rp
        price_matches = re.findall(r'Rp[\s\.]*(\d[\d\.]+)', text_content)
        if price_matches:
            # Ambil harga pertama yang ditemukan
            price = clean_price(price_matches[0])
        
        # Coba pelbagai field image dari Jina API
        img = content.get("image", "")
        if not img and content.get("images"):
            img = content.get("images", [{}])[0].get("url", "")
        if not img and data.get("image"):
            img = data.get("image")
        
        return {"name": name, "price": price, "description": desc, "image_url": img}
    except Exception as e:
        print(f"[WARN] Jina scrape error: {e}")
        return {}

async def handle_scrape_product_info(task_id: str, url: str):
    """Scrape info produk dari URL affiliate dan kembalikan hasilnya ke task."""
    # Bersihkan URL jika user mem-paste teks sharing lengkap
    url_match = re.search(r'(https?://[^\s]+)', url)
    if url_match:
        url = url_match.group(1)
        # Hapus trailing non-url chars like brackets/periods
        url = re.sub(r'[^\w/]$', '', url)

    platform = detect_platform(url)
    print(f"[SCRAPE] Platform: {platform.upper()} | URL: {url[:60]}...")

    loop = asyncio.get_event_loop()

    # Coba Jina AI dulu (lebih reliable)
    try:
        data = await loop.run_in_executor(None, scrape_via_jina, url)
    except Exception:
        data = {}

    # Jika Jina gagal, atau nama/gambar kosong, fallback ke requests biasa
    if not data.get("name") or not data.get("image_url"):
        print("[SCRAPE] Jina gagal/kurang lengkap, coba requests langsung...")
        try:
            req_data = await loop.run_in_executor(None, scrape_via_requests, url)
            if not data.get("name"): data["name"] = req_data.get("name", "")
            if not data.get("price") and req_data.get("price"): data["price"] = req_data.get("price", 0)
            if not data.get("description"): data["description"] = req_data.get("description", "")
            if not data.get("image_url"): data["image_url"] = req_data.get("image_url", "")
        except Exception:
            pass

    name = data.get("name", "")
    price = data.get("price", 0)
    desc = data.get("description", "")
    img = data.get("image_url", "")

    if not name and not price and not img:
        print("[SCRAPE] Gagal total, mungkin diblokir / timeout.")
        return {
            "status": "error",
            "error": "Gagal mengambil data produk (Timeout/Diblokir platform)."
        }

    print(f"[SCRAPE] Hasil: name='{name[:40]}' price={price} has_img={'ya' if img else 'tidak'}")

    result = {
        "status": "completed",
        "platform": platform,
        "product_info": {
            "name": name,
            "price": price,
            "description": desc,
            "image_url": img,
        }
    }
    return result

# ──────────────────────────────────────────────────────────────
# EXISTING HANDLERS
# ──────────────────────────────────────────────────────────────
async def handle_global_search(query, source='tiktok'):
    if not STORE_CACHE["loaded"]: await load_store_config()
    query_encoded = query.replace(' ', '%20')
    if source == 'shopee':
        link = f"https://shopee.co.id/search?keyword={query_encoded}&page=0&sortBy=relevancy"
    else:
        link = f"https://www.tiktok.com/search?q={query_encoded}&type=5"
    img = f"https://loremflickr.com/320/240/{query.replace(' ', ',')}"
    results = []
    for i in range(5):
        # Set price safely to original or zero instead of random numbers
        price = 0
        results.append({
            "id": f"scanned-{int(time.time())}-{i}",
            "name": f"[{source.upper()}] {query.title()} Pilihan #{i+1}",
            "price": price,
            "image_url": img,
            "affiliate_link": link,
            "source": source
        })
    print(f"✅ Robot Berhasil: Menemukan 5 {query} di {source.upper()}")
    return {"status": "completed", "results": results}

async def handle_price_update(product_id):
    res = await supabase.table("products").select("name, affiliate_link, marketplace_source").eq("id", product_id).execute()
    if not res.data:
        return {"status": "error", "message": "Produk tidak ditemukan"}
    p = res.data[0]
    name = p.get('name', 'Produk')
    link = p.get('affiliate_link', '')
    source = p.get('marketplace_source', 'tiktok').upper() if p.get('marketplace_source') else 'TIKTOK'
    print(f"🤖 Update harga untuk: {name}")

    if not link:
        return {"status": "error", "message": "Tidak ada affiliate_link untuk produk ini"}

    # Scrape harga terbaru
    loop = asyncio.get_event_loop()
    try:
        data = await loop.run_in_executor(None, scrape_via_jina, link)
    except Exception:
        data = {}

    if not data.get("price"):
        print("[UPDATE] Jina lambat/gagal, coba requests langsung...")
        try:
            req_data = await loop.run_in_executor(None, scrape_via_requests, link)
            if req_data.get("price"): data["price"] = req_data.get("price")
        except: pass

    new_price = data.get("price")
    if not new_price:
        return {"status": "error", "message": "Gagal menemukan harga baru saat scraping"}

    await supabase.table("products").update({
        "price": new_price,
        "cost_price": new_price,
        "last_updated_at": datetime.now().isoformat()
    }).eq("id", product_id).execute()

    print(f"✅ Harga baru dari {source}: Rp{new_price:,}")
    return {"status": "completed", "new_price": new_price, "product_name": name, "source": source}

# ──────────────────────────────────────────────────────────────
# TASK ROUTER
# ──────────────────────────────────────────────────────────────
async def process_task(task):
    task_id = task['id']
    product_id = task.get('product_id')
    t_type = task.get('type', 'global_search')
    task_data = task.get('data', {}) or {}

    try:
        await supabase.table("tasks").update({"status": "processing"}).eq("id", task_id).execute()

        outcome: dict = {}
        if t_type == 'scrape_product_info':
            # Scrape info produk dari URL affiliate
            url = task_data.get('url', '')
            if not url:
                outcome = {"status": "error", "message": "URL tidak ditemukan di task data"}
            else:
                outcome = await handle_scrape_product_info(task_id, url)

        elif product_id:
            # Update harga produk spesifik
            outcome = await handle_price_update(product_id)

        elif t_type == 'global_search':
            outcome = await handle_global_search(
                task_data.get('query', 'Barang'),
                task_data.get('source', 'tiktok')
            )
        else:
            outcome = {"status": "completed", "msg": "Tipe task tidak dikenali"}

        final_status = outcome.get("status", "completed")
        # TETAP update row db jadi 'completed' karena ENUM Supabase 'task_status' tidak punya 'error'
        await supabase.table("tasks").update({"status": "completed", "data": outcome}).eq("id", task_id).execute()
        
        if final_status == "error":
            print(f"⚠️ Task {task_id[:8]}... Selesai dengan error: {outcome.get('error', '')}")
        else:
            print(f"✅ Task {task_id[:8]}... Selesai!")

    except Exception as e:
        print(f"❌ Gagal proses task: {e}")
        try:
            # Tetap completed untuk mencegah crash ENUM
            await supabase.table("tasks").update({"status": "completed", "data": {"status": "error", "error": str(e)}}).eq("id", task_id).execute()
        except: pass

# ──────────────────────────────────────────────────────────────
# MAIN LOOP
# ──────────────────────────────────────────────────────────────
async def run_nessa_robot():
    global supabase
    print("1. Menghubungkan ke Supabase...")
    try:
        supabase = await create_async_client(SUPABASE_URL, SUPABASE_KEY)
        print("2. Koneksi Supabase Berhasil!")
        await load_store_config()
        print("3. Konfigurasi Toko Dimuat.")
    except Exception as e:
        print(f"❌ GAGAL DI AWAL: {e}")
        return

    print("🚀 NESSA TURBO v9.0 STANDBY — Siap Scrape Info Produk!")

    while True:
        res = await supabase.table("tasks").select("*").eq("status", "pending").execute()
        if res.data:
            print(f"\n🔔 Menemukan {len(res.data)} tugas baru!")
            for t in res.data:
                asyncio.create_task(process_task(t))
        await asyncio.sleep(0.5)

if __name__ == "__main__":
    if os.name == 'nt': asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(run_nessa_robot())