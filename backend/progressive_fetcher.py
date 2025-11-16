"""
Progressive news fetcher - Returns articles one by one as they're processed
"""
from content_aggregator import (
    OFFICIAL_SOURCES, scrape_rss_feed, scrape_sebi_content,
    get_ai_analysis_and_action, translate_content, LANGUAGES
)
from datetime import datetime
import time

def process_article_progressive(article, idx, language='en', include_ai_analysis=True):
    """Process a single article and return it immediately"""
    processed_article = {
        "id": f"{article['source'].lower().replace(' ', '_')}_{idx}_{int(time.time())}",
        "title": article["title"],
        "content": article["content"],
        "source": article["source"],
        "category": article.get("category", "General"),
        "url": article["url"],
        "verified": article.get("verified", True),
        "published": article.get("published", datetime.now().isoformat()),
        "is_recent": article.get("is_recent", True),
        "news_type": article.get("news_type", "general"),  # Add news_type to processed article
        "timestamp": datetime.now().isoformat()
    }
    
    # Add AI analysis
    if include_ai_analysis:
        try:
            print(f"  🤖 Running AI analysis...")
            ai_analysis = get_ai_analysis_and_action(article["title"], article["content"])
            
            if ai_analysis:  # Only add if analysis succeeded
                processed_article["ai_analysis"] = ai_analysis
                processed_article["summary"] = ai_analysis.get("summary", article["content"][:200] + "...")
                processed_article["action"] = ai_analysis.get("action", "WATCH")
                processed_article["sentiment"] = ai_analysis.get("sentiment", "Neutral")
            else:
                # AI failed completely - use fallback
                processed_article["summary"] = article["content"][:200] + "..."
                processed_article["action"] = "WATCH"
                processed_article["sentiment"] = "Neutral"
            
            # Longer delay to respect rate limits
            time.sleep(2.0)
        except Exception as e:
            print(f"    ⚠️ AI failed: {str(e)[:80]}")
            processed_article["summary"] = article["content"][:200] + "..."
            processed_article["action"] = "WATCH"
            processed_article["sentiment"] = "Neutral"
    
    # Translate if needed
    if language != 'en':
        try:
            processed_article["title_translated"] = translate_content(article["title"], language)
            processed_article["content_translated"] = translate_content(article["content"][:800], language)
            if "summary" in processed_article:
                processed_article["summary_translated"] = translate_content(processed_article["summary"], language)
            processed_article["language"] = LANGUAGES.get(language, language)
        except Exception as e:
            print(f"    ⚠️ Translation failed: {str(e)[:60]}")
    
    return processed_article


