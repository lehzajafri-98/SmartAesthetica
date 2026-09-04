import requests
import json

print("\n--- TEST: REAL FULL FLOW ---")
# 1. Login with a known user (from DB check, Essa is user 1)
login_res = requests.post("http://localhost:8000/login", json={"email": "essabintahir0802@gmail.com", "password": "password123"})
if login_res.status_code != 200:
    print("Login Failed:", login_res.text)
    exit(1)

token = login_res.json().get("token")
print("Login Success. Token length:", len(token))

# 2. Try POST Review
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
data = {"rating": 5, "comment": "Testing the genuine flow"}
rev_res = requests.post("http://localhost:8000/reviews", headers=headers, json=data)

print(f"Post Review Status: {rev_res.status_code}")
print(f"Post Review Body: {rev_res.text}")
