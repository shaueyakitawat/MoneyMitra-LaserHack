"""
Portfolio Analyzer - Extract and analyze portfolio data from CSV/PDF statements
"""
import pdfplumber
import csv
import re
from datetime import datetime
import os

def parse_csv_portfolio(csv_path):
    """
    Parse portfolio data from CSV file.
    Expected columns: Symbol/Stock, Quantity/Qty, Avg Price/Buy Price, Current Price/LTP
    """
    portfolio = {
        "stocks": [],
        "total_invested": 0,
        "current_value": 0,
        "total_pnl": 0,
        "total_pnl_percent": 0
    }
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as file:
            # Try to detect delimiter
            sample = file.read(1024)
            file.seek(0)
            
            sniffer = csv.Sniffer()
            try:
                delimiter = sniffer.sniff(sample).delimiter
            except:
                delimiter = ','
            
            reader = csv.DictReader(file, delimiter=delimiter)
            
            # Map possible column names to standard names
            col_mapping = {
                'symbol': ['symbol', 'stock', 'scrip', 'stock name', 'stock_name', 'security', 'instrument'],
                'quantity': ['quantity', 'qty', 'shares', 'units', 'holding'],
                'avg_price': ['avg price', 'avg_price', 'buy price', 'buy_price', 'purchase price', 'cost price', 'average price'],
                'current_price': ['current price', 'current_price', 'ltp', 'last price', 'market price', 'cmp']
            }
            
            # Normalize headers
            headers = {h.lower().strip(): h for h in reader.fieldnames}
            
            # Find matching columns
            cols = {}
            for key, variations in col_mapping.items():
                for var in variations:
                    if var in headers:
                        cols[key] = headers[var]
                        break
            
            if not all(k in cols for k in ['symbol', 'quantity', 'avg_price', 'current_price']):
                print(f"❌ Required columns not found. Available: {list(headers.keys())}")
                return None
            
            print(f"✅ Detected columns: {cols}")
            
            for row in reader:
                try:
                    # Extract values
                    symbol = row[cols['symbol']].strip().upper()
                    
                    # Clean numeric values (remove commas, rupee symbols, etc.)
                    qty_str = row[cols['quantity']].replace(',', '').replace('₹', '').strip()
                    avg_str = row[cols['avg_price']].replace(',', '').replace('₹', '').strip()
                    curr_str = row[cols['current_price']].replace(',', '').replace('₹', '').strip()
                    
                    quantity = int(float(qty_str))
                    avg_price = float(avg_str)
                    current_price = float(curr_str)
                    
                    # Calculate values
                    invested = quantity * avg_price
                    current_val = quantity * current_price
                    pnl = current_val - invested
                    pnl_percent = (pnl / invested) * 100 if invested > 0 else 0
                    
                    stock_data = {
                        "symbol": symbol,
                        "name": symbol,
                        "quantity": quantity,
                        "avg_price": round(avg_price, 2),
                        "current_price": round(current_price, 2),
                        "invested_value": round(invested, 2),
                        "current_value": round(current_val, 2),
                        "pnl": round(pnl, 2),
                        "pnl_percent": round(pnl_percent, 2)
                    }
                    
                    portfolio["stocks"].append(stock_data)
                    portfolio["total_invested"] += invested
                    portfolio["current_value"] += current_val
                    
                except (ValueError, KeyError) as e:
                    print(f"⚠️ Skipping row due to error: {e}")
                    continue
            
            # Calculate total P&L
            portfolio["total_pnl"] = portfolio["current_value"] - portfolio["total_invested"]
            if portfolio["total_invested"] > 0:
                portfolio["total_pnl_percent"] = (portfolio["total_pnl"] / portfolio["total_invested"]) * 100
            
            # Round totals
            portfolio["total_invested"] = round(portfolio["total_invested"], 2)
            portfolio["current_value"] = round(portfolio["current_value"], 2)
            portfolio["total_pnl"] = round(portfolio["total_pnl"], 2)
            portfolio["total_pnl_percent"] = round(portfolio["total_pnl_percent"], 2)
            
            return portfolio
            
    except Exception as e:
        print(f"❌ Error parsing CSV: {e}")
        return None

def extract_text_from_pdf(pdf_path):
    """Extract all text from PDF file"""
    try:
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return None

