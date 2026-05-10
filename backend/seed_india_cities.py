# backend/seed_india_cities.py
# Imports India cities/towns from the GeoNames cities500 export.
# Run from backend/: python seed_india_cities.py

import asyncio
import csv
import io
import math
import sys
import urllib.parse
import urllib.request
import zipfile
from pathlib import Path

from sqlalchemy import select

sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.database import async_session_factory
from app.models.city import City


GEONAMES_CITIES500_URL = "https://download.geonames.org/export/dump/cities500.zip"
GEONAMES_ADMIN1_URL = "https://download.geonames.org/export/dump/admin1CodesASCII.txt"
COUNTRY_CODE = "IN"
COUNTRY_NAME = "India"


METRO_COST_OVERRIDES = {
    "Mumbai": 4.2,
    "Delhi": 3.9,
    "New Delhi": 3.9,
    "Bengaluru": 3.8,
    "Bangalore": 3.8,
    "Hyderabad": 3.4,
    "Chennai": 3.4,
    "Pune": 3.5,
    "Gurugram": 4.0,
    "Gurgaon": 4.0,
    "Noida": 3.4,
    "Kolkata": 2.9,
    "Ahmedabad": 2.8,
    "Jaipur": 2.7,
    "Goa": 3.6,
}


def fetch_text(url: str) -> str:
    with urllib.request.urlopen(url, timeout=90) as response:
        return response.read().decode("utf-8")


def fetch_zip_member(url: str, member_name: str) -> str:
    with urllib.request.urlopen(url, timeout=120) as response:
        data = response.read()
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        with archive.open(member_name) as member:
            return member.read().decode("utf-8")


def load_admin1_names() -> dict[str, str]:
    """Return India admin1 code -> state/UT name from GeoNames metadata."""
    admin_map: dict[str, str] = {}
    for row in csv.reader(io.StringIO(fetch_text(GEONAMES_ADMIN1_URL)), delimiter="\t"):
        if len(row) < 2:
            continue
        code, name = row[0], row[1]
        if code.startswith(f"{COUNTRY_CODE}."):
            admin_map[code.split(".", 1)[1]] = name[:100]
    return admin_map


def popularity_score(population: int, feature_code: str) -> float:
    if population <= 0:
        score = 3.0
    else:
        score = 3.0 + min(5.8, math.log10(population + 1))
    if feature_code == "PPLC":
        score += 1.0
    elif feature_code.startswith("PPLA"):
        score += 0.5
    return round(min(score, 9.8), 1)


def cost_index(name: str, population: int) -> float:
    if name in METRO_COST_OVERRIDES:
        return METRO_COST_OVERRIDES[name]
    if population >= 5_000_000:
        return 3.6
    if population >= 1_000_000:
        return 3.1
    if population >= 250_000:
        return 2.6
    if population >= 50_000:
        return 2.1
    return 1.6


def image_url(name: str) -> str:
    query = urllib.parse.quote(f"{name},India,city,travel")
    return f"https://loremflickr.com/800/600/{query}/all"


def parse_india_cities(admin1_names: dict[str, str]) -> list[dict]:
    """Parse GeoNames cities500 and return unique India populated places."""
    text = fetch_zip_member(GEONAMES_CITIES500_URL, "cities500.txt")
    seen: set[tuple[str, str]] = set()
    cities: list[dict] = []

    for row in csv.reader(io.StringIO(text), delimiter="\t"):
        if len(row) < 19:
            continue

        name = row[1].strip()
        latitude = row[4]
        longitude = row[5]
        feature_class = row[6]
        feature_code = row[7]
        country_code = row[8]
        admin1_code = row[10]
        population = int(row[14] or 0)

        if country_code != COUNTRY_CODE or feature_class != "P" or not name:
            continue

        region = admin1_names.get(admin1_code, "India")
        key = (name.lower(), region.lower())
        if key in seen:
            continue
        seen.add(key)

        cities.append(
            {
                "name": name[:100],
                "country": COUNTRY_NAME,
                "region": region,
                "cost_index": cost_index(name, population),
                "popularity_score": popularity_score(population, feature_code),
                "latitude": float(latitude),
                "longitude": float(longitude),
                "image_url": image_url(name),
            }
        )

    cities.sort(key=lambda c: (c["region"] or "", c["name"]))
    return cities


async def seed_india_cities() -> None:
    admin1_names = load_admin1_names()
    cities = parse_india_cities(admin1_names)

    async with async_session_factory() as session:
        result = await session.execute(select(City).where(City.country == COUNTRY_NAME))
        existing = {
            (city.name.lower(), (city.region or "").lower()): city
            for city in result.scalars().all()
        }

        inserted = 0
        updated = 0

        for city_data in cities:
            key = (city_data["name"].lower(), (city_data["region"] or "").lower())
            city = existing.get(key)
            if city:
                for field, value in city_data.items():
                    setattr(city, field, value)
                updated += 1
            else:
                session.add(City(**city_data))
                inserted += 1

        await session.commit()
        print(
            f"India city import complete: {inserted} inserted, {updated} updated, "
            f"{len(cities)} total from GeoNames cities500."
        )


if __name__ == "__main__":
    asyncio.run(seed_india_cities())

