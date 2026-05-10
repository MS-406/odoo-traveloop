import asyncio
from app.database import async_engine
from sqlalchemy import text

async def promote():
    async with async_engine.begin() as conn:
        await conn.execute(text("UPDATE users SET is_admin = true WHERE email = 'admin@traveloop.com'"))
        result = await conn.execute(text("SELECT id, email, is_admin FROM users WHERE email = 'admin@traveloop.com'"))
        row = result.fetchone()
        print(f"Admin promoted: id={row[0]}, email={row[1]}, is_admin={row[2]}")

asyncio.run(promote())
