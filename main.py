import os
import requests
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI()

TRADIER_TOKEN = os.getenv("TRADIER_TOKEN")
TRADIER_ACCOUNT_ID = os.getenv("TRADIER_ACCOUNT_ID")
TRADIER_BASE_URL = "https://api.tradier.com/v1"

headers = {
    "Authorization": f"Bearer {TRADIER_TOKEN}",
    "Accept": "application/json"
}

@app.get("/api/account")
def get_account():

    balances_url = f"{TRADIER_BASE_URL}/accounts/{TRADIER_ACCOUNT_ID}/balances"

    response = requests.get(
        balances_url,
        headers=headers
    )

    if response.status_code != 200:
        return {
            "error": True,
            "message": response.text
        }

    return response.json()

@app.get("/api/calendar")
def get_calendar():

    return {
        "month": "May",
        "year": 2026,
        "account_value": 764.64,
        "available_funds": 324.64,
        "total_pl": 121.75,
        "winning_days": 5,
        "losing_days": 5,
        "no_trade_days": 12,
        "days": {
            "2026-05-01": {
                "total": 11.18,
                "trades": [-15.88, 27.06]
            },
            "2026-05-05": {
                "total": -28.88,
                "trades": [-12.94, -15.94]
            },
            "2026-05-06": {
                "total": 8.12,
                "trades": [-5.94, 14.06]
            },
            "2026-05-07": {
                "total": -1.88,
                "trades": [-1.88]
            },
            "2026-05-08": {
                "total": -10.94,
                "trades": [-10.94]
            },
            "2026-05-11": {
                "total": -5.56,
                "trades": [-8.78, 3.22]
            },
            "2026-05-12": {
                "total": 43.18,
                "trades": [46.12, -2.94]
            },
            "2026-05-13": {
                "total": 37.28,
                "trades": [15.22, 22.06]
            },
            "2026-05-18": {
                "total": 52.24,
                "trades": [-22.94, 7.06, 68.12]
            },
            "2026-05-19": {
                "total": -19.81,
                "trades": [-23.87, 4.06]
            },
            "2026-05-22": {
                "total": 24.00,
                "trades": [12.00, 12.00]
            }
        }
    }

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def home():
    return FileResponse("static/index.html")
