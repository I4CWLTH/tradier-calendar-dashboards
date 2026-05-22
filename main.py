import os
import calendar
import requests

from datetime import datetime
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

    today = datetime.now()

    current_year = today.year
    current_month = today.month

    month_prefix = f"{current_year}-{str(current_month).zfill(2)}"
    month_name = calendar.month_name[current_month]
    days_in_month = calendar.monthrange(current_year, current_month)[1]

    # Python: Monday = 0, Sunday = 6
    first_weekday_python = calendar.monthrange(current_year, current_month)[0]

    # Convert to Sunday = 0, Monday = 1, etc.
    first_weekday = (first_weekday_python + 1) % 7

    balances_url = f"{BASE_URL}/accounts/{TRADIER_ACCOUNT_ID}/balances"
    gainloss_url = f"{BASE_URL}/accounts/{TRADIER_ACCOUNT_ID}/gainloss"

    balances_response = requests.get(balances_url, headers=headers)
    gainloss_response = requests.get(gainloss_url, headers=headers)

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

        if isinstance(closed_positions, dict):
            closed_positions = [closed_positions]

        for trade in closed_positions:

            close_date = trade.get("close_date", "")

            # Only include current month trades
            if not close_date.startswith(month_prefix):
                continue

            gain_loss = float(trade.get("gain_loss", 0))
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

        total_day_pl = sum(trade["pl"] for trade in trades)

        if total_day_pl > 0:
            winning_days += 1
        elif total_day_pl < 0:
            losing_days += 1

        days[date_key] = {
            "total": round(total_day_pl, 2),
            "trades": [trade["pl"] for trade in trades],
            "symbols": [trade["symbol"] for trade in trades]
        }

    no_trade_days = days_in_month - (winning_days + losing_days)

    today_key = today.strftime("%Y-%m-%d")
    today_pl = days.get(today_key, {}).get("total", 0)

    return {
        "month": month_name,
        "month_number": current_month,
        "year": current_year,
        "days_in_month": days_in_month,
        "first_weekday": first_weekday,
        "account_value": round(account_value, 2),
        "available_funds": round(available_funds, 2),
        "total_pl": round(total_pl, 2),
        "today_pl": round(today_pl, 2),
        "winning_days": winning_days,
        "losing_days": losing_days,
        "no_trade_days": no_trade_days,
        "days": days
    }
