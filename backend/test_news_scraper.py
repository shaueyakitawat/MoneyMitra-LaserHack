"""
Quick test script to verify news scraping works
"""
from content_aggregator import get_aggregated_content
import json

print("=" * 60)
print("TESTING FINANCIAL NEWS SCRAPER")
print("=" * 60)

# Test fetching news
result = get_aggregated_content(language="en", include_summary=False, include_ai_analysis=False)

if result.get("success"):
    print(f"\n✅ SUCCESS! Fetched {result['count']} articles")
    print(f"Sources: {', '.join(result.get('sources', []))}")
    print(f"\nSample articles:\n")
    
    for i, article in enumerate(result['content'][:5], 1):
        print(f"{i}. {article['title']}")
        print(f"   Source: {article['source']} | Category: {article['category']}")
        print(f"   URL: {article['url'][:80]}...")
        print(f"   Content preview: {article['content'][:150]}...\n")
else:
    print(f"\n❌ FAILED: {result.get('error', 'Unknown error')}")

print("=" * 60)
