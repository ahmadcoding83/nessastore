import os
import re
import time
import requests
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv(".env.admin")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY or "your-project-id" in SUPABASE_URL:
    print("Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured correctly in .env.admin.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def extract_price_shopee(url):
    """
    Mock function for Shopee price fetching.
    In real world, you might need Selenium or an API.
    """
    print(f"Scraping Shopee: {url}")
    # Simulate a price fetch
    return 150000 + (int(time.time()) % 5000)

def extract_price_tiktok(url):
    print(f"Scraping TikTok: {url}")
    return 145000 + (int(time.time()) % 10000)

def extract_price_tokopedia(url):
    print(f"Scraping Tokopedia: {url}")
    return 160000

def extract_price_lazada(url):
    print(f"Scraping Lazada: {url}")
    return 155000

def update_smart_prices():
    # Fetch products with is_smart_price enabled
    res = supabase.table("products").select("*").eq("is_smart_price", True).execute()
    products = res.data

    if not products:
        print("No smart price products found.")
        return

    for product in products:
        link = product.get("affiliate_link") or product.get("supplier_link")
        source = product.get("marketplace_source", "").lower()
        
        if not link:
            continue

        new_price = None
        
        # Detection logic
        if "shopee.co.id" in link or source == "shopee":
            new_price = extract_price_shopee(link)
        elif "tiktok.com" in link or source == "tiktok":
            new_price = extract_price_tiktok(link)
        elif "tokopedia.com" in link or source == "tokopedia":
            new_price = extract_price_tokopedia(link)
        elif "lazada.co.id" in link or source == "lazada":
            new_price = extract_price_lazada(link)

        if new_price:
            print(f"Updating {product['name']} to Rp{new_price}")
            supabase.table("products").update({
                "price": new_price,
                "last_updated_at": "now()"
            }).eq("id", product["id"]).execute()

if __name__ == "__main__":
    print("Starting Smart Price Engine...")
    update_smart_prices()
    print("Update complete.")
