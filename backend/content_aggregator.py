"""
SEBI/NISM/NSE Content Aggregator and Summarizer
Scrapes official content, summarizes using AI, and translates to vernacular languages
"""

import requests
from bs4 import BeautifulSoup
from deep_translator import GoogleTranslator
import json
import os
from datetime import datetime
from typing import Dict, List, Any
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

# Initialize Groq LLM for summarization
groq_llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.3)

# Official sources
OFFICIAL_SOURCES = {
    "sebi": {
        "name": "SEBI Investor Awareness",
        "urls": [
            "https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=4&ssid=41&smid=0",
            "https://investor.sebi.gov.in/"
        ],
        "category": "Regulatory"
    },
    "nism": {
        "name": "NISM Financial Education",
        "urls": [
            "https://www.nism.ac.in/",
        ],
        "category": "Education"
    },
    "nse": {
        "name": "NSE Investor Education",
        "urls": [
            "https://www.nseindia.com/education/content/ig_homepage.htm"
        ],
        "category": "Market"
    }
}

# Supported languages for translation
LANGUAGES = {
    "hi": "Hindi",
    "mr": "Marathi", 
    "gu": "Gujarati",
    "ta": "Tamil",
    "te": "Telugu",
    "bn": "Bengali",
    "kn": "Kannada",
    "ml": "Malayalam"
}


