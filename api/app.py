import requests
import os
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime,timedelta, timezone
from flask import Flask, jsonify, make_response
from flask_cors import CORS
from flask_restful import Api, Resource, abort,fields, marshal_with

app = Flask(__name__) 
CORS(app)

# configure sqlalchemy
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///stock_data.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False 
db = SQLAlchemy(app)

# Initialize flask-restful api
api = Api(app)

# Alpha Vantage API 
API_KEY = os.environ.get("ALPHA_VANTAGE_API_KEY", "JKWNBWCZRFTZ7FY3")
EXPIRY_TIME = 30

# Track last fetch times per symbol (in-memory)
last_fetch_times = {}

# Model for stock data
class StockData(db.Model):
    __tablename__ = 'prices'
    id = db.Column(db.Integer, primary_key = True)
    symbol = db.Column(db.String(10), nullable = False)
    time = db.Column(db.DateTime, nullable = False)
    price = db.Column(db.Float, nullable= False)
    volume = db.Column(db.Integer, nullable = False)
    __table_args__ = (db.UniqueConstraint('symbol', 'time', name='unique_symbol_time'),)
    
    def __repr__(self):
        return f"StockData(symbol = {self.symbol}, time = {self.time}, price ={self.price}, volume = {self.volume})"
    

# initialize db
with app.app_context():
    db.create_all()

