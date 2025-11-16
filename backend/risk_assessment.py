"""
Risk Assessment Module
Comprehensive risk profiling, portfolio analysis, and personalized recommendations
"""

import numpy as np
from typing import Dict, List, Any
from datetime import datetime
import json

# Risk Profile Categories
RISK_PROFILES = {
    "conservative": {
        "name": "Conservative",
        "score_range": (0, 30),
        "equity_allocation": (10, 30),
        "debt_allocation": (60, 80),
        "gold_allocation": (5, 15),
        "description": "Low risk tolerance. Prefers capital preservation over growth.",
        "suitable_products": ["Debt Mutual Funds", "Fixed Deposits", "Government Bonds", "Liquid Funds"],
        "avoid_products": ["Small Cap Stocks", "Derivatives", "High-risk Equity"],
        "time_horizon": "Short-term (< 3 years)",
        "volatility_tolerance": "Very Low"
    },
    "moderate": {
        "name": "Moderate",
        "score_range": (31, 60),
        "equity_allocation": (30, 60),
        "debt_allocation": (30, 60),
        "gold_allocation": (5, 15),
        "description": "Balanced approach. Seeks growth with moderate risk.",
        "suitable_products": ["Balanced Funds", "Large Cap Equity", "Index Funds", "Corporate Bonds"],
        "avoid_products": ["Penny Stocks", "Aggressive F&O", "Unregulated Products"],
        "time_horizon": "Medium-term (3-7 years)",
        "volatility_tolerance": "Moderate"
    },
    "aggressive": {
        "name": "Aggressive",
        "score_range": (61, 100),
        "equity_allocation": (60, 90),
        "debt_allocation": (5, 30),
        "gold_allocation": (5, 15),
        "description": "High risk tolerance. Seeks maximum growth potential.",
        "suitable_products": ["Small & Mid Cap Equity", "Sector Funds", "Derivatives (with caution)", "International Equity"],
        "avoid_products": ["Over-leveraged positions", "Unverified tips"],
        "time_horizon": "Long-term (> 7 years)",
        "volatility_tolerance": "High"
    }
}

