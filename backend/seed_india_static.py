# backend/seed_india_static.py
# Seeds all major Indian cities/towns — no internet required.
# Run from backend/: python seed_india_static.py

import asyncio, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from sqlalchemy import select
from app.database import async_session_factory
from app.models.city import City

# fmt: off
# (name, state/region, lat, lon, cost_index 1-5, popularity 1-10)
INDIA_CITIES = [
    # Andhra Pradesh
    ("Visakhapatnam","Andhra Pradesh",17.6868,83.2185,2.8,7.2),
    ("Vijayawada","Andhra Pradesh",16.5062,80.6480,2.5,6.8),
    ("Tirupati","Andhra Pradesh",13.6288,79.4192,2.2,8.5),
    ("Guntur","Andhra Pradesh",16.3067,80.4365,2.2,5.8),
    ("Nellore","Andhra Pradesh",14.4426,79.9865,2.0,5.2),
    ("Kurnool","Andhra Pradesh",15.8281,78.0373,1.9,5.0),
    ("Amaravati","Andhra Pradesh",16.5150,80.5160,2.4,6.0),
    # Arunachal Pradesh
    ("Itanagar","Arunachal Pradesh",27.0844,93.6053,2.0,5.5),
    ("Tawang","Arunachal Pradesh",27.5860,91.8678,2.5,7.8),
    ("Ziro","Arunachal Pradesh",27.5487,93.8291,2.2,6.5),
    # Assam
    ("Guwahati","Assam",26.1445,91.7362,2.5,7.0),
    ("Dibrugarh","Assam",27.4728,94.9120,2.0,5.8),
    ("Jorhat","Assam",26.7509,94.2037,1.9,5.5),
    ("Silchar","Assam",24.8333,92.7789,1.8,5.0),
    ("Kaziranga","Assam",26.5775,93.1700,2.6,8.2),
    # Bihar
    ("Patna","Bihar",25.5941,85.1376,2.2,6.8),
    ("Gaya","Bihar",24.7955,85.0002,2.0,7.0),
    ("Bodh Gaya","Bihar",24.6959,84.9914,2.3,8.5),
    ("Muzaffarpur","Bihar",26.1209,85.3647,1.8,5.0),
    ("Bhagalpur","Bihar",25.2425,86.9842,1.8,5.0),
    # Chhattisgarh
    ("Raipur","Chhattisgarh",21.2514,81.6296,2.2,6.0),
    ("Bilaspur","Chhattisgarh",22.0797,82.1409,2.0,5.2),
    ("Jagdalpur","Chhattisgarh",19.0696,82.0211,2.0,5.8),
    # Goa
    ("Panaji","Goa",15.4989,73.8278,3.6,8.0),
    ("Margao","Goa",15.2832,73.9862,3.4,7.5),
    ("Calangute","Goa",15.5440,73.7552,3.8,8.5),
    ("Vasco da Gama","Goa",15.3982,73.8113,3.2,7.0),
    ("Anjuna","Goa",15.5740,73.7404,3.6,8.0),
    # Gujarat
    ("Ahmedabad","Gujarat",23.0225,72.5714,2.8,7.5),
    ("Surat","Gujarat",21.1702,72.8311,2.6,6.8),
    ("Vadodara","Gujarat",22.3072,73.1812,2.5,6.5),
    ("Rajkot","Gujarat",22.3039,70.8022,2.3,6.0),
    ("Gandhinagar","Gujarat",23.2156,72.6369,2.5,6.0),
    ("Bhavnagar","Gujarat",21.7645,72.1519,2.2,5.5),
    ("Somnath","Gujarat",20.9026,70.3842,2.4,7.8),
    ("Dwarka","Gujarat",22.2373,68.9678,2.3,7.5),
    ("Rann of Kutch","Gujarat",23.7330,69.8597,2.8,8.0),
    # Haryana
    ("Gurugram","Haryana",28.4595,77.0266,4.0,7.0),
    ("Faridabad","Haryana",28.4089,77.3178,3.2,6.0),
    ("Chandigarh","Haryana",30.7333,76.7794,3.0,7.5),
    ("Ambala","Haryana",30.3752,76.7821,2.4,5.5),
    ("Panipat","Haryana",29.3909,76.9635,2.2,5.8),
    # Himachal Pradesh
    ("Shimla","Himachal Pradesh",31.1048,77.1734,3.0,8.5),
    ("Manali","Himachal Pradesh",32.2396,77.1887,3.2,9.0),
    ("Dharamshala","Himachal Pradesh",32.2190,76.3234,2.8,8.5),
    ("Kullu","Himachal Pradesh",31.9579,77.1095,2.8,7.5),
    ("Dalhousie","Himachal Pradesh",32.5380,75.9697,2.6,7.5),
    ("Spiti Valley","Himachal Pradesh",32.2464,78.0339,3.0,8.8),
    ("Kasol","Himachal Pradesh",32.0093,77.3148,2.5,8.0),
    # Jharkhand
    ("Ranchi","Jharkhand",23.3441,85.3096,2.2,6.2),
    ("Jamshedpur","Jharkhand",22.8046,86.2029,2.5,6.0),
    ("Dhanbad","Jharkhand",23.7957,86.4304,2.0,5.0),
    # Karnataka
    ("Bengaluru","Karnataka",12.9716,77.5946,3.8,8.5),
    ("Mysuru","Karnataka",12.2958,76.6394,2.8,8.5),
    ("Hampi","Karnataka",15.3350,76.4600,2.5,9.0),
    ("Mangaluru","Karnataka",12.9141,74.8560,2.8,7.0),
    ("Hubballi","Karnataka",15.3647,75.1240,2.4,5.8),
    ("Belagavi","Karnataka",15.8497,74.4977,2.3,5.5),
    ("Coorg","Karnataka",12.3375,75.8069,3.2,8.5),
    ("Udupi","Karnataka",13.3409,74.7421,2.6,7.5),
    ("Badami","Karnataka",15.9204,75.6763,2.4,7.8),
    # Kerala
    ("Thiruvananthapuram","Kerala",8.5241,76.9366,2.8,7.5),
    ("Kochi","Kerala",9.9312,76.2673,3.2,8.5),
    ("Kozhikode","Kerala",11.2588,75.7804,2.6,7.0),
    ("Munnar","Kerala",10.0889,77.0595,3.0,9.0),
    ("Alleppey","Kerala",9.4981,76.3388,2.8,9.0),
    ("Thrissur","Kerala",10.5276,76.2144,2.6,7.0),
    ("Wayanad","Kerala",11.6854,76.1320,2.8,8.5),
    ("Thekkady","Kerala",9.5996,77.1595,2.8,8.5),
    ("Varkala","Kerala",8.7379,76.7163,2.8,8.0),
    # Madhya Pradesh
    ("Bhopal","Madhya Pradesh",23.2599,77.4126,2.4,6.8),
    ("Indore","Madhya Pradesh",22.7196,75.8577,2.6,7.0),
    ("Khajuraho","Madhya Pradesh",24.8318,79.9199,2.6,8.8),
    ("Gwalior","Madhya Pradesh",26.2183,78.1828,2.3,7.5),
    ("Ujjain","Madhya Pradesh",23.1765,75.7885,2.2,8.0),
    ("Jabalpur","Madhya Pradesh",23.1815,79.9864,2.2,6.5),
    ("Pachmarhi","Madhya Pradesh",22.4675,78.4341,2.5,7.5),
    # Maharashtra
    ("Mumbai","Maharashtra",19.0760,72.8777,4.2,9.5),
    ("Pune","Maharashtra",18.5204,73.8567,3.5,8.5),
    ("Nagpur","Maharashtra",21.1458,79.0882,2.6,6.8),
    ("Nashik","Maharashtra",19.9975,73.7898,2.8,7.0),
    ("Aurangabad","Maharashtra",19.8762,75.3433,2.6,7.5),
    ("Shirdi","Maharashtra",19.7650,74.4773,2.5,8.5),
    ("Mahabaleshwar","Maharashtra",17.9238,73.6576,3.0,8.0),
    ("Lonavala","Maharashtra",18.7481,73.4072,3.0,7.8),
    ("Kolhapur","Maharashtra",16.7050,74.2433,2.5,7.0),
    # Manipur
    ("Imphal","Manipur",24.8170,93.9368,2.0,5.8),
    # Meghalaya
    ("Shillong","Meghalaya",25.5788,91.8933,2.5,8.0),
    ("Cherrapunji","Meghalaya",25.2842,91.7176,2.4,8.5),
    # Mizoram
    ("Aizawl","Mizoram",23.7307,92.7173,2.2,5.5),
    # Nagaland
    ("Kohima","Nagaland",25.6747,94.1086,2.2,6.0),
    ("Dimapur","Nagaland",25.9064,93.7279,2.0,5.5),
    # Odisha
    ("Bhubaneswar","Odisha",20.2961,85.8245,2.4,7.0),
    ("Puri","Odisha",19.8135,85.8312,2.4,8.5),
    ("Cuttack","Odisha",20.4625,85.8828,2.2,6.0),
    ("Konark","Odisha",19.8876,86.0949,2.3,8.5),
    # Punjab
    ("Amritsar","Punjab",31.6340,74.8723,2.8,9.0),
    ("Ludhiana","Punjab",30.9010,75.8573,2.8,6.5),
    ("Jalandhar","Punjab",31.3260,75.5762,2.5,6.0),
    ("Patiala","Punjab",30.3398,76.3869,2.4,6.5),
    # Rajasthan
    ("Jaipur","Rajasthan",26.9124,75.7873,2.7,9.0),
    ("Jodhpur","Rajasthan",26.2389,73.0243,2.5,8.5),
    ("Udaipur","Rajasthan",24.5854,73.7125,2.8,9.2),
    ("Jaisalmer","Rajasthan",26.9157,70.9083,2.8,9.0),
    ("Pushkar","Rajasthan",26.4898,74.5511,2.5,8.5),
    ("Bikaner","Rajasthan",28.0229,73.3119,2.3,7.5),
    ("Ajmer","Rajasthan",26.4499,74.6399,2.3,7.5),
    ("Mount Abu","Rajasthan",24.5926,72.7156,2.8,7.8),
    ("Ranthambore","Rajasthan",26.0173,76.5026,3.0,8.5),
    # Sikkim
    ("Gangtok","Sikkim",27.3389,88.6065,2.8,8.5),
    ("Pelling","Sikkim",27.3000,88.2333,2.6,7.8),
    # Tamil Nadu
    ("Chennai","Tamil Nadu",13.0827,80.2707,3.4,8.0),
    ("Madurai","Tamil Nadu",9.9252,78.1198,2.4,8.0),
    ("Coimbatore","Tamil Nadu",11.0168,76.9558,2.8,7.0),
    ("Ooty","Tamil Nadu",11.4102,76.6950,2.8,8.5),
    ("Mahabalipuram","Tamil Nadu",12.6269,80.1927,2.6,8.5),
    ("Thanjavur","Tamil Nadu",10.7870,79.1378,2.3,8.0),
    ("Tiruchirappalli","Tamil Nadu",10.7905,78.7047,2.3,6.8),
    ("Kodaikanal","Tamil Nadu",10.2381,77.4892,2.6,8.0),
    ("Rameshwaram","Tamil Nadu",9.2885,79.3129,2.3,8.0),
    ("Kanyakumari","Tamil Nadu",8.0883,77.5385,2.4,8.0),
    # Telangana
    ("Hyderabad","Telangana",17.3850,78.4867,3.4,8.5),
    ("Warangal","Telangana",17.9689,79.5941,2.2,6.5),
    ("Nizamabad","Telangana",18.6725,78.0941,2.0,5.5),
    # Tripura
    ("Agartala","Tripura",23.8315,91.2868,2.0,5.5),
    # Uttar Pradesh
    ("Lucknow","Uttar Pradesh",26.8467,80.9462,2.6,7.5),
    ("Agra","Uttar Pradesh",27.1767,78.0081,2.6,9.5),
    ("Varanasi","Uttar Pradesh",25.3176,82.9739,2.4,9.5),
    ("Prayagraj","Uttar Pradesh",25.4358,81.8463,2.3,8.0),
    ("Kanpur","Uttar Pradesh",26.4499,80.3319,2.4,6.5),
    ("Mathura","Uttar Pradesh",27.4924,77.6737,2.3,8.0),
    ("Vrindavan","Uttar Pradesh",27.5780,77.7000,2.2,8.0),
    ("Ayodhya","Uttar Pradesh",26.7922,82.1998,2.3,8.5),
    ("Rishikesh","Uttar Pradesh",30.0869,78.2676,2.8,8.8),
    ("Haridwar","Uttar Pradesh",29.9457,78.1642,2.5,8.5),
    # Uttarakhand
    ("Dehradun","Uttarakhand",30.3165,78.0322,2.8,7.5),
    ("Mussoorie","Uttarakhand",30.4598,78.0664,3.0,8.5),
    ("Nainital","Uttarakhand",29.3919,79.4542,2.8,8.5),
    ("Jim Corbett","Uttarakhand",29.5300,78.7747,3.2,8.5),
    ("Auli","Uttarakhand",30.5274,79.5664,3.0,8.0),
    ("Kedarnath","Uttarakhand",30.7352,79.0669,2.8,9.0),
    ("Badrinath","Uttarakhand",30.7433,79.4938,2.6,8.8),
    ("Rishikesh","Uttarakhand",30.0869,78.2676,2.8,8.8),
    # West Bengal
    ("Kolkata","West Bengal",22.5726,88.3639,2.9,8.5),
    ("Darjeeling","West Bengal",27.0410,88.2663,3.0,9.0),
    ("Siliguri","West Bengal",26.7271,88.3953,2.4,6.5),
    ("Sundarbans","West Bengal",21.9497,88.8991,2.8,8.5),
    # Delhi (UT)
    ("New Delhi","Delhi",28.6139,77.2090,3.9,9.0),
    ("Delhi","Delhi",28.7041,77.1025,3.8,8.5),
    # Jammu & Kashmir (UT)
    ("Srinagar","Jammu & Kashmir",34.0837,74.7973,3.0,9.0),
    ("Jammu","Jammu & Kashmir",32.7266,74.8570,2.6,7.5),
    ("Pahalgam","Jammu & Kashmir",34.0161,75.3150,3.0,8.8),
    ("Gulmarg","Jammu & Kashmir",34.0522,74.3800,3.2,9.0),
    ("Sonamarg","Jammu & Kashmir",34.2960,75.2906,3.0,8.5),
    ("Leh","Jammu & Kashmir",34.1526,77.5771,3.2,9.2),
    ("Kargil","Jammu & Kashmir",34.5539,76.1349,2.8,7.5),
    ("Nubra Valley","Jammu & Kashmir",34.7000,77.5500,3.2,9.0),
    ("Pangong Lake","Jammu & Kashmir",33.7500,78.6667,3.2,9.2),
    # Ladakh (UT)
    ("Leh","Ladakh",34.1526,77.5771,3.2,9.2),
    # Puducherry (UT)
    ("Puducherry","Puducherry",11.9416,79.8083,3.0,8.0),
    # Andaman & Nicobar (UT)
    ("Port Blair","Andaman & Nicobar Islands",11.6234,92.7265,3.5,8.5),
    ("Havelock Island","Andaman & Nicobar Islands",12.0265,92.9936,3.8,9.0),
    # Lakshadweep (UT)
    ("Kavaratti","Lakshadweep",10.5593,72.6358,4.0,8.0),
    # Chandigarh (UT)
    ("Chandigarh","Chandigarh",30.7333,76.7794,3.0,7.5),
    # Dadra & Nagar Haveli (UT)
    ("Silvassa","Dadra & Nagar Haveli",20.2740,73.0169,2.2,5.5),
    # Daman & Diu (UT)
    ("Daman","Daman & Diu",20.3974,72.8328,2.8,7.0),
    ("Diu","Daman & Diu",20.7144,70.9874,3.0,7.5),
]
# fmt: on


def img(name: str) -> str:
    import urllib.parse
    q = urllib.parse.quote(f"{name} India travel")
    return f"https://loremflickr.com/800/600/{q}"


async def seed() -> None:
    async with async_session_factory() as session:
        result = await session.execute(
            select(City).where(City.country == "India")
        )
        existing = {
            (c.name.lower(), (c.region or "").lower())
            for c in result.scalars().all()
        }

        inserted = 0
        for name, region, lat, lon, cost, pop in INDIA_CITIES:
            key = (name.lower(), region.lower())
            if key in existing:
                continue
            session.add(City(
                name=name,
                country="India",
                region=region,
                latitude=lat,
                longitude=lon,
                cost_index=cost,
                popularity_score=pop,
                image_url=img(name),
            ))
            inserted += 1

        await session.commit()
        print(f"Done — {inserted} new Indian cities inserted ({len(INDIA_CITIES)} total in dataset).")


if __name__ == "__main__":
    asyncio.run(seed())
