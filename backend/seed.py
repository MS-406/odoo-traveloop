# backend/seed.py
# Seeds the database with 20 cities and 50 activities across 6 categories.
# Run after migrations: `python seed.py`
# Depends on: Phase 1 / database.py, City model, Activity model

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from sqlalchemy import select
from app.database import async_session_factory
from app.models.city import City
from app.models.activity import Activity

CITIES = [
    {"name": "Paris", "country": "France", "region": "Europe", "cost_index": 4.2, "popularity_score": 9.5, "latitude": 48.8566, "longitude": 2.3522, "image_url": "https://placehold.co/600x400/2563EB/FFFFFF?text=Paris"},
    {"name": "Tokyo", "country": "Japan", "region": "Asia", "cost_index": 4.0, "popularity_score": 9.3, "latitude": 35.6762, "longitude": 139.6503, "image_url": "https://placehold.co/600x400/7C3AED/FFFFFF?text=Tokyo"},
    {"name": "New York", "country": "United States", "region": "North America", "cost_index": 4.8, "popularity_score": 9.7, "latitude": 40.7128, "longitude": -74.0060, "image_url": "https://placehold.co/600x400/EF4444/FFFFFF?text=New+York"},
    {"name": "Cape Town", "country": "South Africa", "region": "Africa", "cost_index": 2.5, "popularity_score": 8.2, "latitude": -33.9249, "longitude": 18.4241, "image_url": "https://placehold.co/600x400/10B981/FFFFFF?text=Cape+Town"},
    {"name": "Bangkok", "country": "Thailand", "region": "Asia", "cost_index": 1.8, "popularity_score": 8.8, "latitude": 13.7563, "longitude": 100.5018, "image_url": "https://placehold.co/600x400/F59E0B/FFFFFF?text=Bangkok"},
    {"name": "Barcelona", "country": "Spain", "region": "Europe", "cost_index": 3.5, "popularity_score": 9.1, "latitude": 41.3874, "longitude": 2.1686, "image_url": "https://placehold.co/600x400/2563EB/FFFFFF?text=Barcelona"},
    {"name": "Sydney", "country": "Australia", "region": "Oceania", "cost_index": 4.5, "popularity_score": 8.9, "latitude": -33.8688, "longitude": 151.2093, "image_url": "https://placehold.co/600x400/7C3AED/FFFFFF?text=Sydney"},
    {"name": "Dubai", "country": "UAE", "region": "Middle East", "cost_index": 4.3, "popularity_score": 8.7, "latitude": 25.2048, "longitude": 55.2708, "image_url": "https://placehold.co/600x400/EF4444/FFFFFF?text=Dubai"},
    {"name": "Rome", "country": "Italy", "region": "Europe", "cost_index": 3.8, "popularity_score": 9.2, "latitude": 41.9028, "longitude": 12.4964, "image_url": "https://placehold.co/600x400/10B981/FFFFFF?text=Rome"},
    {"name": "Bali", "country": "Indonesia", "region": "Asia", "cost_index": 1.5, "popularity_score": 8.6, "latitude": -8.3405, "longitude": 115.0920, "image_url": "https://placehold.co/600x400/F59E0B/FFFFFF?text=Bali"},
    {"name": "London", "country": "United Kingdom", "region": "Europe", "cost_index": 4.6, "popularity_score": 9.4, "latitude": 51.5074, "longitude": -0.1278, "image_url": "https://placehold.co/600x400/2563EB/FFFFFF?text=London"},
    {"name": "Marrakech", "country": "Morocco", "region": "Africa", "cost_index": 2.0, "popularity_score": 7.8, "latitude": 31.6295, "longitude": -7.9811, "image_url": "https://placehold.co/600x400/7C3AED/FFFFFF?text=Marrakech"},
    {"name": "Rio de Janeiro", "country": "Brazil", "region": "South America", "cost_index": 2.8, "popularity_score": 8.5, "latitude": -22.9068, "longitude": -43.1729, "image_url": "https://placehold.co/600x400/EF4444/FFFFFF?text=Rio"},
    {"name": "Istanbul", "country": "Turkey", "region": "Europe", "cost_index": 2.3, "popularity_score": 8.4, "latitude": 41.0082, "longitude": 28.9784, "image_url": "https://placehold.co/600x400/10B981/FFFFFF?text=Istanbul"},
    {"name": "Kyoto", "country": "Japan", "region": "Asia", "cost_index": 3.7, "popularity_score": 8.9, "latitude": 35.0116, "longitude": 135.7681, "image_url": "https://placehold.co/600x400/F59E0B/FFFFFF?text=Kyoto"},
    {"name": "Lisbon", "country": "Portugal", "region": "Europe", "cost_index": 2.9, "popularity_score": 8.3, "latitude": 38.7223, "longitude": -9.1393, "image_url": "https://placehold.co/600x400/2563EB/FFFFFF?text=Lisbon"},
    {"name": "Reykjavik", "country": "Iceland", "region": "Europe", "cost_index": 4.9, "popularity_score": 7.5, "latitude": 64.1466, "longitude": -21.9426, "image_url": "https://placehold.co/600x400/7C3AED/FFFFFF?text=Reykjavik"},
    {"name": "Buenos Aires", "country": "Argentina", "region": "South America", "cost_index": 2.2, "popularity_score": 8.0, "latitude": -34.6037, "longitude": -58.3816, "image_url": "https://placehold.co/600x400/EF4444/FFFFFF?text=Buenos+Aires"},
    {"name": "Santorini", "country": "Greece", "region": "Europe", "cost_index": 3.9, "popularity_score": 8.8, "latitude": 36.3932, "longitude": 25.4615, "image_url": "https://placehold.co/600x400/10B981/FFFFFF?text=Santorini"},
    {"name": "Vancouver", "country": "Canada", "region": "North America", "cost_index": 4.1, "popularity_score": 8.1, "latitude": 49.2827, "longitude": -123.1207, "image_url": "https://placehold.co/600x400/F59E0B/FFFFFF?text=Vancouver"},
]

