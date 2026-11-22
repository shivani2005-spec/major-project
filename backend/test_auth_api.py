import asyncio
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from httpx import AsyncClient, ASGITransport
from app.main import app

async def run_auth_tests():
    print("=" * 60)
    print("Testing NoteWise AI Authentication & MongoDB API Endpoints")
    print("=" * 60)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Healthcheck
        print("\n[Test 1] Healthcheck & Database status...")
        res = await client.get("/api/health")
        print("Status code:", res.status_code)
        health_data = res.json()
        print("Health data:", health_data)
        assert res.status_code == 200
        assert "database_engine" in health_data

        # 2. Signup
        test_email = "student.demo@university.edu"
        print(f"\n[Test 2] Signup with email '{test_email}'...")
        signup_payload = {
            "name": "Demo Student",
            "email": test_email,
            "password": "StudyStrong2026!"
        }
        res = await client.post("/api/auth/signup", json=signup_payload)
        print("Signup status:", res.status_code)
        if res.status_code == 400:
            print("User already exists, proceeding to signin...")
        else:
            assert res.status_code == 201
            signup_data = res.json()
            print("Received Token:", signup_data["access_token"][:30] + "...")
            print("User Created:", signup_data["user"]["name"])

        # 3. Signin
        print(f"\n[Test 3] Signin with email '{test_email}'...")
        signin_payload = {
            "email": test_email,
            "password": "StudyStrong2026!"
        }
        res = await client.post("/api/auth/signin", json=signin_payload)
        print("Signin status:", res.status_code)
        assert res.status_code == 200
        signin_data = res.json()
        token = signin_data["access_token"]
        print("Authenticated Token successfully obtained!")

        # 4. Get Current User (/api/auth/me)
        print("\n[Test 4] Fetch /api/auth/me with Bearer token...")
        headers = {"Authorization": f"Bearer {token}"}
        res = await client.get("/api/auth/me", headers=headers)
        print("Me status:", res.status_code)
        assert res.status_code == 200
        me_data = res.json()
        print("Verified Profile:", me_data["name"], f"({me_data['email']})")

    print("\n" + "=" * 60)
    print("All Auth & DB API Tests Passed Successfully!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_auth_tests())
