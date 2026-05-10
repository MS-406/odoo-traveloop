import urllib.request
import json
import re

CITIES = [
    "Paris", "Tokyo", "New York", "Cape Town", "Bangkok",
    "Barcelona", "Sydney", "Dubai", "Rome", "Bali",
    "London", "Marrakech", "Rio de Janeiro", "Istanbul", "Kyoto",
    "Lisbon", "Reykjavik", "Buenos Aires", "Santorini", "Vancouver"
]

ACTIVITIES = [
    ("Paris", "Eiffel Tower"), ("New York", "Statue of Liberty"), ("Rome", "Colosseum"),
    ("Cape Town", "Table Mountain"), ("Sydney", "Opera House"), ("Barcelona", "Sagrada Familia"),
    ("Dubai", "Burj Khalifa"), ("Rio de Janeiro", "Christ the Redeemer"), ("Istanbul", "Hagia Sophia"),
    ("Paris", "Pastry"), ("Tokyo", "Sushi Market"), ("Bangkok", "Street Food"),
    ("Rome", "Pasta"), ("Barcelona", "Tapas"), ("Lisbon", "Pasteis de Nata"),
    ("Marrakech", "Moroccan Food"), ("Buenos Aires", "Asado"), ("London", "Food Market"),
    ("Bali", "White Water Rafting"), ("Cape Town", "Shark Diving"), ("Dubai", "Desert Safari"),
    ("Reykjavik", "Iceland Nature"), ("Sydney", "Harbour Bridge"), ("Rio de Janeiro", "Hang Gliding"),
    ("Vancouver", "Hiking"), ("Santorini", "Kayaking"),
    ("Paris", "Louvre Museum"), ("Kyoto", "Tea Ceremony"), ("Istanbul", "Hammam"),
    ("Buenos Aires", "Tango"), ("London", "British Museum"), ("Marrakech", "Medina"),
    ("Kyoto", "Shrine"), ("Lisbon", "Fado Music"),
    ("Bali", "Spa Retreat"), ("Bangkok", "Thai Massage"), ("Reykjavik", "Blue Lagoon"),
    ("Santorini", "Sunset Yoga"), ("Tokyo", "Onsen"), ("Kyoto", "Zen Meditation"),
    ("Vancouver", "Nature Walk"), ("Dubai", "Luxury Spa"),
    ("New York", "Rooftop Bar"), ("Barcelona", "Beach Club"), ("Bangkok", "Night Market"),
    ("London", "Pub"), ("Rio de Janeiro", "Nightlife"), ("Bali", "Beach Bar"),
    ("Istanbul", "Night Cruise"), ("Tokyo", "Neon City")
]

def get_unsplash_id(query):
    # Use napi for search
    url = f"https://unsplash.com/napi/search/photos?query={urllib.parse.quote(query)}&per_page=1&page=1"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8'))
            if data and 'results' in data and len(data['results']) > 0:
                return data['results'][0]['id']
    except Exception as e:
        pass
    return None

results = {"cities": {}, "activities": {}}

for city in CITIES:
    uid = get_unsplash_id(f"{city} city travel architecture")
    results["cities"][city] = uid
    print(f"City {city}: {uid}")

for city, act in ACTIVITIES:
    uid = get_unsplash_id(f"{city} {act}")
    results["activities"][f"{city}_{act}"] = uid
    print(f"Activity {city} {act}: {uid}")

with open("unsplash_ids.json", "w") as f:
    json.dump(results, f, indent=2)

print("Done. Saved to unsplash_ids.json")
