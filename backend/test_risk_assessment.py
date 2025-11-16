"""
Unit tests for risk assessment module
Run with: python -m pytest test_risk_assessment.py -v
Or simply: python test_risk_assessment.py
"""

import sys
import json
from risk_assessment import (
    calculate_risk_score, suggest_asset_allocation, 
    analyze_portfolio_risk, calculate_corpus_investment_plan,
    get_risk_questions, get_risk_profiles, RISK_QUESTIONS
)

def test_risk_score_calculation():
    """Test risk score calculation logic"""
    print("\n🧪 Test 1: Risk Score Calculation")
    
    # Conservative answers (low scores)
    conservative_answers = [
        {"question_id": 1, "score": 3},  # Age 46-55
        {"question_id": 2, "score": 2},  # < 1 year horizon
        {"question_id": 3, "score": 3},  # < 10% savings
        {"question_id": 4, "score": 0},  # No emergency fund
        {"question_id": 5, "score": 2},  # No experience
        {"question_id": 6, "score": 2},  # Panic sell
        {"question_id": 7, "score": 3},  # Capital preservation
        {"question_id": 8, "score": 3},  # < 10% in equity
        {"question_id": 9, "score": 2},  # High debt
        {"question_id": 10, "score": 2}  # Guaranteed returns
    ]
    
    result = calculate_risk_score(conservative_answers)
    print(f"  Conservative Profile:")
    print(f"    Score: {result['total_score']}/100")
    print(f"    Profile: {result['risk_profile']}")
    assert result['risk_profile'] == 'conservative', "Should be conservative"
    assert result['total_score'] < 35, "Score should be below 35"
    print("  ✅ Conservative test passed")
    
    # Aggressive answers (high scores)
    aggressive_answers = [
        {"question_id": 1, "score": 10},  # 18-25 years
        {"question_id": 2, "score": 10},  # > 10 years horizon
        {"question_id": 3, "score": 10},  # > 40% savings
        {"question_id": 4, "score": 10},  # Full emergency fund
        {"question_id": 5, "score": 10},  # Expert experience
        {"question_id": 6, "score": 10},  # Buy more on dips
        {"question_id": 7, "score": 10},  # Wealth maximization
        {"question_id": 8, "score": 10},  # > 70% in equity
        {"question_id": 9, "score": 10},  # No loans
        {"question_id": 10, "score": 10}  # 12-15% expected
    ]
    
    result = calculate_risk_score(aggressive_answers)
    print(f"\n  Aggressive Profile:")
    print(f"    Score: {result['total_score']}/100")
    print(f"    Profile: {result['risk_profile']}")
    assert result['risk_profile'] == 'aggressive', "Should be aggressive"
    assert result['total_score'] > 65, "Score should be above 65"
    print("  ✅ Aggressive test passed")


def test_asset_allocation():
    """Test asset allocation recommendations"""
    print("\n🧪 Test 2: Asset Allocation")
    
    # Young aggressive investor
    answer_dict = {i: 10 for i in range(1, 11)}  # All max scores
    allocation = suggest_asset_allocation('aggressive', 25, 15, answer_dict)
    
    print(f"  Young Aggressive Investor (25y, 15y horizon):")
    print(f"    Equity: {allocation['equity']}%")
    print(f"    Debt: {allocation['debt']}%")
    print(f"    Gold: {allocation['gold']}%")
    
    assert allocation['equity'] >= 60, "Should have high equity allocation"
    assert allocation['equity'] + allocation['debt'] + allocation['gold'] == 100, "Should sum to 100%"
    
    # Check breakdown exists
    assert 'breakdown' in allocation
    assert 'equity' in allocation['breakdown']
    assert 'large_cap' in allocation['breakdown']['equity']
    print("  ✅ Allocation test passed")
    
    # Old conservative investor
    answer_dict = {i: 3 for i in range(1, 11)}  # All low scores
    allocation = suggest_asset_allocation('conservative', 60, 3, answer_dict)
    
    print(f"\n  Older Conservative Investor (60y, 3y horizon):")
    print(f"    Equity: {allocation['equity']}%")
    print(f"    Debt: {allocation['debt']}%")
    print(f"    Gold: {allocation['gold']}%")
    
    assert allocation['equity'] <= 35, "Should have low equity allocation"
    assert allocation['debt'] >= 50, "Should have high debt allocation"
    print("  ✅ Conservative allocation test passed")


def test_portfolio_risk_analysis():
    """Test portfolio risk metrics"""
    print("\n🧪 Test 3: Portfolio Risk Analysis")
    
    holdings = [
        {"symbol": "RELIANCE", "quantity": 100, "avg_price": 2500, "current_price": 2600},
        {"symbol": "TCS", "quantity": 50, "avg_price": 3500, "current_price": 3700},
        {"symbol": "INFY", "quantity": 150, "avg_price": 1400, "current_price": 1500}
    ]
    
    analysis = analyze_portfolio_risk(holdings)
    
    print(f"  Portfolio Analysis:")
    print(f"    Total Investment: ₹{analysis['total_investment']:,.2f}")
    print(f"    Current Value: ₹{analysis['current_value']:,.2f}")
    print(f"    P&L: ₹{analysis['total_pl']:,.2f} ({analysis['total_pl_percentage']}%)")
    print(f"    Holdings: {analysis['num_holdings']}")
    print(f"    Concentration Risk: {analysis['concentration_risk']}%")
    print(f"    Risk Level: {analysis['risk_level']}")
    
    assert analysis['total_investment'] > 0
    assert analysis['num_holdings'] == 3
    assert analysis['concentration_risk'] >= 0
    assert analysis['diversification_score'] >= 0
    print("  ✅ Portfolio analysis test passed")


