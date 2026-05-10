import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select
from app.database import async_session_factory
from app.models.city import City
from app.models.activity import Activity

# We can import CITIES and ACTIVITIES from seed.py if we want, 
# but let's just hardcode the logic to update based on the seed.py data.

async def update_images():
    # We'll just run the logic from seed.py but with updates
    from seed import CITIES, ACTIVITIES
    
    async with async_session_factory() as session:
        # Update Cities
        result = await session.execute(select(City))
        existing_cities = {c.name: c for c in result.scalars().all()}
        
        city_map = {}
        for city_data in CITIES:
            name = city_data["name"]
            if name in existing_cities:
                city = existing_cities[name]
                city.image_url = city_data["image_url"]
                city_map[name] = city.id
                print(f"Updated image for city: {name}")
            else:
                # If city doesn't exist, we could add it, but for now let's focus on updates
                pass
        
        # Update Activities
        result = await session.execute(select(Activity))
        existing_activities = {a.name: a for a in result.scalars().all()}
        
        for act_data in ACTIVITIES:
            name = act_data["name"]
            if name in existing_activities:
                act = existing_activities[name]
                act.image_url = act_data["image_url"]
                print(f"Updated image for activity: {name}")
                
        await session.commit()
        print("Image updates committed.")

if __name__ == "__main__":
    asyncio.run(update_images())