# Risk Assessment Questionnaire
RISK_QUESTIONS = [
    {
        "id": 1,
        "question": "What is your age group?",
        "type": "single",
        "options": [
            {"text": "18-25 years", "score": 10},
            {"text": "26-35 years", "score": 9},
            {"text": "36-45 years", "score": 7},
            {"text": "46-55 years", "score": 5},
            {"text": "Above 55 years", "score": 3}
        ],
        "rationale": "Younger investors have more time to recover from losses"
    },
    {
        "id": 2,
        "question": "What is your investment time horizon?",
        "type": "single",
        "options": [
            {"text": "Less than 1 year", "score": 2},
            {"text": "1-3 years", "score": 4},
            {"text": "3-5 years", "score": 7},
            {"text": "5-10 years", "score": 9},
            {"text": "More than 10 years", "score": 10}
        ],
        "rationale": "Longer horizons allow weathering short-term volatility"
    },
    {
        "id": 3,
        "question": "What percentage of your monthly income do you save/invest?",
        "type": "single",
        "options": [
            {"text": "Less than 10%", "score": 3},
            {"text": "10-20%", "score": 5},
            {"text": "20-30%", "score": 7},
            {"text": "30-40%", "score": 9},
            {"text": "More than 40%", "score": 10}
        ],
        "rationale": "Higher savings rate indicates financial stability"
    },
    {
        "id": 4,
        "question": "Do you have an emergency fund covering 6 months of expenses?",
        "type": "single",
        "options": [
            {"text": "Yes, fully covered", "score": 10},
            {"text": "Partially (3-6 months)", "score": 6},
            {"text": "Minimal (< 3 months)", "score": 3},
            {"text": "No emergency fund", "score": 0}
        ],
        "rationale": "Emergency fund is crucial before taking investment risks"
    },
    {
        "id": 5,
        "question": "What is your investment experience?",
        "type": "single",
        "options": [
            {"text": "No experience", "score": 2},
            {"text": "Beginner (< 1 year)", "score": 4},
            {"text": "Intermediate (1-3 years)", "score": 7},
            {"text": "Experienced (3-5 years)", "score": 9},
            {"text": "Expert (> 5 years)", "score": 10}
        ],
        "rationale": "Experience helps handle market volatility better"
    },
    {
        "id": 6,
        "question": "If your portfolio drops 20% in a month, what would you do?",
        "type": "single",
        "options": [
            {"text": "Panic sell everything", "score": 2},
            {"text": "Sell some positions", "score": 4},
            {"text": "Hold and wait", "score": 7},
            {"text": "Buy more (averaging)", "score": 10},
            {"text": "Not sure", "score": 3}
        ],
        "rationale": "Tests emotional resilience during market downturns"
    },
    {
        "id": 7,
        "question": "What is your primary investment goal?",
        "type": "single",
        "options": [
            {"text": "Capital preservation", "score": 3},
            {"text": "Regular income", "score": 5},
            {"text": "Balanced growth", "score": 7},
            {"text": "Wealth maximization", "score": 10},
            {"text": "Retirement planning", "score": 6}
        ],
        "rationale": "Goals determine appropriate risk level"
    },
    {
        "id": 8,
        "question": "How much of your total net worth can you invest in equities?",
        "type": "single",
        "options": [
            {"text": "Less than 10%", "score": 3},
            {"text": "10-30%", "score": 5},
            {"text": "30-50%", "score": 7},
            {"text": "50-70%", "score": 9},
            {"text": "More than 70%", "score": 10}
        ],
        "rationale": "Indicates financial capacity for risk-taking"
    },
    {
        "id": 9,
        "question": "Do you have any outstanding loans?",
        "type": "single",
        "options": [
            {"text": "No loans", "score": 10},
            {"text": "Home loan only", "score": 8},
            {"text": "Multiple loans (manageable)", "score": 5},
            {"text": "High debt burden", "score": 2}
        ],
        "rationale": "High debt reduces capacity for investment risk"
    },
    {
        "id": 10,
        "question": "What annual return do you expect from equity investments?",
        "type": "single",
        "options": [
            {"text": "5-8% (realistic)", "score": 6},
            {"text": "8-12% (moderate)", "score": 8},
            {"text": "12-15% (optimistic)", "score": 10},
            {"text": "Above 15% (aggressive)", "score": 7},
            {"text": "Guaranteed returns", "score": 2}
        ],
        "rationale": "Tests understanding of market expectations"
    }
]


