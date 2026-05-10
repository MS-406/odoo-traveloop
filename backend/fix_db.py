# backend/fix_db.py
# One-time script to fix: 1) invite_code column too short, 2) broken image URLs.
# Run: python fix_db.py

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from sqlalchemy import text
from app.database import async_session_factory

# ── Unsplash image URLs (free, reliable, no API key needed) ──────────

CITY_IMAGES = {
    "Paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop",
    "Tokyo": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop",
    "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop",
    "Cape Town": "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&h=600&fit=crop",
    "Bangkok": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=600&fit=crop",
    "Barcelona": "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=600&fit=crop",
    "Sydney": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=600&fit=crop",
    "Dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop",
    "Rome": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop",
    "Bali": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop",
    "London": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop",
    "Marrakech": "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&h=600&fit=crop",
    "Rio de Janeiro": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=600&fit=crop",
    "Istanbul": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=600&fit=crop",
    "Kyoto": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop",
    "Lisbon": "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&h=600&fit=crop",
    "Reykjavik": "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800&h=600&fit=crop",
    "Buenos Aires": "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&h=600&fit=crop",
    "Santorini": "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&h=600&fit=crop",
    "Vancouver": "https://images.unsplash.com/photo-1559511260-66a68e7cd3e6?w=800&h=600&fit=crop",
}

ACTIVITY_IMAGES = {
    "Eiffel Tower Visit": "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=800&h=600&fit=crop",
    "Statue of Liberty Tour": "https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?w=800&h=600&fit=crop",
    "Colosseum Guided Tour": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop",
    "Table Mountain Cable Car": "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&h=600&fit=crop",
    "Sydney Opera House Tour": "https://images.unsplash.com/photo-1523059623039-a9ed027e7fad?w=800&h=600&fit=crop",
    "Sagrada Familia Visit": "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=600&fit=crop",
    "Burj Khalifa Observation": "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?w=800&h=600&fit=crop",
    "Christ the Redeemer": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=600&fit=crop",
    "Hagia Sophia Visit": "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&h=600&fit=crop",
    "Parisian Pastry Workshop": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop",
    "Tsukiji Market Tour": "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=600&fit=crop",
    "Bangkok Street Food Tour": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
    "Roman Pasta Making Class": "https://images.unsplash.com/photo-1556761223-4c4282c73f77?w=800&h=600&fit=crop",
    "Tapas Crawl in El Born": "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=800&h=600&fit=crop",
    "Lisbon Pasteis de Nata Tour": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&h=600&fit=crop",
    "Marrakech Food Tasting": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&h=600&fit=crop",
    "Argentine Asado Experience": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop",
    "London Borough Market Tour": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
    "Bali White Water Rafting": "https://images.unsplash.com/photo-1530866495561-507c83d09019?w=800&h=600&fit=crop",
    "Cape Town Shark Diving": "https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=800&h=600&fit=crop",
    "Dubai Desert Safari": "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=800&h=600&fit=crop",
    "Iceland Golden Circle Tour": "https://images.unsplash.com/photo-1520769945061-0a448c463865?w=800&h=600&fit=crop",
    "Sydney Harbour Bridge Climb": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=600&fit=crop",
    "Rio Hang Gliding": "https://images.unsplash.com/photo-1534560261-a0008e0c97d0?w=800&h=600&fit=crop",
    "Vancouver Grouse Grind": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop",
    "Santorini Kayaking": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
    "Louvre Museum Visit": "https://images.unsplash.com/photo-1499426600726-ac29cbd9cf38?w=800&h=600&fit=crop",
    "Kyoto Tea Ceremony": "https://images.unsplash.com/photo-1545048702-79362596cdc9?w=800&h=600&fit=crop",
    "Istanbul Turkish Bath": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=600&fit=crop",
    "Buenos Aires Tango Show": "https://images.unsplash.com/photo-1545989253-02cc26577f88?w=800&h=600&fit=crop",
    "London British Museum": "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800&h=600&fit=crop",
    "Marrakech Medina Tour": "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&h=600&fit=crop",
    "Fushimi Inari Shrine Walk": "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800&h=600&fit=crop",
    "Lisbon Fado Night": "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&h=600&fit=crop",
    "Bali Ubud Spa Retreat": "https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=800&h=600&fit=crop",
    "Bangkok Thai Massage": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=600&fit=crop",
    "Iceland Blue Lagoon": "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800&h=600&fit=crop",
    "Santorini Sunset Yoga": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop",
    "Tokyo Onsen Experience": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop",
    "Kyoto Zen Meditation": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop",
    "Vancouver Stanley Park Walk": "https://images.unsplash.com/photo-1559511260-66a68e7cd3e6?w=800&h=600&fit=crop",
    "Dubai Luxury Spa Day": "https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=800&h=600&fit=crop",
    "NYC Rooftop Bar Hop": "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop",
    "Barcelona Beach Club": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
    "Bangkok Khao San Night": "https://images.unsplash.com/photo-1519214605650-76a613ee3245?w=800&h=600&fit=crop",
    "London Soho Pub Crawl": "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&h=600&fit=crop",
    "Rio Lapa Nightlife Tour": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop",
    "Bali Beach Bar Sunset": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
    "Istanbul Night Cruise": "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800&h=600&fit=crop",
    "Tokyo Golden Gai": "https://images.unsplash.com/photo-1554797589-7241bb691973?w=800&h=600&fit=crop",
}


async def fix():
    async with async_session_factory() as session:
        # Fix 1: Widen invite_code column from VARCHAR(12) to VARCHAR(16)
        await session.execute(text("ALTER TABLE collaborative_trips ALTER COLUMN invite_code TYPE VARCHAR(16)"))
        print("[OK] invite_code column widened to VARCHAR(16)")

        # Fix 2: Update city images
        for name, url in CITY_IMAGES.items():
            await session.execute(
                text("UPDATE cities SET image_url = :url WHERE name = :name"),
                {"url": url, "name": name}
            )
        print(f"[OK] Updated {len(CITY_IMAGES)} city images")

        # Fix 3: Update activity images
        for name, url in ACTIVITY_IMAGES.items():
            await session.execute(
                text("UPDATE activities SET image_url = :url WHERE name = :name"),
                {"url": url, "name": name}
            )
        print(f"[OK] Updated {len(ACTIVITY_IMAGES)} activity images")

        await session.commit()
        print("[DONE] All fixes committed!")


if __name__ == "__main__":
    asyncio.run(fix())