def classify_news_type(title, content):
    """
    Intelligently classify if news is stock-specific or general market.
    FILTERS OUT NON-MARKET NEWS.
    Returns tuple: (news_type, category) or None if not market-related
    """
    text = (title + " " + content).lower()
    
    # Filter out non-market topics (STRICT FILTERING)
    non_market_keywords = [
        'election', 'vote', 'poll', 'minister', 'government formation',
        'political', 'party', 'congress leader', 'bjp leader', 'president elected',
        'sports', 'cricket', 'football', 'entertainment', 'movie', 'actor',
        'weather', 'crime', 'accident', 'health alert', 'covid unrelated',
        'celebrity', 'fashion', 'lifestyle', 'travel', 'tourism'
    ]
    
    # If non-market content detected, check if it has strong market keywords
    if any(keyword in text for keyword in non_market_keywords):
        strong_market = any(k in text for k in ['stock', 'market', 'share', 'sensex', 'nifty', 'ipo', 'earnings', 'revenue', 'profit', 'dividend'])
        if not strong_market:
            return None  # Skip non-market articles
    
    # Stock-specific indicators (company names, IPO, earnings, quarterly results)
    stock_indicators = [
        'ipo', 'q1', 'q2', 'q3', 'q4', 'quarterly results', 'earnings',
        'profit', 'revenue', 'sales', 'acquisition', 'merger',
        'tata', 'reliance', 'infosys', 'tcs', 'wipro', 'hdfc', 'icici',
        'sbi', 'bharti', 'airtel', 'adani', 'mahindra', 'bajaj',
        'maruti', 'asian paints', 'itc', 'larsen', 'ultratech',
        'hul', 'nestle', 'britannia', 'titan', 'dmart',
        'zomato', 'paytm', 'nykaa', 'policybazaar', 'swiggy',
        'ceo', 'cmd', 'management', 'board meeting', 'dividend',
        'buyback', 'share price', 'stock split', 'bonus shares',
        'listing', 'delisting', 'promoter', 'stake sale'
    ]
    
    # General market indicators (indices, sectors, policy, economy)
    general_indicators = [
        'nifty', 'sensex', 'market', 'indices', 'index',
        'rbi', 'sebi', 'government', 'policy', 'regulation',
        'interest rate', 'repo rate', 'inflation', 'gdp',
        'economy', 'budget', 'fiscal', 'monetary',
        'sector', 'industry', 'banking sector', 'it sector',
        'pharma sector', 'auto sector', 'fmcg sector',
        'rally', 'correction', 'bull', 'bear', 'volatility',
        'trading session', 'market closes', 'market opens'
    ]
    
    # Count indicators
    stock_count = sum(1 for indicator in stock_indicators if indicator in text)
    general_count = sum(1 for indicator in general_indicators if indicator in text)
    
    # Determine category based on content
    if 'ipo' in text or 'listing' in text:
        category = 'IPO'
    elif any(q in text for q in ['q1', 'q2', 'q3', 'q4', 'quarterly', 'earnings']):
        category = 'Earnings'
    elif 'dividend' in text or 'buyback' in text:
        category = 'Corporate Action'
    elif 'acquisition' in text or 'merger' in text:
        category = 'M&A'
    elif 'policy' in text or 'regulation' in text or 'sebi' in text or 'rbi' in text:
        category = 'Regulatory'
    elif 'sector' in text or 'industry' in text:
        category = 'Sector News'
    elif 'nifty' in text or 'sensex' in text or 'index' in text:
        category = 'Market Index'
    else:
        category = 'Company News' if stock_count > 0 else 'Market News'
    
    # If strong stock indicators, mark as stock
    if stock_count >= 2 or any(indicator in text for indicator in ['ipo', 'q1', 'q2', 'q3', 'q4', 'quarterly', 'earnings']):
        return 'stock', category
    
    # If general indicators dominate, mark as general
    if general_count > stock_count:
        return 'general', category
    
    # Default: if unsure and has company name, mark as stock
    if stock_count > 0:
        return 'stock', category
    
    return 'general', category


def get_all_news_articles():
    """Fetch all news articles from sources"""
    all_content = []
    
    print("🔄 Fetching latest Indian financial news...")
    for source_key, source_info in OFFICIAL_SOURCES.items():
        print(f"  → Scraping {source_info['name']}...")
        
        if "rss_url" in source_info:
            articles = scrape_rss_feed(
                source_info["rss_url"], 
                source_info["name"], 
                max_articles=10  # Max articles per quality source
            )
        elif "url" in source_info:
            articles = scrape_sebi_content(source_info["url"], max_articles=2)
        else:
            articles = []
        
        for article in articles:
            article["verified"] = True
            
            # Intelligently classify news type and category based on content (filters non-market news)
            classification_result = classify_news_type(article["title"], article.get("content", ""))
            
            # Skip article if it's not market-related
            if classification_result is None:
                print(f"    ⚠️ Filtered out non-market: {article['title'][:50]}...")
                continue
            
            intelligent_type, intelligent_category = classification_result
            article["news_type"] = intelligent_type
            article["category"] = intelligent_category  # Override with intelligent category
            
            all_content.append(article)
    
    # Deduplicate articles by URL and title
    seen_urls = set()
    seen_titles = set()
    deduplicated = []
    
    for article in all_content:
        url = article.get('url', '')
        title = article.get('title', '').strip().lower()
        
        # Skip if we've seen this URL or very similar title
        if url and url in seen_urls:
            print(f"    🔄 Duplicate URL skipped: {article['title'][:40]}...")
            continue
        if title and title in seen_titles:
            print(f"    🔄 Duplicate title skipped: {article['title'][:40]}...")
            continue
        
        if url:
            seen_urls.add(url)
        if title:
            seen_titles.add(title)
        deduplicated.append(article)
    
    print(f"📊 Removed {len(all_content) - len(deduplicated)} duplicate articles")
    
    # Sort by date
    deduplicated.sort(key=lambda x: x.get('published', ''), reverse=True)
    
    print(f"✅ Successfully fetched {len(deduplicated)} unique news articles")
    return deduplicated[:25]  # Return top 25 most recent market-focused articles