def scrape_sebi_content(url: str, max_articles: int = 5) -> List[Dict[str, Any]]:
    """
    Scrape content from SEBI website
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        articles = []
        
        # Find content sections (this is generic - adjust based on actual SEBI site structure)
        content_divs = soup.find_all(['div', 'article', 'section'], class_=['content', 'article', 'post'], limit=max_articles)
        
        if not content_divs:
            # Fallback: get all paragraphs
            paragraphs = soup.find_all('p', limit=20)
            if paragraphs:
                content = ' '.join([p.get_text().strip() for p in paragraphs if len(p.get_text().strip()) > 50])
                articles.append({
                    "title": "SEBI Guidelines",
                    "content": content[:1500],  # Limit content length
                    "url": url,
                    "source": "SEBI"
                })
        else:
            for div in content_divs:
                title = div.find(['h1', 'h2', 'h3', 'h4'])
                content_tags = div.find_all('p')
                
                if title and content_tags:
                    content = ' '.join([p.get_text().strip() for p in content_tags])
                    if len(content) > 100:  # Only include substantial content
                        articles.append({
                            "title": title.get_text().strip(),
                            "content": content[:1500],
                            "url": url,
                            "source": "SEBI"
                        })
        
        return articles
        
    except Exception as e:
        print(f"Error scraping {url}: {str(e)}")
        return []


def get_demo_sebi_content() -> List[Dict[str, Any]]:
    """
    Provide comprehensive investor education content (SEBI/NISM guidelines)
    """
    return [
        {
            "title": "Understanding Mutual Funds and SIP Investment",
            "content": "Mutual funds pool money from multiple investors to invest in diversified portfolios of stocks, bonds, or other securities managed by professional fund managers. Types include Equity Funds (growth-focused, higher risk), Debt Funds (fixed income, lower risk), Hybrid Funds (balanced approach), and Index Funds (passive tracking). Systematic Investment Plan (SIP) allows investing fixed amounts regularly, benefiting from rupee cost averaging and compounding. Key metrics: NAV (Net Asset Value), Expense Ratio (annual fees), Exit Load (penalty for early withdrawal), and AUM (Assets Under Management). SEBI mandates disclosure of all charges, past performance, and risk factors. Investors should assess their financial goals, time horizon, and risk appetite before selecting schemes.",
            "summary": "Mutual funds offer professional management and diversification across equity, debt, and hybrid options. SIP enables disciplined investing through regular contributions. Choose funds based on your goals, risk tolerance, and always check expense ratios and SEBI disclosures.",
            "url": "https://www.sebi.gov.in/investor-education/mutual-funds",
            "source": "SEBI",
            "verified": True,
            "category": "Mutual Funds"
        },
        {
            "title": "KYC and Demat Account Essentials",
            "content": "Know Your Customer (KYC) is mandatory for all market participants. Required documents: PAN Card (mandatory), Aadhaar Card (for e-KYC), address proof, photograph, and income proof (for derivatives). KYC is one-time and valid across all SEBI intermediaries. Demat Account holds securities in electronic form - safer than physical certificates. Types: Regular Demat (full-service brokers), Basic Services Demat Account (BSDA) for small investors with holdings up to ₹2 lakh, enjoy zero annual charges. Key rights: Receive contract notes within 24 hours, statement of accounts monthly, and protection under Investor Protection Fund up to ₹25 lakh. Always verify broker registration on SEBI website before opening accounts.",
            "summary": "Complete one-time KYC with PAN and Aadhaar for all market access. Open BSDA demat account (free for holdings under ₹2L). Verify broker on SEBI website and ensure you receive contract notes within 24 hours.",
            "url": "https://www.sebi.gov.in/investor-education/kyc-demat",
            "source": "SEBI",
            "verified": True,
            "category": "Account Setup"
        },
        {
            "title": "Stock Market Trading: Equity vs Derivatives",
            "content": "Equity Trading: Buying/selling company shares for delivery or intraday. Settlement cycle: T+2 (trade day plus 2 days). Circuit Filters: 5%, 10%, 20% limits prevent extreme volatility. Derivatives: Futures and Options contracts derived from underlying assets (stocks, indices). Futures: Agreement to buy/sell at predetermined price on future date, requires margin payment. Options: Right (not obligation) to buy (Call) or sell (Put) at strike price. High leverage but higher risk - can lose entire premium. Only invest spare capital. Key concepts: Lot Size (minimum trading quantity), Expiry (last Thursday of month), Mark-to-Market (daily profit/loss settlement), Margin (collateral required). SEBI mandates risk disclosure documents before derivatives trading activation.",
            "summary": "Equity offers ownership with T+2 settlement. Derivatives (F&O) provide leverage but carry high risk - you can lose your entire investment. Start with equity delivery before exploring derivatives. Always read SEBI risk disclosures.",
            "url": "https://www.nseindia.com/education/trading-basics",
            "source": "NSE",
            "verified": True,
            "category": "Trading"
        },
        {
            "title": "IPO Investment: Process and Evaluation",
            "content": "Initial Public Offering (IPO) is when private company offers shares to public for first time. Categories: Retail (up to ₹2 lakh), HNI (High Net-worth ₹2L-₹10L), and Institutional. Application through ASBA (Applications Supported by Blocked Amount) - amount blocked in bank, deducted only on allotment. Evaluation factors: Company fundamentals, promoter track record, industry outlook, valuation (Price-to-Earnings ratio), utilization of funds, and competitive positioning. Read DRHP (Draft Red Herring Prospectus) carefully. Grey Market Premium is unofficial indicator, not guaranteed. Allotment basis lottery for oversubscribed IPOs. Listing gains not guaranteed - focus on long-term value. Check SEBI registration of intermediaries. Avoid unofficial channels or tip providers.",
            "summary": "Apply to IPOs via ASBA through your bank. Read DRHP to evaluate company fundamentals, promoter background, and valuation. Don't rely on grey market premium. Invest for long-term, not just listing gains.",
            "url": "https://www.sebi.gov.in/investor-education/ipo",
            "source": "SEBI",
            "verified": True,
            "category": "IPO"
        },
        {
            "title": "Risk Management and Portfolio Diversification",
            "content": "Never put all eggs in one basket - diversify across asset classes (equity, debt, gold, real estate), sectors (IT, banking, pharma, FMCG), and market caps (large, mid, small). Asset Allocation: Age-based formula (100 - age = % in equity). Rebalance annually. Stop Loss: Predetermined exit point to limit losses (typically 7-10% below purchase). Position Sizing: Don't invest more than 5-10% of portfolio in single stock. Risk Types: Market Risk (overall market movement), Credit Risk (default), Liquidity Risk (inability to sell), and Concentration Risk (over-exposure). Beta measures volatility vs market. Standard Deviation indicates price fluctuation. Sharpe Ratio: risk-adjusted returns. Emergency fund: 6 months expenses before investing. Avoid leverage for beginners. Don't time the market; stay invested for long term.",
            "summary": "Diversify across assets, sectors, and market caps. Use 100-age formula for equity allocation. Set 7-10% stop-loss limits. Never invest more than 5-10% in one stock. Build 6-month emergency fund first.",
            "url": "https://www.nism.ac.in/investor-education/risk-management",
            "source": "NISM",
            "verified": True,
            "category": "Risk Management"
        },
        {
            "title": "Understanding Market Orders and Trading Types",
            "content": "Order Types: Market Order (immediate execution at current price, use for liquid stocks), Limit Order (execution at specified price or better), Stop-Loss Order (triggers when price hits specified level), Good Till Cancelled (GTC) orders valid for 7 days. Trading Types: Cash Segment (delivery-based, T+2 settlement), Intraday (square-off same day before 3:20 PM, higher leverage), Margin Trading Facility (MTF - borrow funds from broker, interest charged), Short Selling (sell first, buy later in intraday, not allowed for delivery in equity). Circuit Breakers: 10%, 15%, 20% market-wide triggers halt trading to prevent panic. Trading Hours: Pre-market 9:00-9:15 AM, Normal 9:15 AM-3:30 PM, Post-market 3:40-4:00 PM. Regularly monitor contract notes, ledger, and holdings statements.",
            "summary": "Use market orders for quick execution, limit orders for price control, and stop-loss for risk management. Intraday must square-off by 3:20 PM. Check contract notes daily and understand circuit breakers.",
            "url": "https://www.nseindia.com/education/order-types",
            "source": "NSE",
            "verified": True,
            "category": "Trading Mechanics"
        },
        {
            "title": "Fundamental Analysis: Reading Financial Statements",
            "content": "Balance Sheet: Assets (what company owns), Liabilities (what it owes), Equity (net worth). Key ratios: Debt-to-Equity (financial leverage, <1 is healthy), Current Ratio (liquidity, >1.5 is good). Profit & Loss Statement: Revenue, Operating Expenses, Net Profit. Look for consistent growth. Cash Flow Statement: Operating (core business), Investing (capex), Financing (debt/equity). Positive operating cash flow is crucial. Key Metrics: EPS (Earnings Per Share), P/E Ratio (Price to Earnings, lower is cheaper but compare within sector), ROE (Return on Equity, >15% is excellent), ROCE (Return on Capital Employed), Book Value (asset value per share). Red flags: Declining revenue, mounting debt, negative cash flow, promoter pledging, frequent management changes, audit qualifications.",
            "summary": "Check Debt-to-Equity (<1), ROE (>15%), and positive cash flow. Compare P/E within sector. Watch for red flags: declining revenue, mounting debt, promoter pledging, and management changes.",
            "url": "https://www.nism.ac.in/education/fundamental-analysis",
            "source": "NISM",
            "verified": True,
            "category": "Fundamental Analysis"
        },
        {
            "title": "Technical Analysis: Charts and Indicators",
            "content": "Chart Patterns: Support (price floor where buying emerges), Resistance (price ceiling with selling pressure), Trend Lines (connect highs/lows to identify direction). Patterns: Head & Shoulders (reversal), Double Top/Bottom (reversal), Cup & Handle (continuation), Triangles (breakout plays). Indicators: Moving Averages (50-day, 200-day show trend, golden cross when 50 crosses above 200 is bullish), RSI (Relative Strength Index, >70 overbought, <30 oversold), MACD (momentum indicator, histogram shows strength), Bollinger Bands (volatility, price touching bands suggests reversal). Volume confirms price moves - rising price with high volume validates uptrend. Japanese Candlesticks: Green (closing > opening), Red (closing < opening). Patterns: Doji (indecision), Hammer (bullish reversal), Shooting Star (bearish). Fibonacci Retracement levels (23.6%, 38.2%, 61.8%) identify support/resistance.",
            "summary": "Use 50-day and 200-day MAs for trend direction. RSI >70 signals overbought, <30 oversold. Volume confirms price movements. Learn key patterns: Head & Shoulders, Double Top/Bottom, and candlestick formations.",
            "url": "https://www.nseindia.com/education/technical-analysis",
            "source": "NSE",
            "verified": True,
            "category": "Technical Analysis"
        },
        {
            "title": "Tax Implications on Trading and Investments",
            "content": "Equity Delivery: Long-term (>1 year) gains >₹1 lakh taxed at 10%, no indexation. Short-term (<1 year) at 15%. Intraday & F&O: Speculative business income taxed per income tax slab (up to 30%). Set off: Intraday losses can be carried forward 4 years, set off against speculative gains only. Equity losses against equity gains. Mutual Funds: Equity funds - LTCG 10% (>₹1L), STCG 15%. Debt funds taxed as per slab since April 2023. Dividend Distribution Tax abolished; dividends taxable as income. TDS: 10% on dividends >₹5000 per company. Securities Transaction Tax (STT) charged on equity transactions. Maintain detailed records: contract notes, bank statements, P&L statements. File ITR-2 (capital gains without business) or ITR-3 (with F&O). Declare all foreign assets. Consult tax professional for complex cases.",
            "summary": "LTCG >₹1L taxed at 10%, STCG at 15%. F&O taxed as business income (up to 30%). Carry forward losses for 4 years. File ITR-2 or ITR-3. Maintain all contract notes and trade records.",
            "url": "https://www.sebi.gov.in/investor-education/taxation",
            "source": "SEBI",
            "verified": True,
            "category": "Taxation"
        },
        {
            "title": "Investor Protection and Grievance Redressal",
            "content": "SCORES (SEBI Complaints Redress System): Online portal for investor complaints against listed companies and intermediaries. Register at scores.sebi.gov.in. Mandated 30-day resolution. Escalation: Stock Exchange Investor Grievance Cell → SEBI → SAT (Securities Appellate Tribunal) → Courts. Investor Protection Fund: Compensation up to ₹25 lakh for broker defaults through IPF Trust. IEPF (Investor Education and Protection Fund): Unclaimed dividends, matured deposits transferred after 7 years; can be claimed anytime. Arbitration: Faster alternative through stock exchange arbitration panels for trading disputes up to ₹1 crore. Check intermediary registration: www.sebi.gov.in/intermediaries. Verify company status on BSE/NSE before investing. Red flags: Unregistered advisors, guaranteed return promises, pressure to invest immediately, unofficial payment channels, tips from anonymous sources. Report suspicious activities to SEBI immediately.",
            "summary": "File complaints on SCORES (30-day resolution). Get up to ₹25L protection through IPF for broker defaults. Always verify intermediaries on SEBI website. Report unregistered advisors and suspicious activities immediately.",
            "url": "https://scores.sebi.gov.in",
            "source": "SEBI",
            "verified": True,
            "category": "Investor Protection"
        },
        {
            "title": "Avoiding Investment Frauds and Scams",
            "content": "Common Frauds: Ponzi Schemes (new investor money pays old investors, unsustainable), Pump & Dump (artificially inflate penny stock prices through false tips, then sell), Unauthorized Trading (broker trades without consent), Frontrunning (broker trades before executing client order), Circular Trading (create artificial volume). Red Flags: Guaranteed high returns (15-20%+ monthly), pressure tactics, unregistered entities, requests for cash/third-party payments, insider trading tips, unsolicited calls/messages, cryptocurrency Ponzi schemes. Verification: Check SEBI registration (broker, advisor, PMS), company fundamentals on BSE/NSE websites, avoid WhatsApp/Telegram tip providers, be cautious of YouTube/Instagram finfluencers without SEBI registration. Safe Practices: Invest only through registered platforms, maintain separate trading credentials, enable 2FA, monitor accounts regularly, don't share OTP/passwords, verify contract notes daily. Report suspicious activities: SEBI helpline 1800-266-7575, cybercrime.gov.in for online frauds.",
            "summary": "Beware of guaranteed returns (15-20%+ monthly), WhatsApp/Telegram tips, and unregistered advisors. Verify SEBI registration before investing. Never share OTP/passwords. Report frauds: 1800-266-7575.",
            "url": "https://investor.sebi.gov.in/fraud-prevention",
            "source": "SEBI",
            "verified": True,
            "category": "Fraud Prevention"
        },
        {
            "title": "Algorithmic and High-Frequency Trading Basics",
            "content": "Algorithmic Trading: Computer programs execute trades based on predefined strategies (moving average crossovers, arbitrage, momentum). Reduces emotional bias, enables backtesting, faster execution. Requires: Trading API from broker, programming knowledge (Python, Java), historical data, risk management framework. Retail algos use indicators (RSI, MACD, Bollinger Bands) for entry/exit signals. High-Frequency Trading (HFT): Sophisticated algorithms executing thousands of trades in microseconds, exploiting tiny price differences. Requires: Colocation (servers near exchange), ultra-low latency networks, advanced infrastructure. Primarily institutional domain. SEBI Regulations: Algo orders tagged separately, kill switch for emergency stop, audit trail requirements, minimum resting time for orders. Retail investors must: Start with paper trading, avoid over-optimization (curve fitting), implement strict stop-losses, monitor system constantly. Risks: Technology failures, flash crashes, over-leverage. Not suitable for beginners without programming and market knowledge.",
            "summary": "Algo trading automates strategy execution using code. Requires programming skills (Python/Java) and broker API. Start with paper trading. HFT is institutional-only. SEBI mandates kill switches and audit trails.",
            "url": "https://www.nism.ac.in/education/algo-trading",
            "source": "NISM",
            "verified": True,
            "category": "Algo Trading"
        }
    ]


def summarize_content(text: str, max_length: int = 100) -> str:
    """
    Summarize content using Groq LLM
    """
    try:
        prompt = f"""Create a concise, actionable 2-3 sentence summary of this financial education content for retail investors in India. Focus on the most important takeaways and practical steps. Use simple language and avoid jargon.

