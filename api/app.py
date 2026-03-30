import requests
import os
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_restful import Api, Resource, abort
import logging
from apscheduler.schedulers.background import BackgroundScheduler

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "https://stockpricetrackerapp.netlify.app/"}})
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///stock_data.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
api = Api(app)

# ─────────────────────────────
# API KEYS & CONFIG
# ─────────────────────────────
KEY_1 = os.environ.get("TWELVE_DATA_API_KEY_1")
KEY_2 = os.environ.get("TWELVE_DATA_API_KEY_2")
BASE_URL = "https://api.twelvedata.com"

# All 14 symbols
ALL_SYMBOLS = ["DIA", "QQQ", "IWM", "SPY", "AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "META", "GOOGL", "AMD", "NFLX", "JPM"]

# Fast RAM cache for the live dashboard
market_cache = {}

# ─────────────────────────────
# DATABASE MODELS
# ─────────────────────────────
class StockData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(10), index=True)
    time = db.Column(db.DateTime, index=True)
    price = db.Column(db.Float)

with app.app_context():
    db.create_all()

# ─────────────────────────────
# CORE FETCH HELPERS
# ─────────────────────────────
def fetch_quote_chunk(symbols_list, api_key, key_name):
    """Fetches LIVE prices for the fast RAM dashboard."""
    if not api_key: return {}
    symbol_str = ",".join(symbols_list)
    url = f"{BASE_URL}/quote?symbol={symbol_str}&apikey={api_key}"
    try:
        res = requests.get(url, timeout=10)
        data = res.json()
        if "status" not in data or data.get("status") != "error":
            return data
    except Exception as e:
        logger.error(f"Live fetch error with {key_name}: {e}")
    return {}