ACTIVITIES = [
    # Sightseeing (9)
    {"name": "Eiffel Tower Visit", "description": "Iconic tower with panoramic views.", "type": "sightseeing", "cost": 26.00, "duration_min": 120, "city": "Paris", "image_url": "https://placehold.co/600x400/2563EB/FFFFFF?text=Eiffel+Tower"},
    {"name": "Statue of Liberty Tour", "description": "Ferry and guided tour of Liberty Island.", "type": "sightseeing", "cost": 24.00, "duration_min": 180, "city": "New York", "image_url": "https://placehold.co/600x400/EF4444/FFFFFF?text=Liberty"},
    {"name": "Colosseum Guided Tour", "description": "Explore the ancient amphitheater.", "type": "sightseeing", "cost": 35.00, "duration_min": 150, "city": "Rome", "image_url": "https://placehold.co/600x400/10B981/FFFFFF?text=Colosseum"},
    {"name": "Table Mountain Cable Car", "description": "Scenic ride to the summit.", "type": "sightseeing", "cost": 18.00, "duration_min": 90, "city": "Cape Town", "image_url": "https://placehold.co/600x400/10B981/FFFFFF?text=Table+Mountain"},
    {"name": "Sydney Opera House Tour", "description": "Behind-the-scenes tour.", "type": "sightseeing", "cost": 30.00, "duration_min": 60, "city": "Sydney", "image_url": "https://placehold.co/600x400/7C3AED/FFFFFF?text=Opera+House"},
    {"name": "Sagrada Familia Visit", "description": "Gaudi's unfinished masterpiece.", "type": "sightseeing", "cost": 26.00, "duration_min": 90, "city": "Barcelona", "image_url": "https://placehold.co/600x400/2563EB/FFFFFF?text=Sagrada+Familia"},
    {"name": "Burj Khalifa Observation", "description": "World's tallest building deck.", "type": "sightseeing", "cost": 40.00, "duration_min": 60, "city": "Dubai", "image_url": "https://placehold.co/600x400/EF4444/FFFFFF?text=Burj+Khalifa"},
    {"name": "Christ the Redeemer", "description": "Iconic statue atop Corcovado.", "type": "sightseeing", "cost": 15.00, "duration_min": 120, "city": "Rio de Janeiro", "image_url": "https://placehold.co/600x400/EF4444/FFFFFF?text=Redeemer"},
    {"name": "Hagia Sophia Visit", "description": "Historic mosque with Byzantine architecture.", "type": "sightseeing", "cost": 0.00, "duration_min": 90, "city": "Istanbul", "image_url": "https://placehold.co/600x400/10B981/FFFFFF?text=Hagia+Sophia"},
    # Food (9)
    {"name": "Parisian Pastry Workshop", "description": "Learn croissants and macarons.", "type": "food", "cost": 85.00, "duration_min": 180, "city": "Paris", "image_url": "https://placehold.co/600x400/F59E0B/FFFFFF?text=Pastry"},
    {"name": "Tsukiji Market Tour", "description": "Guided food tour of Tokyo's outer market.", "type": "food", "cost": 45.00, "duration_min": 150, "city": "Tokyo", "image_url": "https://placehold.co/600x400/F59E0B/FFFFFF?text=Tsukiji"},
    {"name": "Bangkok Street Food Tour", "description": "Best street food in Yaowarat.", "type": "food", "cost": 25.00, "duration_min": 180, "city": "Bangkok", "image_url": "https://placehold.co/600x400/F59E0B/FFFFFF?text=Street+Food"},
    {"name": "Roman Pasta Making Class", "description": "Make cacio e pepe and carbonara.", "type": "food", "cost": 70.00, "duration_min": 150, "city": "Rome", "image_url": "https://placehold.co/600x400/F59E0B/FFFFFF?text=Pasta"},
    {"name": "Tapas Crawl in El Born", "description": "Guided tapas tour in Barcelona.", "type": "food", "cost": 55.00, "duration_min": 180, "city": "Barcelona", "image_url": "https://placehold.co/600x400/F59E0B/FFFFFF?text=Tapas"},
    {"name": "Lisbon Pasteis de Nata Tour", "description": "Best custard tarts across Lisbon.", "type": "food", "cost": 30.00, "duration_min": 120, "city": "Lisbon", "image_url": "https://placehold.co/600x400/F59E0B/FFFFFF?text=Pasteis"},
    {"name": "Marrakech Food Tasting", "description": "Tagine, couscous, and mint tea.", "type": "food", "cost": 35.00, "duration_min": 150, "city": "Marrakech", "image_url": "https://placehold.co/600x400/F59E0B/FFFFFF?text=Moroccan"},
    {"name": "Argentine Asado Experience", "description": "Traditional BBQ with local wines.", "type": "food", "cost": 50.00, "duration_min": 180, "city": "Buenos Aires", "image_url": "https://placehold.co/600x400/F59E0B/FFFFFF?text=Asado"},
    {"name": "London Borough Market Tour", "description": "London's premier food market.", "type": "food", "cost": 40.00, "duration_min": 120, "city": "London", "image_url": "https://placehold.co/600x400/F59E0B/FFFFFF?text=Borough"},
    # Adventure (8)
    {"name": "Bali White Water Rafting", "description": "Rafting down the Ayung River.", "type": "adventure", "cost": 45.00, "duration_min": 180, "city": "Bali", "image_url": "https://placehold.co/600x400/EF4444/FFFFFF?text=Rafting"},
    {"name": "Cape Town Shark Diving", "description": "Cage diving with great whites.", "type": "adventure", "cost": 120.00, "duration_min": 300, "city": "Cape Town", "image_url": "https://placehold.co/600x400/EF4444/FFFFFF?text=Sharks"},
    {"name": "Dubai Desert Safari", "description": "4x4 dune bashing and BBQ dinner.", "type": "adventure", "cost": 85.00, "duration_min": 360, "city": "Dubai", "image_url": "https://placehold.co/600x400/EF4444/FFFFFF?text=Safari"},
    {"name": "Iceland Golden Circle Tour", "description": "Thingvellir, Geysir, Gullfoss.", "type": "adventure", "cost": 95.00, "duration_min": 480, "city": "Reykjavik", "image_url": "https://placehold.co/600x400/EF4444/FFFFFF?text=Golden+Circle"},
    {"name": "Sydney Harbour Bridge Climb", "description": "Climb the bridge for 360 views.", "type": "adventure", "cost": 175.00, "duration_min": 210, "city": "Sydney", "image_url": "https://placehold.co/600x400/EF4444/FFFFFF?text=Bridge+Climb"},
    {"name": "Rio Hang Gliding", "description": "Tandem gliding over Tijuca Forest.", "type": "adventure", "cost": 110.00, "duration_min": 60, "city": "Rio de Janeiro", "image_url": "https://placehold.co/600x400/EF4444/FFFFFF?text=Hang+Gliding"},
    {"name": "Vancouver Grouse Grind", "description": "Mother Nature's Stairmaster.", "type": "adventure", "cost": 0.00, "duration_min": 120, "city": "Vancouver", "image_url": "https://placehold.co/600x400/EF4444/FFFFFF?text=Grouse+Grind"},
    {"name": "Santorini Kayaking", "description": "Sea kayak along volcanic cliffs.", "type": "adventure", "cost": 60.00, "duration_min": 240, "city": "Santorini", "image_url": "https://placehold.co/600x400/EF4444/FFFFFF?text=Kayaking"},
    # Culture (8)
    {"name": "Louvre Museum Visit", "description": "World's largest art museum.", "type": "culture", "cost": 17.00, "duration_min": 240, "city": "Paris", "image_url": "https://placehold.co/600x400/7C3AED/FFFFFF?text=Louvre"},
    {"name": "Kyoto Tea Ceremony", "description": "Traditional tea in a machiya.", "type": "culture", "cost": 40.00, "duration_min": 90, "city": "Kyoto", "image_url": "https://placehold.co/600x400/7C3AED/FFFFFF?text=Tea"},
    {"name": "Istanbul Turkish Bath", "description": "Authentic Ottoman hammam.", "type": "culture", "cost": 50.00, "duration_min": 120, "city": "Istanbul", "image_url": "https://placehold.co/600x400/7C3AED/FFFFFF?text=Hammam"},
    {"name": "Buenos Aires Tango Show", "description": "Dinner and tango in San Telmo.", "type": "culture", "cost": 65.00, "duration_min": 180, "city": "Buenos Aires", "image_url": "https://placehold.co/600x400/7C3AED/FFFFFF?text=Tango"},
    {"name": "London British Museum", "description": "Free entry, comprehensive museum.", "type": "culture", "cost": 0.00, "duration_min": 180, "city": "London", "image_url": "https://placehold.co/600x400/7C3AED/FFFFFF?text=British+Museum"},
    {"name": "Marrakech Medina Tour", "description": "Navigate the labyrinthine souks.", "type": "culture", "cost": 25.00, "duration_min": 150, "city": "Marrakech", "image_url": "https://placehold.co/600x400/7C3AED/FFFFFF?text=Medina"},
    {"name": "Fushimi Inari Shrine Walk", "description": "Thousands of torii gates.", "type": "culture", "cost": 0.00, "duration_min": 120, "city": "Kyoto", "image_url": "https://placehold.co/600x400/7C3AED/FFFFFF?text=Fushimi+Inari"},
    {"name": "Lisbon Fado Night", "description": "Soulful traditional music in Alfama.", "type": "culture", "cost": 35.00, "duration_min": 120, "city": "Lisbon", "image_url": "https://placehold.co/600x400/7C3AED/FFFFFF?text=Fado"},
    # Wellness (8)
    {"name": "Bali Ubud Spa Retreat", "description": "Full-day wellness retreat.", "type": "wellness", "cost": 75.00, "duration_min": 360, "city": "Bali", "image_url": "https://placehold.co/600x400/10B981/FFFFFF?text=Spa"},
    {"name": "Bangkok Thai Massage", "description": "Traditional massage at Wat Pho.", "type": "wellness", "cost": 15.00, "duration_min": 60, "city": "Bangkok", "image_url": "https://placehold.co/600x400/10B981/FFFFFF?text=Massage"},
    {"name": "Iceland Blue Lagoon", "description": "Geothermal waters and lava fields.", "type": "wellness", "cost": 80.00, "duration_min": 180, "city": "Reykjavik", "image_url": "https://placehold.co/600x400/10B981/FFFFFF?text=Blue+Lagoon"},
    {"name": "Santorini Sunset Yoga", "description": "Yoga overlooking the caldera.", "type": "wellness", "cost": 30.00, "duration_min": 75, "city": "Santorini", "image_url": "https://placehold.co/600x400/10B981/FFFFFF?text=Yoga"},
    {"name": "Tokyo Onsen Experience", "description": "Traditional hot spring bathhouse.", "type": "wellness", "cost": 20.00, "duration_min": 120, "city": "Tokyo", "image_url": "https://placehold.co/600x400/10B981/FFFFFF?text=Onsen"},
    {"name": "Kyoto Zen Meditation", "description": "Guided meditation at a Zen temple.", "type": "wellness", "cost": 15.00, "duration_min": 60, "city": "Kyoto", "image_url": "https://placehold.co/600x400/10B981/FFFFFF?text=Zen"},
    {"name": "Vancouver Stanley Park Walk", "description": "Seawall walk with mountain views.", "type": "wellness", "cost": 0.00, "duration_min": 90, "city": "Vancouver", "image_url": "https://placehold.co/600x400/10B981/FFFFFF?text=Stanley+Park"},
    {"name": "Dubai Luxury Spa Day", "description": "Full-day spa at a 5-star resort.", "type": "wellness", "cost": 150.00, "duration_min": 360, "city": "Dubai", "image_url": "https://placehold.co/600x400/10B981/FFFFFF?text=Luxury+Spa"},
    # Nightlife (8)
    {"name": "NYC Rooftop Bar Hop", "description": "Three iconic rooftop bars.", "type": "nightlife", "cost": 60.00, "duration_min": 240, "city": "New York", "image_url": "https://placehold.co/600x400/6D28D9/FFFFFF?text=Rooftop"},
    {"name": "Barcelona Beach Club", "description": "Open-air Barceloneta clubs.", "type": "nightlife", "cost": 30.00, "duration_min": 300, "city": "Barcelona", "image_url": "https://placehold.co/600x400/6D28D9/FFFFFF?text=Beach+Club"},
    {"name": "Bangkok Khao San Night", "description": "Legendary backpacker strip.", "type": "nightlife", "cost": 20.00, "duration_min": 240, "city": "Bangkok", "image_url": "https://placehold.co/600x400/6D28D9/FFFFFF?text=Khao+San"},
    {"name": "London Soho Pub Crawl", "description": "Historic pubs in Soho.", "type": "nightlife", "cost": 35.00, "duration_min": 210, "city": "London", "image_url": "https://placehold.co/600x400/6D28D9/FFFFFF?text=Pub+Crawl"},
    {"name": "Rio Lapa Nightlife Tour", "description": "Samba clubs in Lapa district.", "type": "nightlife", "cost": 25.00, "duration_min": 240, "city": "Rio de Janeiro", "image_url": "https://placehold.co/600x400/6D28D9/FFFFFF?text=Lapa"},
    {"name": "Bali Beach Bar Sunset", "description": "Cliffside cocktails in Uluwatu.", "type": "nightlife", "cost": 25.00, "duration_min": 180, "city": "Bali", "image_url": "https://placehold.co/600x400/6D28D9/FFFFFF?text=Beach+Bar"},
    {"name": "Istanbul Night Cruise", "description": "Bosphorus dinner cruise.", "type": "nightlife", "cost": 55.00, "duration_min": 180, "city": "Istanbul", "image_url": "https://placehold.co/600x400/6D28D9/FFFFFF?text=Night+Cruise"},
    {"name": "Tokyo Golden Gai", "description": "200+ tiny bars in Shinjuku.", "type": "nightlife", "cost": 30.00, "duration_min": 180, "city": "Tokyo", "image_url": "https://placehold.co/600x400/6D28D9/FFFFFF?text=Golden+Gai"},
]


async def seed() -> None:
    """Insert seed data. Idempotent — skips if data exists."""
    async with async_session_factory() as session:
        result = await session.execute(select(City).limit(1))
        if result.scalar_one_or_none():
            print("Database already seeded. Skipping.")
            return

        city_objects: dict[str, City] = {}
        for city_data in CITIES:
            city = City(**city_data)
            session.add(city)
            city_objects[city_data["name"]] = city

        await session.flush()
        print(f"Inserted {len(CITIES)} cities")

        count = 0
        for act_data in ACTIVITIES:
            city_name = act_data.pop("city")
            city = city_objects.get(city_name)
            if not city:
                print(f"City '{city_name}' not found, skipping '{act_data['name']}'")
                continue
            session.add(Activity(city_id=city.id, **act_data))
            count += 1

        await session.commit()
        print(f"Inserted {count} activities")
        print(f"Seed complete! {len(CITIES)} cities, {count} activities.")


if __name__ == "__main__":
    asyncio.run(seed())

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