Content: {text}

Summary (max {max_length} words):"""
        
        response = groq_llm.invoke(prompt)
        return response.content.strip()
        
    except Exception as e:
        print(f"Summarization error: {str(e)}")
        # Fallback: simple truncation
        words = text.split()
        return ' '.join(words[:max_length]) + "..."


def translate_content(text: str, target_language: str) -> str:
    """
    Translate content to target vernacular language
    """
    try:
        if target_language == "en":
            return text
            
        translator = GoogleTranslator(source='en', target=target_language)
        # Split long text into chunks (Google Translate has limits)
        max_chunk_size = 4500
        if len(text) <= max_chunk_size:
            return translator.translate(text)
        
        # Translate in chunks
        chunks = [text[i:i+max_chunk_size] for i in range(0, len(text), max_chunk_size)]
        translated_chunks = [translator.translate(chunk) for chunk in chunks]
        return ' '.join(translated_chunks)
        
    except Exception as e:
        print(f"Translation error for {target_language}: {str(e)}")
        return text


def get_aggregated_content(language: str = "en", include_summary: bool = True) -> Dict[str, Any]:
    """
    Main function to get aggregated, summarized, and translated content
    """
    all_content = []
    
    # Try to scrape live content
    print("Attempting to fetch live SEBI/NISM content...")
    for source_key, source_info in OFFICIAL_SOURCES.items():
        for url in source_info["urls"][:1]:  # Limit to first URL per source
            articles = scrape_sebi_content(url, max_articles=2)
            for article in articles:
                article["category"] = source_info["category"]
                article["verified"] = True
                all_content.append(article)
    
    # If scraping failed or returned no content, use demo content
    if not all_content:
        print("Using demo content for presentation...")
        all_content = get_demo_sebi_content()
    
    # Process each article
    processed_content = []
    for article in all_content:
        processed_article = {
            "id": f"{article['source'].lower()}_{len(processed_content)}",
            "title": article["title"],
            "content": article["content"],
            "source": article["source"],
            "category": article.get("category", "General"),
            "url": article["url"],
            "verified": article.get("verified", True),
            "timestamp": datetime.now().isoformat()
        }
        
        # Add summary if requested
        if include_summary:
            # Use pre-written summary if available, otherwise generate with AI
            if "summary" in article and article["summary"]:
                processed_article["summary"] = article["summary"]
            else:
                processed_article["summary"] = summarize_content(article["content"])
        
        # Translate if not English
        if language != "en":
            processed_article["title_translated"] = translate_content(article["title"], language)
            processed_article["content_translated"] = translate_content(article["content"], language)
            if include_summary:
                processed_article["summary_translated"] = translate_content(processed_article["summary"], language)
            processed_article["language"] = LANGUAGES.get(language, language)
        
        processed_content.append(processed_article)
    
    return {
        "success": True,
        "count": len(processed_content),
        "language": language,
        "language_name": LANGUAGES.get(language, "English"),
        "content": processed_content,
        "sources": list(OFFICIAL_SOURCES.keys()),
        "last_updated": datetime.now().isoformat()
    }


if __name__ == "__main__":
    # Test the aggregator
    print("Testing SEBI Content Aggregator...")
    result = get_aggregated_content(language="hi", include_summary=True)
    print(json.dumps(result, indent=2, ensure_ascii=False))
