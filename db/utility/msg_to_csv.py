import msgpack
import pandas as pd

# local msgpack files 
msg_files = [
    "/Users/fluffy/Downloads/shard_0.msg",
    "/Users/fluffy/Downloads/shard_1.msg",
    "/Users/fluffy/Downloads/shard_102.msg"
]

data = []

# Read and unpack each file
for filepath in msg_files:
    with open(filepath, 'rb') as f:
        unpacker = msgpack.Unpacker(f, raw=False)
        for record in unpacker:
            data.append({
                "id": record["id"],
                "latitude": record["latitude"],
                "longitude": record["longitude"]
            })

# Save to CSV
df = pd.DataFrame(data)
df.to_csv("yfcc_coords.csv", index=False)

print("✅ CSV saved: yfcc_coords.csv")
