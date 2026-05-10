import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import delete
from app.database import async_session_factory
from app.models.city import City
from app.models.activity import Activity

async def wipe():
    async with async_session_factory() as session:
        await session.execute(delete(Activity))
        await session.execute(delete(City))
        await session.commit()
        print("Wiped cities and activities")

if __name__ == "__main__":
    asyncio.run(wipe())
