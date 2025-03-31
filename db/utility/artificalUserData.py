import csv
import random
import re
from faker import Faker

fake = Faker()
Faker.seed(42)
random.seed(42)

NUM_USERS = 1000
MAX_FOLLOWS_PER_USER = 20

# Clean usernames and other fields to avoid SQL issues
def sanitize(value):
    value = re.sub(r'[\n\r,\t"]', '', value)  # Remove newlines, commas, tabs, quotes
    return value.strip()

# Generate UserAccounts
users = []
usernames = set()
while len(users) < NUM_USERS:
    username = sanitize(fake.user_name())
    if username in usernames:
        continue
    usernames.add(username)
    user = {
        "Username": username,
        "UserPassword": sanitize(fake.password(length=12)),
        "ProfilePictureUrl": sanitize(fake.image_url()),
        "ProfileDescription": sanitize(fake.sentence(nb_words=10)),
        "Gender": sanitize(random.choice(["Male", "Female", "Non-binary", "Other"])),
        "Country": sanitize(fake.country()),
        "Age": random.randint(18, 70)
    }
    users.append(user)

# Save UserAccounts to CSV
with open("UserAccounts.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=users[0].keys())
    writer.writeheader()
    writer.writerows(users)

# Generate Follows (no self-following or duplicates)
follows = set()
usernames_list = list(usernames)

for user in usernames_list:
    num_follows = random.randint(5, MAX_FOLLOWS_PER_USER)
    followees = random.sample([u for u in usernames_list if u != user], num_follows)
    for followee in followees:
        follows.add((user, followee))

# Save Follows to CSV
with open("Follows.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["followerUsername", "followeeUsername"])
    for follow in follows:
        writer.writerow([sanitize(follow[0]), sanitize(follow[1])])
