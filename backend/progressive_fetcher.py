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
                max_articles=3  # Limit per source
            )
        elif "url" in source_info:
            articles = scrape_sebi_content(source_info["url"], max_articles=2)
        else:
            articles = []
        
        for article in articles:
            article["category"] = source_info["category"]
            article["verified"] = True
            all_content.append(article)
    
    # Sort by date
    all_content.sort(key=lambda x: x.get('published', ''), reverse=True)
    
    print(f"✅ Successfully fetched {len(all_content)} news articles")
    return all_content[:10]  # Return top 10 most recent