# function for fetching and cache stock data
def fetch_and_cache_data(symbol):
    try:
        latest_entry = StockData.query.filter_by(symbol=symbol).order_by(StockData.time.desc()).first()
        now_utc = datetime.now(timezone.utc)
        last_fetch = last_fetch_times.get(symbol)
        if last_fetch:
            time_diff = now_utc - last_fetch
        if last_fetch and time_diff < timedelta(minutes=EXPIRY_TIME):
            if latest_entry:
                return latest_entry.time.strftime("%Y-%m-%d %H:%M:%S"), latest_entry.price, latest_entry.volume
            return None
        
        url = f"https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol={symbol}&interval=5min&outputsize=compact&apikey={API_KEY}"
        response = requests.get(url)
        data = response.json()
        if "Time Series (5min)" not in data:
            print(f"API response missing time series: {data}")
            return None
        times = list(data["Time Series (5min)"].keys())[:10]
        prices = [float(data["Time Series (5min)"][t]["4. close"]) for t in times]
        volumes = [int(data["Time Series (5min)"][t]["5. volume"]) for t in times]
        
        new_entries = 0
        for t, p, v in zip(times, prices, volumes):
            time_obj = datetime.strptime(t, "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
            existing = StockData.query.filter_by(symbol=symbol, time=time_obj).first()
            if not existing:
                stock = StockData(symbol=symbol, time=time_obj, price=p, volume=v)
                db.session.add(stock)
                new_entries += 1
        db.session.commit()
        # Record the fetch time
        last_fetch_times[symbol] = now_utc
        latest_entry = StockData.query.filter_by(symbol=symbol).order_by(StockData.time.desc()).first()
        if latest_entry:
            return latest_entry.time.strftime("%Y-%m-%d %H:%M:%S"), latest_entry.price, latest_entry.volume
        return None
    except (requests.RequestException, Exception) as e:
        db.session.rollback()
        return None
    finally:
        db.session.close()

# Function to calculate SMA locally
def calculate_sma(symbol, period=5):
    rows = StockData.query.filter_by(symbol=symbol).order_by(StockData.time.desc()).limit(period).all()
    if len(rows) < period:
        fetch_and_cache_data(symbol)
        rows = StockData.query.filter_by(symbol=symbol).order_by(StockData.time.desc()).limit(period).all()
    if not rows:
        return None
    prices = [row.price for row in rows[::-1]]
    return sum(prices) / len(prices)

# Defining fields for json responses
stock_fields = {
    'id':fields.Integer,
    'symbol': fields.String,
    'time': fields.String,
    'price': fields.Float,
    'volume': fields.Integer,
    'source': fields.String
}
history_fields = {
    'symbol': fields.String,
    'history': fields.List(fields.Nested({
        'time': fields.String,
        'price': fields.Float
    }))
}
sma_fields = {
    'symbol': fields.String,
    'sma': fields.Float,
}
price_change_fields = {
    'symbol': fields.String,
    'price_change': fields.Float
}

# create stock price and volume resource
class stockResource(Resource):
    @marshal_with(stock_fields)
    def get(self, symbol):
        # check cache
        latest = StockData.query.filter_by(symbol=symbol).order_by(StockData.time.desc()).first()
        now_utc = datetime.now(timezone.utc)
        last_fetch = last_fetch_times.get(symbol)
        if last_fetch:
            time_diff = now_utc - last_fetch
        if last_fetch and time_diff < timedelta(minutes=EXPIRY_TIME):
            if latest:
                return {
                    "id": latest.id,
                    "symbol": latest.symbol,
                    "time": latest.time.strftime("%Y-%m-%d %H:%M:%S"),
                    "price": latest.price,
                    "volume": latest.volume,
                    "source": "cache"
                }, 200
            abort(400, message="No data available in cache")
        print(f"Data stale or missing for {symbol}, fetching...")
        result = fetch_and_cache_data(symbol)
        if result:
            timestamp, price, volume = result
            latest = StockData.query.filter_by(symbol=symbol).order_by(StockData.time.desc()).first()
            return {
                "id": latest.id,
                "symbol": latest.symbol,
                "time": latest.time.strftime("%Y-%m-%d %H:%M:%S"),
                "price": latest.price,
                "volume": latest.volume,
                "source": "api"
            }, 200
        if latest:
            print(f"API fetch failed, using latest available data for {symbol}")
            return {
                "id": latest.id,
                "symbol": latest.symbol,
                "time": latest.time.strftime("%Y-%m-%d %H:%M:%S"),
                "price": latest.price,
                "volume": latest.volume,
                "source": "cache (fallback)"
            }, 200
        abort(400, message="Invalid symbol or API limit reached")

# create price change resource
class priceChangeResource(Resource):
    @marshal_with(price_change_fields)
    def get(self, symbol):
        # check cache
        latest = StockData.query.filter_by(symbol= symbol).order_by(StockData.time.desc()).first()
        if not latest:
            fetch_and_cache_data(symbol)
            latest = StockData.query.filter_by(symbol=symbol).order_by(StockData.time.desc()).first()
        if not latest:
            abort(404, message = "No data available")
        earliest = StockData.query.filter_by(symbol=symbol).order_by(StockData.time.asc()).first()
        if earliest and latest:
            if earliest.price == 0:
                return {"symbol": symbol, "price_change": latest.price}, 200
            price_change = ((latest.price - earliest.price)/earliest.price)*100
            return {"symbol": symbol, "price_change": price_change}, 200
        abort(404, message = "Insufficient data for price change")

# create sma resource
class smaResource(Resource):
    @marshal_with(sma_fields)
    def get(self, symbol):
        latest = StockData.query.filter_by(symbol=symbol).order_by(StockData.time.desc()).first()
        now_utc = datetime.now(timezone.utc)
        print(f"Checking SMA for {symbol}: now={now_utc}, latest={latest.time if latest else 'None'}")
        if latest:
            time_diff = now_utc - latest.time.replace(tzinfo=timezone.utc)
            print(f"Time difference for {symbol}: {time_diff}")
            if time_diff >= timedelta(minutes=EXPIRY_TIME):
                rows = StockData.query.filter_by(symbol=symbol).order_by(StockData.time.desc()).limit(5).all()
                if len(rows) < 5:
                    print(f"Data stale and insufficient ({len(rows)} rows), fetching for {symbol}")
                    fetch_and_cache_data(symbol)
        else:
            print(f"No data for {symbol}, fetching...")
            fetch_and_cache_data(symbol)
        
        sma_value = calculate_sma(symbol)
        if sma_value is not None:
            return {"symbol": symbol, "sma": sma_value}, 200        
        abort(400, "Insufficient data to calculate SMA")
        
# create history resource
class historyResource(Resource):
    @marshal_with(history_fields)
    def get(self,symbol):
        rows = StockData.query.filter_by(symbol = symbol).order_by(StockData.time.desc()).limit(10).all()
        if rows:
            history = [{"time": row.time.strftime("%Y-%m-%d %H:%M:%S"), "price": row.price} for row in rows[::-1]]# reverse chronological order
            return {"symbol": symbol, "history":history},200
        abort(404,message= "No Historical data available")

# adding resources to api
api.add_resource(stockResource,'/api/stock/<symbol>')
api.add_resource(priceChangeResource,'/api/price-change/<symbol>')
api.add_resource(smaResource,'/api/sma/<symbol>')
api.add_resource(historyResource,'/api/history/<symbol>')

# server
if __name__ == '__main__':
    app.run(debug=True, host = "0.0.0.0", port=5000)