def parse_portfolio_data(text):
    """
    Parse portfolio data from extracted text.
    Looks for common patterns in broker statements (Zerodha, Groww, Upstox, etc.)
    """
    portfolio = {
        "stocks": [],
        "total_invested": 0,
        "current_value": 0,
        "total_pnl": 0,
        "total_pnl_percent": 0
    }
    
    # Common patterns for stock data
    # Pattern: Stock Name/Symbol | Quantity | Avg Price | LTP | Current Value | P&L
    
    # Try to find stock entries with various patterns
    lines = text.split('\n')
    
    for i, line in enumerate(lines):
        # Look for NSE stock symbols (usually uppercase with .NS or just capital letters)
        # Example patterns:
        # "RELIANCE 10 2450.50 2580.00 25800 1295 +5.29%"
        # "TCS | 5 | 3200.00 | 3450.00 | 17250.00 | +1250.00 | +7.81%"
        
        # Pattern 1: Find stock symbols (3-10 uppercase letters)
        stock_match = re.search(r'\b([A-Z]{3,10})\b', line)
        
        if stock_match:
            stock_symbol = stock_match.group(1)
            
            # Skip common words that aren't stocks
            skip_words = ['NSE', 'BSE', 'EQUITY', 'TOTAL', 'STOCKS', 'DATE', 'NAME', 
                         'SYMBOL', 'QTY', 'QUANTITY', 'PRICE', 'VALUE', 'CURRENT', 'AVERAGE']
            if stock_symbol in skip_words:
                continue
            
            # Try to extract numbers from the line
            numbers = re.findall(r'[\d,]+\.?\d*', line.replace(',', ''))
            numbers = [float(n) for n in numbers if n]
            
            # Need at least: quantity, avg_price, current_price
            if len(numbers) >= 3:
                try:
                    quantity = int(numbers[0])
                    avg_price = numbers[1]
                    current_price = numbers[2]
                    
                    # Calculate values
                    invested = quantity * avg_price
                    current_val = quantity * current_price
                    pnl = current_val - invested
                    pnl_percent = (pnl / invested) * 100 if invested > 0 else 0
                    
                    stock_data = {
                        "symbol": stock_symbol,
                        "name": stock_symbol,  # Will be enhanced later
                        "quantity": quantity,
                        "avg_price": avg_price,
                        "current_price": current_price,
                        "invested_value": round(invested, 2),
                        "current_value": round(current_val, 2),
                        "pnl": round(pnl, 2),
                        "pnl_percent": round(pnl_percent, 2)
                    }
                    
                    portfolio["stocks"].append(stock_data)
                    portfolio["total_invested"] += invested
                    portfolio["current_value"] += current_val
                    
                except (ValueError, IndexError) as e:
                    continue
    
    # Calculate total P&L
    portfolio["total_pnl"] = portfolio["current_value"] - portfolio["total_invested"]
    if portfolio["total_invested"] > 0:
        portfolio["total_pnl_percent"] = (portfolio["total_pnl"] / portfolio["total_invested"]) * 100
    
    # Round totals
    portfolio["total_invested"] = round(portfolio["total_invested"], 2)
    portfolio["current_value"] = round(portfolio["current_value"], 2)
    portfolio["total_pnl"] = round(portfolio["total_pnl"], 2)
    portfolio["total_pnl_percent"] = round(portfolio["total_pnl_percent"], 2)
    
    return portfolio

def analyze_portfolio_composition(portfolio):
    """
    Analyze portfolio composition and concentration
    """
    if not portfolio["stocks"]:
        return None
    
    stocks = portfolio["stocks"]
    total_value = portfolio["current_value"]
    
    # Calculate weightage for each stock
    for stock in stocks:
        stock["weightage"] = round((stock["current_value"] / total_value) * 100, 2) if total_value > 0 else 0
    
    # Sort by weightage
    stocks_by_weight = sorted(stocks, key=lambda x: x["weightage"], reverse=True)
    
    # Calculate concentration metrics
    top_5_concentration = sum([s["weightage"] for s in stocks_by_weight[:5]])
    
    # Performance metrics
    gainers = [s for s in stocks if s["pnl"] > 0]
    losers = [s for s in stocks if s["pnl"] < 0]
    
    best_performer = max(stocks, key=lambda x: x["pnl_percent"]) if stocks else None
    worst_performer = min(stocks, key=lambda x: x["pnl_percent"]) if stocks else None
    
    analysis = {
        "total_stocks": len(stocks),
        "top_5_concentration": round(top_5_concentration, 2),
        "concentration_risk": "High" if top_5_concentration > 60 else "Moderate" if top_5_concentration > 40 else "Low",
        "gainers_count": len(gainers),
        "losers_count": len(losers),
        "best_performer": best_performer,
        "worst_performer": worst_performer,
        "stocks_by_weightage": stocks_by_weight[:10]  # Top 10 holdings
    }
    
    return analysis

def generate_portfolio_insights_prompt(portfolio, analysis):
    """
    Generate prompt for Gemini API to get AI insights
    """
    prompt = f"""Analyze this Indian stock portfolio and provide comprehensive investment insights:

**Portfolio Overview:**
- Total Invested: ₹{portfolio['total_invested']:,.2f}
- Current Value: ₹{portfolio['current_value']:,.2f}
- Total P&L: ₹{portfolio['total_pnl']:,.2f} ({portfolio['total_pnl_percent']:.2f}%)
- Number of Holdings: {analysis['total_stocks']}
- Top 5 Concentration: {analysis['top_5_concentration']:.1f}%

**Holdings:**
{chr(10).join([f"- {s['symbol']}: {s['quantity']} shares @ ₹{s['current_price']:.2f} | P&L: {s['pnl_percent']:.1f}% | Weight: {s['weightage']:.1f}%" for s in portfolio['stocks'][:15]])}

**Performance:**
- Gainers: {analysis['gainers_count']} stocks
- Losers: {analysis['losers_count']} stocks
- Best Performer: {analysis['best_performer']['symbol']} (+{analysis['best_performer']['pnl_percent']:.1f}%)
- Worst Performer: {analysis['worst_performer']['symbol']} ({analysis['worst_performer']['pnl_percent']:.1f}%)

Provide analysis in these sections:

**1. Portfolio Health Score (0-100)**
Rate the portfolio based on diversification, risk, and performance.

**2. Key Strengths**
Identify 3-4 positive aspects of this portfolio.

**3. Key Weaknesses & Risks**
Identify 3-4 areas of concern or improvement.

**4. Rebalancing Recommendations**
Suggest specific actions:
- Which stocks to reduce/exit (overweight positions or underperformers)
- Sectors to increase exposure
- Diversification improvements

**5. Action Plan**
3-5 specific, actionable recommendations for the next 30 days.

Keep it concise, practical, and tailored for Indian retail investors. Use bullet points.
"""
    return prompt
