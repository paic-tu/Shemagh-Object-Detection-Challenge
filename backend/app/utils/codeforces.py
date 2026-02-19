
import os
import time
import hashlib
import random
import requests
import json
from dotenv import load_dotenv

load_dotenv()

class CodeforcesAPI:
    def __init__(self):
        self.api_key = os.getenv("CODEFORCES_API_KEY")
        self.api_secret = os.getenv("CODEFORCES_API_SECRET")
        self.base_url = "https://codeforces.com/api"
        
        if not self.api_key or not self.api_secret:
            raise ValueError("CODEFORCES_API_KEY and CODEFORCES_API_SECRET must be set in .env")

    def _generate_api_sig(self, method_name, params):
        rand = "".join(random.choices("0123456789abcdef", k=6))
        
        # Add apiKey and time to params
        # We work on a copy to avoid modifying the original dictionary if passed by reference
        # But here we want to return the modified params to be used in the request
        
        # Ensure all values are strings for consistent hashing
        str_params = {k: str(v) for k, v in params.items()}
        
        str_params["apiKey"] = self.api_key
        str_params["time"] = str(int(time.time()))
        
        # Sort params lexicographically by key, then value
        sorted_params = sorted(str_params.items())
        
        # Construct the string to hash
        # "param1=value1&param2=value2..."
        param_string = "&".join([f"{k}={v}" for k, v in sorted_params])
        
        # <rand>/<methodName>?<param_string>#<secret>
        string_to_hash = f"{rand}/{method_name}?{param_string}#{self.api_secret}"
        
        # Calculate SHA-512 hash
        hash_digest = hashlib.sha512(string_to_hash.encode("utf-8")).hexdigest()
        
        return f"{rand}{hash_digest}", str_params

    def call_method(self, method_name, params=None):
        if params is None:
            params = {}
            
        api_sig, params_with_auth = self._generate_api_sig(method_name, params)
        params_with_auth["apiSig"] = api_sig
        
        url = f"{self.base_url}/{method_name}"
        
        try:
            # Codeforces API expects parameters in the query string (GET request)
            response = requests.get(url, params=params_with_auth)
            response.raise_for_status()
            
            data = response.json()
            
            if data["status"] == "FAILED":
                raise Exception(f"Codeforces API Error: {data.get('comment', 'Unknown error')}")
                
            return data["result"]
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Network Error: {str(e)}")
        except ValueError as e: # JSON decode error
             raise Exception(f"Invalid JSON response: {str(e)}")
        except Exception as e:
            raise Exception(str(e))

    def get_problems(self, tags=None):
        """Fetch problems, optionally filtered by tags (list of strings)"""
        params = {}
        if tags:
            params["tags"] = ";".join(tags)
        return self.call_method("problemset.problems", params)

    def get_contest_list(self, gym=False):
        """Fetch list of contests"""
        params = {"gym": str(gym).lower()}
        return self.call_method("contest.list", params)

    def get_user_info(self, handles):
        """Fetch user info for list of handles"""
        if isinstance(handles, list):
            handles = ";".join(handles)
        params = {"handles": handles}
        return self.call_method("user.info", params)

    def get_user_status(self, handle, count=10):
        """Fetch recent submissions of a user"""
        params = {
            "handle": handle,
            "from": 1,
            "count": count
        }
        return self.call_method("user.status", params)


if __name__ == "__main__":
    try:
        cf = CodeforcesAPI()
        print("Successfully initialized Codeforces API client.")
        
        # Test 1: Get Contest List (Public method, but authenticated)
        print("\nFetching latest 3 contests...")
        contests = cf.get_contest_list()
        # Contests are returned sorted by id usually, but let's take first 3
        for c in contests[:3]:
            print(f"- [{c['id']}] {c['name']} ({c['phase']})")
            
        # Test 2: Get Problems
        print("\nFetching first 3 problems...")
        problems_data = cf.get_problems()
        problems = problems_data["problems"]
        for p in problems[:3]:
            print(f"- {p['contestId']}{p['index']}: {p['name']}")

    except Exception as e:
        print(f"\n❌ Error: {e}")