def calculate_risk_score(answers: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculate risk score based on questionnaire answers with detailed explanations
    """
    total_score = sum(answer.get("score", 0) for answer in answers)
    max_possible_score = sum(max(q["options"], key=lambda x: x["score"])["score"] for q in RISK_QUESTIONS)
    
    # Normalize to 100
    normalized_score = (total_score / max_possible_score) * 100
    
    # Determine risk profile
    risk_profile = None
    for profile_key, profile_data in RISK_PROFILES.items():
        min_score, max_score = profile_data["score_range"]
        if min_score <= normalized_score <= max_score:
            risk_profile = profile_key
            break
    
    # Store individual answers for allocation calculation
    answer_dict = {ans.get("question_id"): ans.get("score") for ans in answers}
    
    # Generate detailed score breakdown
    score_breakdown = []
    for answer in answers:
        q_id = answer.get("question_id")
        score = answer.get("score", 0)
        
        # Find the question
        question = next((q for q in RISK_QUESTIONS if q["id"] == q_id), None)
        if question:
            # Find the selected option
            selected_option = next((opt for opt in question["options"] if opt["score"] == score), None)
            max_score_for_q = max(opt["score"] for opt in question["options"])
            
            # Generate impact description
            if score >= max_score_for_q * 0.8:
                impact = "High risk capacity"
                impact_icon = "🟢"
            elif score >= max_score_for_q * 0.5:
                impact = "Moderate risk capacity"
                impact_icon = "🟡"
            else:
                impact = "Low risk capacity"
                impact_icon = "🔴"
            
            score_breakdown.append({
                "question": question["question"],
                "your_answer": selected_option["text"] if selected_option else "Unknown",
                "score": score,
                "max_score": max_score_for_q,
                "percentage": round((score / max_score_for_q) * 100, 1),
                "impact": impact,
                "impact_icon": impact_icon,
                "rationale": question["rationale"]
            })
    
    return {
        "total_score": round(normalized_score, 2),
        "raw_score": total_score,
        "max_possible_score": max_possible_score,
        "risk_profile": risk_profile,
        "profile_details": RISK_PROFILES.get(risk_profile, {}),
        "assessment_date": datetime.now().isoformat(),
        "answer_dict": answer_dict,
        "score_breakdown": score_breakdown
    }


def analyze_portfolio_risk(holdings: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyze portfolio risk metrics
    holdings format: [{"symbol": "RELIANCE", "quantity": 10, "avg_price": 2500, "current_price": 2600}]
    """
    if not holdings:
        return {"error": "No holdings provided"}
    
    total_investment = sum(h["quantity"] * h["avg_price"] for h in holdings)
    current_value = sum(h["quantity"] * h["current_price"] for h in holdings)
    total_pl = current_value - total_investment
    total_pl_pct = (total_pl / total_investment * 100) if total_investment > 0 else 0
    
    # Calculate concentration risk
    holding_values = [h["quantity"] * h["current_price"] for h in holdings]
    max_holding = max(holding_values) if holding_values else 0
    concentration_risk = (max_holding / current_value * 100) if current_value > 0 else 0
    
    # Diversification score (higher is better)
    num_holdings = len(holdings)
    diversification_score = min(100, num_holdings * 10)  # Max 100 for 10+ stocks
    
    # Risk level assessment
    if concentration_risk > 30:
        risk_level = "High"
        risk_message = "Portfolio is highly concentrated. Consider diversifying."
    elif concentration_risk > 20:
        risk_level = "Moderate"
        risk_message = "Reasonable concentration. Monitor large positions."
    else:
        risk_level = "Low"
        risk_message = "Well-diversified portfolio."
    
    return {
        "total_investment": round(total_investment, 2),
        "current_value": round(current_value, 2),
        "total_pl": round(total_pl, 2),
        "total_pl_percentage": round(total_pl_pct, 2),
        "num_holdings": num_holdings,
        "concentration_risk": round(concentration_risk, 2),
        "diversification_score": diversification_score,
        "risk_level": risk_level,
        "risk_message": risk_message,
        "recommendations": generate_portfolio_recommendations(concentration_risk, num_holdings, total_pl_pct)
    }


def generate_portfolio_recommendations(concentration: float, num_holdings: int, pl_pct: float) -> List[str]:
    """
    Generate actionable portfolio recommendations
    """
    recommendations = []
    
    if concentration > 30:
        recommendations.append("⚠️ Reduce concentration: Largest holding exceeds 30%. Consider booking partial profits.")
    
    if num_holdings < 5:
        recommendations.append("📊 Increase diversification: Add 5-10 quality stocks across different sectors.")
    elif num_holdings > 20:
        recommendations.append("🎯 Simplify portfolio: Too many holdings can dilute returns. Focus on top performers.")
    
    if pl_pct < -10:
        recommendations.append("🔍 Review losers: Analyze stocks with 10%+ losses. Exit fundamentally weak positions.")
    
    if pl_pct > 30:
        recommendations.append("💰 Book profits: Consider partial profit booking in high-gain positions (30%+).")
    
    recommendations.append("📈 Set stop-loss: Implement 7-10% stop-loss on all positions.")
    recommendations.append("⚖️ Rebalance quarterly: Maintain target asset allocation through regular rebalancing.")
    
    return recommendations


def calculate_var(returns: List[float], confidence_level: float = 0.95) -> float:
    """
    Calculate Value at Risk (VaR) for portfolio
    returns: list of daily/monthly return percentages
    """
    if not returns or len(returns) < 2:
        return 0.0
    
    returns_array = np.array(returns)
    var = np.percentile(returns_array, (1 - confidence_level) * 100)
    return abs(round(var, 2))


def suggest_asset_allocation(risk_profile: str, current_age: int, investment_horizon: int, answer_dict: Dict[int, int]) -> Dict[str, Any]:
    """
    Advanced asset allocation using multi-factor analysis based on actual questionnaire responses
    Implements modern portfolio theory principles with Indian market context
    """
    
    # Extract all answer scores
    age_score = answer_dict.get(1, 5)
    horizon_score = answer_dict.get(2, 5)
    savings_score = answer_dict.get(3, 5)
    emergency_score = answer_dict.get(4, 5)
    experience_score = answer_dict.get(5, 5)
    loss_tolerance_score = answer_dict.get(6, 5)
    goal_score = answer_dict.get(7, 5)
    capacity_score = answer_dict.get(8, 5)
    debt_score = answer_dict.get(9, 5)
    expectation_score = answer_dict.get(10, 5)
    
    # STEP 1: Calculate base equity using modified age rule
    # Traditional: 100 - age, but we adjust for Indian life expectancy and retirement age
    base_equity = max(20, min(85, 110 - current_age))  # More aggressive baseline for younger investors
    
    # STEP 2: Multi-factor risk capacity score (0-100)
    risk_capacity_score = (
        age_score * 1.0 +           # Age contributes to time for recovery
        horizon_score * 1.5 +       # Time horizon is critical (1.5x weight)
        savings_score * 0.8 +       # Higher savings = higher risk capacity
        emergency_score * 1.2 +     # Emergency fund is safety net (1.2x weight)
        experience_score * 0.9 +    # Experience helps handle volatility
        capacity_score * 1.0        # Net worth allocation capacity
    )
    risk_capacity_factor = risk_capacity_score / 67  # Normalize to 0-1.5 range
    
    # STEP 3: Risk tolerance/behavior score (0-100)
    risk_tolerance_score = (
        loss_tolerance_score * 2.5 +  # Most critical - how you react to losses (2.5x weight)
        goal_score * 1.2 +            # Investment goals indicate risk appetite
        expectation_score * 0.8       # Return expectations (but penalize unrealistic ones)
    )
    # Penalize unrealistic expectations (above 15% annual)
    if expectation_score >= 7:  # Expecting >15% returns
        risk_tolerance_score *= 0.85
    risk_tolerance_factor = risk_tolerance_score / 45  # Normalize to 0-1.5 range
    
    # STEP 4: Risk constraints (penalties/discounts)
    constraint_multiplier = 1.0
    
    # Emergency fund constraint - CRITICAL
    if emergency_score == 0:  # No emergency fund
        constraint_multiplier *= 0.40  # Heavy 60% reduction
    elif emergency_score <= 3:  # Minimal emergency fund
        constraint_multiplier *= 0.65  # 35% reduction
    elif emergency_score <= 6:  # Partial emergency fund
        constraint_multiplier *= 0.85  # 15% reduction
    
    # Debt burden constraint
    if debt_score <= 2:  # High debt burden
        constraint_multiplier *= 0.60  # 40% reduction
    elif debt_score <= 5:  # Manageable debt
        constraint_multiplier *= 0.80  # 20% reduction
    elif debt_score <= 8:  # Home loan only
        constraint_multiplier *= 0.95  # 5% reduction
    
    # Experience penalty for beginners with high allocation
    if experience_score <= 4 and capacity_score >= 7:
        constraint_multiplier *= 0.90  # Beginner shouldn't allocate >50% to equity
    
    # STEP 5: Time horizon adjustments (critical for equity allocation)
    horizon_multiplier = 1.0
    if investment_horizon < 1:
        horizon_multiplier = 0.20  # Very short term - mostly debt
    elif investment_horizon < 3:
        horizon_multiplier = 0.50  # Short term - conservative
    elif investment_horizon < 5:
        horizon_multiplier = 0.75  # Medium term - balanced
    elif investment_horizon < 7:
        horizon_multiplier = 0.95  # Medium-long term
    elif investment_horizon < 10:
        horizon_multiplier = 1.10  # Long term - can take more risk
    else:
        horizon_multiplier = 1.25  # Very long term - maximize growth
    
    # STEP 6: Calculate final equity allocation
    # Combine all factors with appropriate weighting
    equity_pct = base_equity * (
        (risk_capacity_factor * 0.35) +      # 35% weight on capacity
        (risk_tolerance_factor * 0.40) +     # 40% weight on tolerance (behavior)
        (horizon_multiplier * 0.25)           # 25% weight on time horizon
    ) * constraint_multiplier
    
    # Apply realistic bounds based on profile
    if risk_profile == "conservative":
        equity_pct = max(10, min(35, equity_pct))
    elif risk_profile == "moderate":
        equity_pct = max(25, min(65, equity_pct))
    else:  # aggressive
        equity_pct = max(45, min(90, equity_pct))
    
    equity_pct = round(equity_pct)
    
    # STEP 7: Calculate debt and gold allocation (strategic)
    remaining = 100 - equity_pct
    
    # Gold allocation: 8-15% for hedging, higher when equity is high
    if equity_pct >= 70:
        gold_pct = min(15, round(remaining * 0.18))  # 18% of remaining, max 15%
    elif equity_pct >= 50:
        gold_pct = min(12, round(remaining * 0.15))  # 15% of remaining, max 12%
    else:
        gold_pct = min(10, round(remaining * 0.12))  # 12% of remaining, max 10%
    
    debt_pct = remaining - gold_pct
    
    # STEP 8: Detailed equity breakdown based on experience and risk tolerance
    if experience_score <= 4:  # Beginners: Focus on large caps
        large_cap_pct = round(equity_pct * 0.75)
        mid_cap_pct = round(equity_pct * 0.20)
        small_cap_pct = equity_pct - large_cap_pct - mid_cap_pct
        intl_equity_pct = 0
    elif experience_score <= 7:  # Intermediate: Balanced approach
        large_cap_pct = round(equity_pct * 0.55)
        mid_cap_pct = round(equity_pct * 0.30)
        small_cap_pct = round(equity_pct * 0.10)
        intl_equity_pct = equity_pct - large_cap_pct - mid_cap_pct - small_cap_pct
    else:  # Experienced: Can handle volatility
        if loss_tolerance_score >= 8:  # Aggressive experienced investor
            large_cap_pct = round(equity_pct * 0.40)
            mid_cap_pct = round(equity_pct * 0.35)
            small_cap_pct = round(equity_pct * 0.15)
            intl_equity_pct = equity_pct - large_cap_pct - mid_cap_pct - small_cap_pct
        else:  # Conservative experienced investor
            large_cap_pct = round(equity_pct * 0.50)
            mid_cap_pct = round(equity_pct * 0.30)
            small_cap_pct = round(equity_pct * 0.12)
            intl_equity_pct = equity_pct - large_cap_pct - mid_cap_pct - small_cap_pct
    
    # STEP 9: Detailed debt breakdown based on risk profile and horizon
    if investment_horizon < 3:  # Short term: High liquidity
        liquid_funds_pct = round(debt_pct * 0.50)
        short_duration_pct = round(debt_pct * 0.35)
        govt_securities_pct = round(debt_pct * 0.15)
        corporate_bonds_pct = 0
    elif investment_horizon < 7:  # Medium term: Balanced
        liquid_funds_pct = round(debt_pct * 0.25)
        short_duration_pct = round(debt_pct * 0.25)
        corporate_bonds_pct = round(debt_pct * 0.35)
        govt_securities_pct = debt_pct - liquid_funds_pct - short_duration_pct - corporate_bonds_pct
    else:  # Long term: Higher yield focus
        liquid_funds_pct = round(debt_pct * 0.15)
        short_duration_pct = round(debt_pct * 0.15)
        corporate_bonds_pct = round(debt_pct * 0.50)
        govt_securities_pct = debt_pct - liquid_funds_pct - short_duration_pct - corporate_bonds_pct
    
    # STEP 10: Rebalancing frequency based on volatility exposure
    if equity_pct >= 65:
        rebalance_freq = "Quarterly"
        rebalance_rationale = "High equity allocation requires frequent monitoring"
    elif equity_pct >= 45:
        rebalance_freq = "Semi-annually"
        rebalance_rationale = "Moderate allocation benefits from bi-annual rebalancing"
    else:
        rebalance_freq = "Annually"
        rebalance_rationale = "Conservative allocation needs less frequent adjustment"
    
    # STEP 11: Generate detailed reasoning
    reasoning_points = []
    reasoning_points.append(f"Base: {base_equity}% equity for age {current_age} (Modified 110-age rule)")
    
    if emergency_score < 6:
        reasoning_points.append(f"⚠️ Emergency fund penalty applied: Reduced allocation by {int((1-constraint_multiplier)*100)}%")
    else:
        reasoning_points.append(f"✓ Adequate emergency fund: Full allocation capacity")
    
    if debt_score <= 5:
        reasoning_points.append(f"⚠️ Debt burden considered: Conservative approach recommended")
    
    if investment_horizon >= 10:
        reasoning_points.append(f"🎯 Long-term horizon ({investment_horizon}y): Maximizing growth potential")
    elif investment_horizon < 3:
        reasoning_points.append(f"⏱️ Short-term horizon ({investment_horizon}y): Prioritizing capital preservation")
    else:
        reasoning_points.append(f"⚖️ Medium-term horizon ({investment_horizon}y): Balanced approach")
    
    if loss_tolerance_score >= 8:
        reasoning_points.append(f"💪 High loss tolerance: Can weather market volatility")
    elif loss_tolerance_score <= 4:
        reasoning_points.append(f"🛡️ Low loss tolerance: Focus on stability over growth")
    
    if experience_score <= 4:
        reasoning_points.append(f"📚 Beginner investor: Large-cap focus (75% of equity)")
    elif experience_score >= 8:
        reasoning_points.append(f"🎓 Experienced investor: Diversified across market caps")
    
    expected_returns = calculate_expected_returns(equity_pct, debt_pct, gold_pct)
    
    return {
        "equity": equity_pct,
        "debt": debt_pct,
        "gold": gold_pct,
        "breakdown": {
            "equity": {
                "large_cap": large_cap_pct,
                "mid_cap": mid_cap_pct,
                "small_cap": small_cap_pct,
                "international": intl_equity_pct
            },
            "debt": {
                "liquid_funds": liquid_funds_pct,
                "short_duration": short_duration_pct,
                "corporate_bonds": corporate_bonds_pct,
                "government_securities": govt_securities_pct
            },
            "gold": {
                "gold_etf": gold_pct
            }
        },
        "rebalance_frequency": rebalance_freq,
        "rebalance_rationale": rebalance_rationale,
        "expected_returns": expected_returns,
        "reasoning": reasoning_points,
        "risk_metrics": {
            "risk_capacity_score": round(risk_capacity_score, 1),
            "risk_tolerance_score": round(risk_tolerance_score, 1),
            "constraint_factor": round(constraint_multiplier, 2),
            "horizon_factor": round(horizon_multiplier, 2)
        }
    }


def calculate_expected_returns(equity_pct: float, debt_pct: float, gold_pct: float) -> Dict[str, Any]:
    """
    Calculate expected returns based on historical Indian market data
    These are realistic long-term expectations, not guarantees
    """
    # Historical average returns (India, 2010-2024)
    equity_return = 12.5  # NIFTY 50 long-term CAGR
    debt_return = 7.0     # Debt funds average
    gold_return = 8.5     # Gold long-term appreciation
    
    # Portfolio expected return
    expected_return = (
        (equity_pct / 100 * equity_return) +
        (debt_pct / 100 * debt_return) +
        (gold_pct / 100 * gold_return)
    )
    
    # Calculate volatility (standard deviation) approximation
    equity_volatility = 18.0  # Historical equity volatility
    debt_volatility = 4.0     # Debt volatility
    gold_volatility = 12.0    # Gold volatility
    
    portfolio_volatility = np.sqrt(
        ((equity_pct / 100) ** 2 * (equity_volatility ** 2)) +
        ((debt_pct / 100) ** 2 * (debt_volatility ** 2)) +
        ((gold_pct / 100) ** 2 * (gold_volatility ** 2))
    )
    
    # Risk-adjusted return (Sharpe ratio approximation, assuming 6% risk-free rate)
    risk_free_rate = 6.0
    sharpe_ratio = (expected_return - risk_free_rate) / portfolio_volatility if portfolio_volatility > 0 else 0
    
    return {
        "expected_annual_return": round(expected_return, 2),
        "best_case_return": round(expected_return + portfolio_volatility, 2),
        "worst_case_return": round(expected_return - portfolio_volatility, 2),
        "portfolio_volatility": round(portfolio_volatility, 2),
        "sharpe_ratio": round(sharpe_ratio, 2),
        "risk_level": "High" if portfolio_volatility > 15 else "Moderate" if portfolio_volatility > 10 else "Low"
    }


def get_risk_questions():
    """Return risk assessment questionnaire"""
    return RISK_QUESTIONS


def get_risk_profiles():
    """Return all risk profile definitions"""
    return RISK_PROFILES


def calculate_corpus_investment_plan(corpus: float, allocation: Dict[str, Any], mode: str = 'lump_sum') -> Dict[str, Any]:
    """
    Generate detailed investment plan for a given corpus
    
    Args:
        corpus: Total investment amount in INR
        allocation: Asset allocation dict with equity, debt, gold percentages
        mode: 'lump_sum' or 'sip'
    
    Returns:
        Detailed investment plan with rupee breakdowns
    """
    equity_pct = allocation.get('equity', 50)
    debt_pct = allocation.get('debt', 40)
    gold_pct = allocation.get('gold', 10)
    
    # Calculate absolute amounts
    equity_amount = corpus * (equity_pct / 100)
    debt_amount = corpus * (debt_pct / 100)
    gold_amount = corpus * (gold_pct / 100)
    
    # Get breakdown details
    breakdown = allocation.get('breakdown', {})
    equity_breakdown = breakdown.get('equity', {})
    debt_breakdown = breakdown.get('debt', {})
    
    # Detailed equity allocation
    equity_plan = {
        "total": round(equity_amount, 2),
        "percentage": equity_pct,
        "large_cap": {
            "amount": round(equity_amount * (equity_breakdown.get('large_cap', 0) / 100), 2),
            "percentage": equity_breakdown.get('large_cap', 0),
            "suggested_instruments": [
                "Nifty 50 Index Fund",
                "ICICI Pru Bluechip Fund",
                "HDFC Top 100 Fund"
            ]
        },
        "mid_cap": {
            "amount": round(equity_amount * (equity_breakdown.get('mid_cap', 0) / 100), 2),
            "percentage": equity_breakdown.get('mid_cap', 0),
            "suggested_instruments": [
                "Nifty Midcap 150 Index Fund",
                "Kotak Emerging Equity Fund",
                "PGIM India Midcap Opportunities Fund"
            ]
        },
        "small_cap": {
            "amount": round(equity_amount * (equity_breakdown.get('small_cap', 0) / 100), 2),
            "percentage": equity_breakdown.get('small_cap', 0),
            "suggested_instruments": [
                "Nippon India Small Cap Fund",
                "Axis Small Cap Fund",
                "SBI Small Cap Fund"
            ]
        },
        "international": {
            "amount": round(equity_amount * (equity_breakdown.get('international', 0) / 100), 2),
            "percentage": equity_breakdown.get('international', 0),
            "suggested_instruments": [
                "Motilal Oswal S&P 500 Index Fund",
                "Nippon India US Equity Opportunities Fund",
                "ICICI Pru US Bluechip Equity Fund"
            ]
        }
    }
    
    # Detailed debt allocation
    debt_plan = {
        "total": round(debt_amount, 2),
        "percentage": debt_pct,
        "liquid_funds": {
            "amount": round(debt_amount * (debt_breakdown.get('liquid_funds', 0) / 100), 2),
            "percentage": debt_breakdown.get('liquid_funds', 0),
            "suggested_instruments": [
                "HDFC Liquid Fund",
                "ICICI Pru Liquid Fund",
                "SBI Liquid Fund"
            ]
        },
        "short_duration": {
            "amount": round(debt_amount * (debt_breakdown.get('short_duration', 0) / 100), 2),
            "percentage": debt_breakdown.get('short_duration', 0),
            "suggested_instruments": [
                "HDFC Short Term Debt Fund",
                "ICICI Pru Short Term Fund",
                "Axis Short Term Fund"
            ]
        },
        "corporate_bonds": {
            "amount": round(debt_amount * (debt_breakdown.get('corporate_bonds', 0) / 100), 2),
            "percentage": debt_breakdown.get('corporate_bonds', 0),
            "suggested_instruments": [
                "ICICI Pru Corporate Bond Fund",
                "HDFC Corporate Bond Fund",
                "Axis Corporate Debt Fund"
            ]
        },
        "government_securities": {
            "amount": round(debt_amount * (debt_breakdown.get('government_securities', 0) / 100), 2),
            "percentage": debt_breakdown.get('government_securities', 0),
            "suggested_instruments": [
                "Bharat Bond ETF",
                "SBI Magnum Gilt Fund",
                "ICICI Pru Gilt Fund"
            ]
        }
    }
    
    # Gold allocation
    gold_plan = {
        "total": round(gold_amount, 2),
        "percentage": gold_pct,
        "suggested_instruments": [
            "Nippon India Gold Savings Fund",
            "SBI Gold ETF",
            "ICICI Pru Gold ETF",
            "Sovereign Gold Bonds (SGB)"
        ]
    }
    
    # SIP plan calculation
    sip_plan = None
    if mode == 'sip':
        # Assume monthly SIP for different durations
        durations = [12, 24, 36, 60]  # months
        sip_plan = {}
        for months in durations:
            monthly_amount = round(corpus / months, 2)
            sip_plan[f"{months}_months"] = {
                "monthly_sip": monthly_amount,
                "total_invested": corpus,
                "duration_months": months,
                "equity_sip": round(monthly_amount * (equity_pct / 100), 2),
                "debt_sip": round(monthly_amount * (debt_pct / 100), 2),
                "gold_sip": round(monthly_amount * (gold_pct / 100), 2)
            }
    
    # Expected growth projections
    expected_returns = allocation.get('expected_returns', {})
    expected_return = expected_returns.get('expected_annual_return', 10)
    
    # Calculate future value projections (3, 5, 10 years)
    projections = {}
    for years in [3, 5, 10]:
        if mode == 'lump_sum':
            # Lump sum future value: P * (1 + r)^n
            future_value = corpus * ((1 + expected_return/100) ** years)
        else:
            # SIP future value: P * [((1+r)^n - 1) / r] * (1+r)
            monthly_rate = expected_return / 12 / 100
            months = years * 12
            monthly_sip = corpus / months
            future_value = monthly_sip * (((1 + monthly_rate) ** months - 1) / monthly_rate) * (1 + monthly_rate)
        
        projections[f"{years}_years"] = {
            "future_value": round(future_value, 2),
            "gains": round(future_value - corpus, 2),
            "total_return_pct": round(((future_value - corpus) / corpus) * 100, 2) if corpus > 0 else 0
        }
    
    return {
        "corpus": corpus,
        "mode": mode,
        "allocation": {
            "equity": equity_plan,
            "debt": debt_plan,
            "gold": gold_plan
        },
        "sip_plan": sip_plan,
        "projections": projections,
        "expected_annual_return": expected_return,
        "recommendations": [
            "📊 Diversify across suggested instruments in each category",
            "🔄 Review and rebalance portfolio " + allocation.get('rebalance_frequency', 'quarterly'),
            "💰 Consider tax-saving options: ELSS funds for 80C benefits",
            "🎯 Set up automatic monthly investments to avoid timing risk",
            "📈 Monitor portfolio performance against benchmarks quarterly",
            "🛡️ Maintain emergency fund (6 months expenses) before investing"
        ]
    }


if __name__ == "__main__":
    # Test risk assessment
    sample_answers = [
        {"question_id": 1, "score": 9},
        {"question_id": 2, "score": 10},
        {"question_id": 3, "score": 7},
        {"question_id": 4, "score": 10},
        {"question_id": 5, "score": 7},
        {"question_id": 6, "score": 10},
        {"question_id": 7, "score": 10},
        {"question_id": 8, "score": 9},
        {"question_id": 9, "score": 10},
        {"question_id": 10, "score": 10}
    ]
    
    result = calculate_risk_score(sample_answers)
    print(json.dumps(result, indent=2))
    
    # Test portfolio analysis
    sample_holdings = [
        {"symbol": "RELIANCE", "quantity": 10, "avg_price": 2500, "current_price": 2600},
        {"symbol": "TCS", "quantity": 5, "avg_price": 3500, "current_price": 3700},
        {"symbol": "INFY", "quantity": 15, "avg_price": 1400, "current_price": 1500}
    ]
    
    portfolio_risk = analyze_portfolio_risk(sample_holdings)
    print(json.dumps(portfolio_risk, indent=2))
