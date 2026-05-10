import re
import urllib.parse

with open("backend/seed.py", "r", encoding="utf-8") as f:
    content = f.read()

def replace_city_img(text):
    name_match = re.search(r'"name":\s*"([^"]+)"', text)
    if name_match:
        name = name_match.group(1).lower().replace(' ', '')
        query = f"{name},city,architecture"
        new_url = f"https://loremflickr.com/800/600/{urllib.parse.quote(query)}/all"
        text = re.sub(r'"image_url":\s*"[^"]+"', f'"image_url": "{new_url}"', text)
    return text

def replace_act_img(text):
    name_match = re.search(r'"name":\s*"([^"]+)"', text)
    city_match = re.search(r'"city":\s*"([^"]+)"', text)
    type_match = re.search(r'"type":\s*"([^"]+)"', text)
    if name_match and city_match and type_match:
        name = name_match.group(1).lower().replace(' ', '')
        city = city_match.group(1).lower().replace(' ', '')
        act_type = type_match.group(1).lower()
        query = f"{city},{act_type},travel"
        new_url = f"https://loremflickr.com/800/600/{urllib.parse.quote(query)}/all"
        text = re.sub(r'"image_url":\s*"[^"]+"', f'"image_url": "{new_url}"', text)
    return text

lines = content.split('\n')
new_lines = []
in_cities = False
in_acts = False

for line in lines:
    if "CITIES =" in line:
        in_cities = True
        in_acts = False
    elif "ACTIVITIES =" in line:
        in_cities = False
        in_acts = True
    elif "async def seed()" in line:
        in_cities = False
        in_acts = False
    
    if in_cities and '"image_url"' in line:
        line = replace_city_img(line)
    elif in_acts and '"image_url"' in line:
        line = replace_act_img(line)
    
    new_lines.append(line)

with open("backend/seed.py", "w", encoding="utf-8") as f:
    f.write('\n'.join(new_lines))

print("seed.py updated successfully.")
