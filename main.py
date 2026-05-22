import os
import requests
import pandas as pd

from collections import defaultdict

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI()

TRADIER_TOKEN = os.getenv("TRADIER_TOKEN")
TRADIER_ACCOUNT_ID = os.getenv("TRADIER_ACCOUNT_ID")

BASE_URL = "https://api.tradier.com/v1"

headers = {
    "Authorization": f"Bearer {TRADIER_TOKEN}",
    "Accept": "application/json"
}

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def home():
    return FileResponse("static/index.html")

@app.get("/api/calendar")
def get_calendar():

    balances_url = f"{BASE_URL}/accounts/{TRADIER_ACCOUNT_ID}/balances"

    gainloss_url = f"{BASE_URL}/accounts/{TRADIER_ACCOUNT_ID}/gainloss"

    balances_response = requests.get(
        balances_url,
        headers=headers
    )

    gainloss_response = requests.get(
        gainloss_url,
        headers=headers
    )

    balances_json = balances_response.json()

    gainloss_json = gainloss_response.json()

    account_value = 0
    available_funds = 0

    try:

        balances = balances_json["balances"]

        account_value = balances["total_equity"]

        available_funds = balances["cash"]["cash_available"]

    except Exception as e:

        print("Balance Error:", e)

    daily_data = defaultdict(list)

    total_pl = 0

    winning_days = 0
    losing_days = 0

    try:

        closed_positions = gainloss_json["gainloss"]["closed_position"]

        # Handle Tradier single-object response
        if isinstance(closed_positions, dict):
            closed_positions = [closed_positions]

        for trade in closed_positions:

            close_date = trade.get("close_date", "")

            # ONLY include May 2026 trades
            if not close_date.startswith("2026-05"):
                continue

            gain_loss = float(
                trade.get("gain_loss", 0)
            )

            symbol = trade.get("symbol", "")

            date_key = close_date.split("T")[0]

            daily_data[date_key].append({
                "symbol": symbol,
                "pl": round(gain_loss, 2)
            })

            total_pl += gain_loss

    except Exception as e:

        print("Gain/Loss Error:", e)

    days = {}

    for date_key, trades in daily_data.items():

        total_day_pl = sum(
            trade["pl"] for trade in trades
        )

        if total_day_pl > 0:
            winning_days += 1

        elif total_day_pl < 0:
            losing_days += 1

        days[date_key] = {

            "total": round(total_day_pl, 2),

            "trades": [
                trade["pl"] for trade in trades
            ],

            "symbols": [
                trade["symbol"] for trade in trades
            ]
        }

    no_trade_days = 31 - (
        winning_days + losing_days
    )

    return {

        "month": "May",

        "year": 2026,

        "account_value": round(account_value, 2),

        "available_funds": round(available_funds, 2),

        "total_pl": round(total_pl, 2),

        "winning_days": winning_days,

        "losing_days": losing_days,

        "no_trade_days": no_trade_days,

        "days": days
    }