def fetch_and_store_history(symbols_list, api_key, key_name):
    """Fetches HISTORICAL data and saves it securely to the database."""
    if not api_key: return
    symbol_str = ",".join(symbols_list)
    # Get 5-minute intervals, last 15 data points (covers the last hour+ of trading)
    url = f"{BASE_URL}/time_series?symbol={symbol_str}&interval=5min&outputsize=15&apikey={api_key}"
    
    try:
        res = requests.get(url, timeout=10)
        data = res.json()
        
        if "status" in data and data["status"] == "error":
            logger.error(f"History API error on {key_name}: {data}")
            return

        with app.app_context():
            for sym in symbols_list:
                if sym in data and "values" in data[sym]:
                    for v in data[sym]["values"]:
                        t = datetime.strptime(v['datetime'], "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
                        price = float(v['close'])

                        exists = StockData.query.filter_by(symbol=sym, time=t).first()
                        if not exists:
                            db.session.add(StockData(symbol=sym, time=t, price=price))
            db.session.commit()
            logger.info(f"Historical data saved to database using {key_name}.")
            
    except Exception as e:
        logger.error(f"History fetch failed on {key_name}: {e}")

# ─────────────────────────────
# BACKGROUND TASKS
# ─────────────────────────────
def update_market_cache():
    """Updates the Live RAM Cache every 15 minutes."""
    global market_cache
    now_utc = datetime.now(timezone.utc)
    is_daytime = 13 <= now_utc.hour <= 21
    
    if not market_cache or is_daytime:
        chunk1, chunk2 = ALL_SYMBOLS[:7], ALL_SYMBOLS[7:]
        data1 = fetch_quote_chunk(chunk1, KEY_1, "API Key 1")
        data2 = fetch_quote_chunk(chunk2, KEY_2, "API Key 2")
        
        for chunk, data in [(chunk1, data1), (chunk2, data2)]:
            for sym in chunk:
                if sym in data:
                    item = data[sym]
                    market_cache[sym] = {
                        "price": float(item.get("close") or item.get("previous_close") or 0),
                        "price_change": float(item.get("percent_change", 0))
                    }

def update_historical_database():
    """Runs hourly to build the chart database."""
    now_utc = datetime.now(timezone.utc)
    is_daytime = 13 <= now_utc.hour <= 21
    
    if is_daytime:
        logger.info("Starting hourly historical database fetch...")
        chunk1, chunk2 = ALL_SYMBOLS[:7], ALL_SYMBOLS[7:]
        fetch_and_store_history(chunk1, KEY_1, "API Key 1")
        fetch_and_store_history(chunk2, KEY_2, "API Key 2")

# ─────────────────────────────
# SCHEDULER SETUP
# ─────────────────────────────
scheduler = BackgroundScheduler()
scheduler.add_job(func=update_market_cache, trigger="interval", minutes=15)
scheduler.start()

# Needs a slightly delayed start for DB initialization context if deploying
scheduler.add_job(func=update_historical_database, trigger="interval", hours=1)

update_market_cache()

# ─────────────────────────────
# API RESOURCES
# ─────────────────────────────
class MarketBatchResource(Resource):
    def get(self):
        """Returns the live 15-minute RAM cache for the sidebars."""
        return market_cache, 200

class QuoteResource(Resource):
    def get(self, symbol):
        """Smart Endpoint: Checks cache first, then falls back to Live API."""
        symbol = symbol.strip().upper()
        
        # 1. Is it in our fast RAM cache?
        if symbol in market_cache:
            return {
                "symbol": symbol,
                "price": market_cache[symbol]["price"],
                "price_change": market_cache[symbol]["price_change"],
                "source": "Memory Cache"
            }, 200
            
        # 2. Not in cache? Fetch it live! (Costs 1 API credit)
        api_key = KEY_1 or KEY_2
        url = f"{BASE_URL}/quote?symbol={symbol}&apikey={api_key}"
        try:
            res = requests.get(url, timeout=5)
            data = res.json()
            
            if "status" in data and data["status"] == "error":
                abort(404, message=data.get("message", "Symbol not found or API limit reached."))
                
            price = float(data.get("close") or data.get("previous_close") or 0)
            price_change = float(data.get("percent_change", 0))
            
            return {
                "symbol": symbol,
                "price": price,
                "price_change": price_change,
                "source": "Live API"
            }, 200
        except Exception as e:
            logger.error(f"Live fetch failed for {symbol}: {e}")
            abort(500, message="Failed to fetch live data")

class ChartDataResource(Resource):
    def get(self, symbol):
        """Smart Chart: Checks DB first, falls back to Live API."""
        symbol = symbol.strip().upper()
        
        # 1. Check Database for our 14 tracked symbols
        data = StockData.query.filter_by(symbol=symbol).order_by(StockData.time.desc()).limit(30).all()
        if data:
            data.reverse()
            results = [{"time": d.time.strftime("%H:%M"), "price": d.price} for d in data]
            return results, 200
            
        # 2. If no data in DB (a randomly searched symbol), fetch live chart! (Costs 1 credit)
        api_key = KEY_1 or KEY_2
        url = f"{BASE_URL}/time_series?symbol={symbol}&interval=5min&outputsize=30&apikey={api_key}"
        try:
            res = requests.get(url, timeout=5)
            json_data = res.json()
            
            if "status" in json_data and json_data["status"] == "error":
                abort(404, message="No chart data available for this symbol.")
                
            results = []
            values = json_data.get("values", [])
            values.reverse() # Reverse to chronological order
            for v in values:
                t_obj = datetime.strptime(v['datetime'], "%Y-%m-%d %H:%M:%S")
                results.append({
                    "time": t_obj.strftime("%H:%M"),
                    "price": float(v['close'])
                })
            return results, 200
        except Exception as e:
            abort(500, message="Failed to fetch live chart data")

# Keep legacy routes alive just in case
class LegacyResource(Resource):
    def get(self): return market_cache, 200

# ─────────────────────────────
# ROUTES
# ─────────────────────────────
api.add_resource(MarketBatchResource, '/api/market/batch')
api.add_resource(QuoteResource, '/api/quote/<string:symbol>')
api.add_resource(ChartDataResource, '/api/chart/<string:symbol>')
api.add_resource(LegacyResource, '/api/stock/batch', '/api/price-change/batch')

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)