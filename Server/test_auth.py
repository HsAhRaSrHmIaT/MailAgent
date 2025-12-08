"""
Quick test script to verify authentication setup.
"""

import requests
import json

BASE_URL = "http://localhost:8000/api/auth"

def test_auth_flow():
    print("🧪 Testing Authentication Flow...\n")
    
    # Test data
    test_user = {
        "email": "test@mailagent.com",
        "username": "testuser",
        "password": "TestPass123!"
    }
    
    # 1. Test Registration
    print("1️⃣ Testing Registration...")
    try:
        response = requests.post(
            f"{BASE_URL}/register",
            json=test_user
        )
        
        if response.status_code == 201:
            data = response.json()
            print("✅ Registration successful!")
            print(f"   User ID: {data['user']['id']}")
            print(f"   Email: {data['user']['email']}")
            print(f"   Token: {data['token'][:50]}...")
            token = data['token']
        else:
            print(f"❌ Registration failed: {response.json()}")
            # If user exists, try login
            print("\n   User might already exist, trying login...")
            response = requests.post(
                f"{BASE_URL}/login",
                json={"email": test_user["email"], "password": test_user["password"]}
            )
            if response.status_code == 200:
                data = response.json()
                print("✅ Login successful instead!")
                token = data['token']
            else:
                print(f"❌ Login also failed: {response.json()}")
                return
    except Exception as e:
        print(f"❌ Error during registration: {e}")
        return
    
    print()
    
    # 2. Test Get Current User
    print("2️⃣ Testing Get Current User...")
    try:
        response = requests.get(
            f"{BASE_URL}/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Get current user successful!")
            print(f"   Username: {data['user']['username']}")
            print(f"   Email: {data['user']['email']}")
        else:
            print(f"❌ Get current user failed: {response.json()}")
    except Exception as e:
        print(f"❌ Error during get user: {e}")
    
    print()
    
    # 3. Test Update Profile
    print("3️⃣ Testing Update Profile...")
    try:
        response = requests.put(
            f"{BASE_URL}/profile",
            headers={"Authorization": f"Bearer {token}"},
            json={"username": "updateduser"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Profile update successful!")
            print(f"   New Username: {data['user']['username']}")
        else:
            print(f"❌ Profile update failed: {response.json()}")
    except Exception as e:
        print(f"❌ Error during profile update: {e}")
    
    print()
    
    # 4. Test Logout
    print("4️⃣ Testing Logout...")
    try:
        response = requests.post(
            f"{BASE_URL}/logout",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            print("✅ Logout successful!")
        else:
            print(f"❌ Logout failed: {response.json()}")
    except Exception as e:
        print(f"❌ Error during logout: {e}")
    
    print()
    print("🎉 Authentication flow test complete!")


if __name__ == "__main__":
    print("=" * 50)
    print("MailAgent Authentication Test")
    print("=" * 50)
    print()
    
    print("⚠️  Make sure the server is running on http://localhost:8000")
    input("Press Enter to continue...")
    print()
    
    try:
        test_auth_flow()
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure it's running!")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
