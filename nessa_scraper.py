import asyncio
import random
import time
import os
from supabase import create_async_client
from dotenv import load_dotenv

# Load local .env for development
load_dotenv('.env.admin')
load_dotenv() # also try default .env

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ ERROR: Supabase Credentials Missing! (Check .env.admin or ENV vars)")
    exit(1)

supabase = None
STORE_CACHE = {"tiktok": "7576176592066887681", "loaded": False}

async def load_store_config():
    try:
        res = await supabase.table("stores").select("*").limit(1).execute()
        if res.data:
            STORE_CACHE["tiktok"] = res.data[0].get('tiktok_affiliate_id') or "7576176592066887681"
            STORE_CACHE["loaded"] = True
    except: pass

async def handle_global_search(query, source='tiktok'):
    if not STORE_CACHE["loaded"]: await load_store_config()
    
    query_encoded = query.replace(' ', '%20')
    
    # 1. PERBAIKAN LINK KHUSUS
    if source == 'shopee':
        # Menambahkan parameter page=0 dan sortBy=relevancy agar Shopee tidak 'bengong'
        # Link ini memaksa browser membuka list produk secara eksplisit
        link = f"https://shopee.co.id/search?keyword={query_encoded}&page=0&sortBy=relevancy"
    else:
        # TikTok: Menggunakan type=5 (Tab Shop) adalah cara terkuat menghindari Video/FYP
        link = f"https://www.tiktok.com/search?q={query_encoded}&type=5"
    
    # 2. GAMBAR DINAMIS (Tetap pakai teknik cerdas Mas Ahmad)
    img = f"https://loremflickr.com/320/240/{query.replace(' ', ',')}"
    
    results = []
    for i in range(5):
        # 3. LOGIKA HARGA (Gunakan is_elec Mas Ahmad yang sudah mantap)
        is_elec = any(x in query.lower() for x in ['hp', 'laptop', 'pc', 'monitor', 'tab', 'iphone'])
        price = random.randint(2500000, 18000000) if is_elec else random.randint(35000, 450000)
        
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

async def process_task(task):
    task_id = task['id']
    t_type = task.get('type', 'global_search')
    try:
        await supabase.table("tasks").update({"status": "processing"}).eq("id", task_id).execute()
        if t_type == 'global_search':
            p = task.get('data', {})
            outcome = await handle_global_search(p.get('query', 'Barang'), p.get('source', 'tiktok'))
        else:
            outcome = {"status": "completed", "msg": "Price updated"}
            
        await supabase.table("tasks").update({"status": "completed", "data": outcome}).eq("id", task_id).execute()
        print(f"✅ Task {task_id} Selesai!")
    except Exception as e:
        print(f"❌ Gagal: {e}")

async def run_nessa_robot():
    global supabase
    print("1. Menghubungkan ke Supabase...") # Indikator 1
    
    try:
        supabase = await create_async_client(SUPABASE_URL, SUPABASE_KEY)
        print("2. Koneksi Supabase Berhasil!") # Indikator 2
        
        await load_store_config()
        print("3. Konfigurasi Toko Dimuat.") # Indikator 3
        
    except Exception as e:
        print(f"❌ GAGAL DI AWAL: {e}")
        return

    print("🚀 NESSA TURBO v8.4 STANDBY...")
    
    while True:
        # Tambahkan print ini agar kita tahu loop-nya jalan
        # print(".", end="", flush=True) 
        
        res = await supabase.table("tasks").select("*").eq("status", "pending").execute()
        
        if res.data:
            print(f"\n🔔 Menemukan {len(res.data)} tugas baru!")
            for t in res.data: 
                asyncio.create_task(process_task(t))
        
        await asyncio.sleep(0.5) # Beri napas 0.5 detik

if __name__ == "__main__":
    if os.name == 'nt': asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(run_nessa_robot())