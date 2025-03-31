import csv
import random
from faker import Faker

fake = Faker()
num_spots = 1000
used_names = set()

city_id_range = range(1, 101)  # Adjust based on your actual CityId values

def generate_unique_spot_name():
    while True:
        name = fake.unique.company() + " Resort"
        if name not in used_names:
            used_names.add(name)
            return name.replace("'", "''")  # Escape single quotes

# Save to CSV file with Unix-style line endings
with open("vacation_spots.csv", "w", encoding="utf-8", newline="\n") as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(["VacationSpotName", "CityId", "LikeCount"])  # header

    for _ in range(num_spots):
        name = generate_unique_spot_name()
        city_id = random.choice(city_id_range)
        like_count = random.randint(0, 5000)
        writer.writerow([name, city_id, like_count])

print("Saved vacation spots to vacation_spots.csv with Unix-style line endings.")
