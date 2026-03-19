import os, asyncio, json
from supabase import create_async_client
from dotenv import load_dotenv

load_dotenv('.env')
URL = os.environ.get('VITE_SUPABASE_URL')
KEY = os.environ.get('VITE_SUPABASE_ANON_KEY')

async def debug_tasks():
    sb = await create_async_client(URL, KEY)
    res = await sb.table('tasks').select('*').order('created_at', desc=True).limit(20).execute()
    for row in res.data:
        t_id = row['id'][:5]
        t_type = row.get('type')
        status = row.get('status')
        data = row.get('data', {})
        print(f"{t_id} | {t_type} | {status} | {json.dumps(data)}")

asyncio.run(debug_tasks())