def test_corpus_investment_plan():
    """Test corpus investment plan generation"""
    print("\n🧪 Test 4: Corpus Investment Plan")
    
    corpus = 1000000  # 10 lakhs
    allocation = {
        "equity": 60,
        "debt": 30,
        "gold": 10,
        "breakdown": {
            "equity": {
                "large_cap": 40,
                "mid_cap": 15,
                "small_cap": 5,
                "international": 0
            },
            "debt": {
                "liquid_funds": 10,
                "short_duration": 10,
                "corporate_bonds": 8,
                "government_securities": 2
            }
        },
        "expected_returns": {
            "expected_annual_return": 12
        },
        "rebalance_frequency": "Quarterly"
    }
    
    # Test lump sum
    plan = calculate_corpus_investment_plan(corpus, allocation, 'lump_sum')
    
    print(f"  Lump Sum Investment Plan (₹10 lakhs):")
    print(f"    Equity: ₹{plan['allocation']['equity']['total']:,.2f}")
    print(f"    Debt: ₹{plan['allocation']['debt']['total']:,.2f}")
    print(f"    Gold: ₹{plan['allocation']['gold']['total']:,.2f}")
    
    assert plan['corpus'] == corpus
    assert plan['mode'] == 'lump_sum'
    assert plan['allocation']['equity']['total'] == 600000
    assert plan['allocation']['debt']['total'] == 300000
    assert plan['allocation']['gold']['total'] == 100000
    
    # Check projections
    assert '5_years' in plan['projections']
    print(f"    5-year projection: ₹{plan['projections']['5_years']['future_value']:,.2f}")
    print("  ✅ Lump sum plan test passed")
    
    # Test SIP
    plan = calculate_corpus_investment_plan(corpus, allocation, 'sip')
    
    print(f"\n  SIP Investment Plan (₹10 lakhs):")
    assert plan['mode'] == 'sip'
    assert plan['sip_plan'] is not None
    assert '36_months' in plan['sip_plan']
    
    monthly_sip = plan['sip_plan']['36_months']['monthly_sip']
    print(f"    36-month SIP: ₹{monthly_sip:,.2f}/month")
    print(f"    Equity SIP: ₹{plan['sip_plan']['36_months']['equity_sip']:,.2f}/month")
    print("  ✅ SIP plan test passed")


def test_questionnaire_validity():
    """Test questionnaire structure and validity"""
    print("\n🧪 Test 5: Questionnaire Validity")
    
    questions = get_risk_questions()
    
    print(f"  Total Questions: {len(questions)}")
    assert len(questions) == 10, "Should have exactly 10 questions"
    
    # Check each question structure
    for i, q in enumerate(questions, 1):
        assert 'id' in q, f"Question {i} missing id"
        assert 'question' in q, f"Question {i} missing question text"
        assert 'options' in q, f"Question {i} missing options"
        assert 'rationale' in q, f"Question {i} missing rationale"
        
        # Check options
        assert len(q['options']) >= 2, f"Question {i} needs at least 2 options"
        for opt in q['options']:
            assert 'text' in opt, f"Option missing text in question {i}"
            assert 'score' in opt, f"Option missing score in question {i}"
            assert 0 <= opt['score'] <= 10, f"Score out of range in question {i}"
    
    print("  ✅ Questionnaire validity test passed")


def test_risk_profiles():
    """Test risk profile definitions"""
    print("\n🧪 Test 6: Risk Profiles")
    
    profiles = get_risk_profiles()
    
    print(f"  Risk Profiles: {list(profiles.keys())}")
    assert 'conservative' in profiles
    assert 'moderate' in profiles
    assert 'aggressive' in profiles
    
    for profile_name, profile_data in profiles.items():
        assert 'name' in profile_data
        assert 'score_range' in profile_data
        assert 'equity_allocation' in profile_data
        assert 'debt_allocation' in profile_data
        assert 'description' in profile_data
        assert 'suitable_products' in profile_data
        
        print(f"    {profile_name.upper()}:")
        print(f"      Score Range: {profile_data['score_range']}")
        print(f"      Equity Range: {profile_data['equity_allocation']}")
    
    print("  ✅ Risk profiles test passed")


def test_edge_cases():
    """Test edge cases and error handling"""
    print("\n🧪 Test 7: Edge Cases")
    
    # Empty answers
    try:
        result = calculate_risk_score([])
        print("  ⚠️  Empty answers didn't raise error (score: {result['total_score']})")
    except Exception as e:
        print(f"  ✅ Empty answers handled: {type(e).__name__}")
    
    # Invalid corpus (should handle gracefully)
    allocation = {"equity": 60, "debt": 30, "gold": 10, "breakdown": {"equity": {}, "debt": {}}, "expected_returns": {"expected_annual_return": 10}}
    plan = calculate_corpus_investment_plan(0, allocation, 'lump_sum')
    assert plan['corpus'] == 0
    print("  ✅ Zero corpus handled")
    
    # Empty portfolio
    analysis = analyze_portfolio_risk([])
    assert 'error' in analysis
    print("  ✅ Empty portfolio handled")


def run_all_tests():
    """Run all test suites"""
    print("=" * 60)
    print("🚀 RISK ASSESSMENT MODULE - UNIT TESTS")
    print("=" * 60)
    
    try:
        test_questionnaire_validity()
        test_risk_profiles()
        test_risk_score_calculation()
        test_asset_allocation()
        test_portfolio_risk_analysis()
        test_corpus_investment_plan()
        test_edge_cases()
        
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        return True
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
