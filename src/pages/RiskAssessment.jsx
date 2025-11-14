import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, AlertCircle, PieChart, Target, CheckCircle2, XCircle } from 'lucide-react';
import Card from '../components/Card';

const RiskAssessment = () => {
  const [step, setStep] = useState(1); // 1: intro, 2: questionnaire, 3: results
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [age, setAge] = useState(30);
  const [investmentHorizon, setInvestmentHorizon] = useState(5);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('http://localhost:5001/risk_questions');
      const data = await response.json();
      if (data.success) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questionnaire');
    }
  };

  const handleAnswer = (questionId, score) => {
    setAnswers({ ...answers, [questionId]: score });
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    const answerArray = Object.entries(answers).map(([questionId, score]) => ({
      question_id: parseInt(questionId),
      score: score
    }));

    try {
      const response = await fetch('http://localhost:5001/calculate_risk_profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: answerArray,
          age: age,
          investment_horizon: investmentHorizon
        })
      });

      const data = await response.json();
      if (data.success) {
        setResults(data);
        setStep(3);
      } else {
        setError(data.error || 'Failed to calculate risk profile');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Network error. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const getProfileColor = (profile) => {
    switch (profile) {
      case 'conservative': return '#10b981';
      case 'moderate': return '#f59e0b';
      case 'aggressive': return '#ef4444';
      default: return '#6366f1';
    }
  };

  const startAssessment = () => {
    setStep(2);
    setCurrentQuestion(0);
    setAnswers({});
  };

  const retakeAssessment = () => {
    setStep(1);
    setCurrentQuestion(0);
    setAnswers({});
    setResults(null);
  };

  return (
    <div style={{ padding: '40px 0', minHeight: '80vh' }}>
      <div className="container">
        {/* Intro Step */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <Shield size={64} color="var(--accentGold)" style={{ marginBottom: '20px' }} />
              <h1 style={{ marginBottom: '16px', fontSize: '36px', fontWeight: '700' }}>
                Risk Assessment
              </h1>
              <p style={{ color: 'var(--textSecondary)', fontSize: '18px', maxWidth: '700px', margin: '0 auto 40px' }}>
                Discover your investor personality and get personalized portfolio recommendations
              </p>
            </div>

            <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginBottom: '40px' }}>
              <Card>
                <Target size={32} color="var(--accentGold)" style={{ marginBottom: '12px' }} />
                <h3 style={{ marginBottom: '8px', fontSize: '18px' }}>Personalized Profile</h3>
                <p style={{ color: 'var(--textSecondary)', fontSize: '14px', lineHeight: '1.6' }}>
                  Get classified as Conservative, Moderate, or Aggressive investor based on 10 comprehensive questions
                </p>
              </Card>

              <Card>
                <PieChart size={32} color="var(--accentGold)" style={{ marginBottom: '12px' }} />
                <h3 style={{ marginBottom: '8px', fontSize: '18px' }}>Asset Allocation</h3>
                <p style={{ color: 'var(--textSecondary)', fontSize: '14px', lineHeight: '1.6' }}>
                  Receive optimal equity, debt, and gold allocation tailored to your risk tolerance and goals
                </p>
              </Card>

              <Card>
                <TrendingUp size={32} color="var(--accentGold)" style={{ marginBottom: '12px' }} />
                <h3 style={{ marginBottom: '8px', fontSize: '18px' }}>Smart Recommendations</h3>
                <p style={{ color: 'var(--textSecondary)', fontSize: '14px', lineHeight: '1.6' }}>
                  Get suitable investment products, time horizons, and strategies aligned with your profile
                </p>
              </Card>
            </div>

            <Card style={{ maxWidth: '600px', margin: '0 auto' }}>
              <h3 style={{ marginBottom: '16px' }}>Before You Start</h3>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Your Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 30)}
                  min="18"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: 'var(--neutralBg)'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Investment Time Horizon (years)
                </label>
                <input
                  type="number"
                  value={investmentHorizon}
                  onChange={(e) => setInvestmentHorizon(parseInt(e.target.value) || 5)}
                  min="1"
                  max="50"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: 'var(--neutralBg)'
                  }}
                />
              </div>

              <button
                onClick={startAssessment}
                disabled={questions.length === 0}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'var(--accentGold)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: questions.length > 0 ? 'pointer' : 'not-allowed',
                  opacity: questions.length > 0 ? 1 : 0.5
                }}
              >
                Start Assessment (10 Questions)
              </button>
            </Card>
          </motion.div>
        )}

        {/* Questionnaire Step */}
        {step === 2 && questions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              {/* Progress Bar */}
              <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                  <span style={{ fontSize: '14px', color: 'var(--textSecondary)' }}>
                    {Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete
                  </span>
                </div>
                <div style={{ height: '8px', background: 'var(--neutralBg)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    background: 'var(--accentGold)',
                    width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              <Card>
                <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '600' }}>
                  {questions[currentQuestion].question}
                </h2>

                <div style={{ display: 'grid', gap: '12px' }}>
                  {questions[currentQuestion].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(questions[currentQuestion].id, option.score)}
                      style={{
                        padding: '16px',
                        textAlign: 'left',
                        border: `2px solid ${answers[questions[currentQuestion].id] === option.score ? 'var(--accentGold)' : 'var(--border)'}`,
                        borderRadius: '8px',
                        background: answers[questions[currentQuestion].id] === option.score ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                        cursor: 'pointer',
                        fontSize: '16px',
                        transition: 'all 0.2s'
                      }}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)', fontSize: '14px', color: 'var(--textSecondary)' }}>
                  💡 <strong>Why this matters:</strong> {questions[currentQuestion].rationale}
                </div>

                <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                  {currentQuestion > 0 && (
                    <button
                      onClick={() => setCurrentQuestion(currentQuestion - 1)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: 'var(--neutralBg)',
                        color: 'var(--textPrimary)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      Previous
                    </button>
                  )}
                  {Object.keys(answers).length === questions.length && (
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: 'var(--primaryCobalt)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      {loading ? 'Calculating...' : 'View Results'}
                    </button>
                  )}
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Results Step */}
        {step === 3 && results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: getProfileColor(results.risk_assessment.risk_profile),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <Shield size={40} color="white" />
              </div>
              <h1 style={{ marginBottom: '12px', fontSize: '36px', fontWeight: '700' }}>
                Your Risk Profile: {results.risk_assessment.profile_details.name}
              </h1>
              <p style={{ fontSize: '18px', color: 'var(--textSecondary)', maxWidth: '600px', margin: '0 auto' }}>
                {results.risk_assessment.profile_details.description}
              </p>
              <div style={{ marginTop: '16px', fontSize: '24px', fontWeight: '700', color: getProfileColor(results.risk_assessment.risk_profile) }}>
                Risk Score: {results.risk_assessment.total_score}/100
              </div>
            </div>

            {/* Answer Summary Card */}
            <Card style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📊 Your Assessment Summary
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '12px', background: 'var(--neutralBg)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--textSecondary)', marginBottom: '4px' }}>Age</div>
                  <div style={{ fontWeight: '600' }}>{age} years</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--neutralBg)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--textSecondary)', marginBottom: '4px' }}>Investment Horizon</div>
                  <div style={{ fontWeight: '600' }}>{investmentHorizon} years</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--neutralBg)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--textSecondary)', marginBottom: '4px' }}>Questions Answered</div>
                  <div style={{ fontWeight: '600' }}>{Object.keys(answers).length} / {questions.length}</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--neutralBg)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--textSecondary)', marginBottom: '4px' }}>Total Score</div>
                  <div style={{ fontWeight: '600', color: getProfileColor(results.risk_assessment.risk_profile) }}>
                    {results.risk_assessment.total_score}/100
                  </div>
                </div>
              </div>
            </Card>

            <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: '32px' }}>
              {/* Asset Allocation */}
              <Card>
                <h3 style={{ marginBottom: '20px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PieChart size={24} color="var(--accentGold)" />
                  Recommended Asset Allocation
                </h3>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '500' }}>Equity</span>
                      <span style={{ fontWeight: '700', color: '#3b82f6' }}>{results.asset_allocation.equity}%</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--neutralBg)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: '#3b82f6', width: `${results.asset_allocation.equity}%` }} />
                    </div>
                    {results.asset_allocation.breakdown?.equity && (
                      <div style={{ marginTop: '8px', paddingLeft: '12px', fontSize: '13px', color: 'var(--textSecondary)' }}>
                        <div>• Large Cap: {results.asset_allocation.breakdown.equity.large_cap}%</div>
                        <div>• Mid Cap: {results.asset_allocation.breakdown.equity.mid_cap}%</div>
                        <div>• Small Cap: {results.asset_allocation.breakdown.equity.small_cap}%</div>
                        {results.asset_allocation.breakdown.equity.international > 0 && (
                          <div>• International: {results.asset_allocation.breakdown.equity.international}%</div>
                        )}
                      </div>
                    )}
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '500' }}>Debt</span>
                      <span style={{ fontWeight: '700', color: '#10b981' }}>{results.asset_allocation.debt}%</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--neutralBg)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: '#10b981', width: `${results.asset_allocation.debt}%` }} />
                    </div>
                    {results.asset_allocation.breakdown?.debt && (
                      <div style={{ marginTop: '8px', paddingLeft: '12px', fontSize: '13px', color: 'var(--textSecondary)' }}>
                        <div>• Liquid Funds: {results.asset_allocation.breakdown.debt.liquid_funds}%</div>
                        {results.asset_allocation.breakdown.debt.short_duration > 0 && (
                          <div>• Short Duration: {results.asset_allocation.breakdown.debt.short_duration}%</div>
                        )}
                        <div>• Corporate Bonds: {results.asset_allocation.breakdown.debt.corporate_bonds}%</div>
                        <div>• Govt Securities: {results.asset_allocation.breakdown.debt.government_securities}%</div>
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '500' }}>Gold</span>
                      <span style={{ fontWeight: '700', color: '#f59e0b' }}>{results.asset_allocation.gold}%</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--neutralBg)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: '#f59e0b', width: `${results.asset_allocation.gold}%` }} />
                    </div>
                  </div>
                </div>
                <div style={{ padding: '12px', background: 'var(--neutralBg)', borderRadius: '8px', fontSize: '14px' }}>
                  <strong>Rebalance:</strong> {results.asset_allocation.rebalance_frequency}
                  {results.asset_allocation.rebalance_rationale && (
                    <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--textSecondary)' }}>
                      {results.asset_allocation.rebalance_rationale}
                    </div>
                  )}
                </div>
              </Card>

              {/* Expected Returns & Risk Metrics */}
              <Card>
                <h3 style={{ marginBottom: '20px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={24} color="var(--accentGold)" />
                  Expected Returns & Risk
                </h3>
                {results.asset_allocation.expected_returns ? (
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--textSecondary)', marginBottom: '4px' }}>Expected Annual Return</div>
                      <div style={{ fontWeight: '700', fontSize: '20px', color: '#10b981' }}>
                        {results.asset_allocation.expected_returns.expected_annual_return}%
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--textSecondary)', marginBottom: '4px' }}>Best Case</div>
                        <div style={{ fontWeight: '600', color: '#22c55e' }}>
                          {results.asset_allocation.expected_returns.best_case_return}%
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--textSecondary)', marginBottom: '4px' }}>Worst Case</div>
                        <div style={{ fontWeight: '600', color: '#ef4444' }}>
                          {results.asset_allocation.expected_returns.worst_case_return}%
                        </div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--textSecondary)', marginBottom: '4px' }}>Portfolio Volatility</div>
                      <div style={{ fontWeight: '600' }}>{results.asset_allocation.expected_returns.portfolio_volatility}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--textSecondary)', marginBottom: '4px' }}>Sharpe Ratio (Risk-Adjusted)</div>
                      <div style={{ fontWeight: '600' }}>{results.asset_allocation.expected_returns.sharpe_ratio}</div>
                      <div style={{ fontSize: '11px', color: 'var(--textSecondary)', marginTop: '2px' }}>
                        {results.asset_allocation.expected_returns.sharpe_ratio > 1 ? '⭐ Excellent' : 
                         results.asset_allocation.expected_returns.sharpe_ratio > 0.5 ? '✓ Good' : 'Fair'} risk-adjusted return
                      </div>
                    </div>
                    <div style={{ padding: '12px', background: 'var(--neutralBg)', borderRadius: '8px', fontSize: '13px' }}>
                      <strong>Risk Level:</strong> {results.asset_allocation.expected_returns.risk_level}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--textSecondary)', marginBottom: '4px' }}>Time Horizon</div>
                      <div style={{ fontWeight: '600' }}>{results.risk_assessment.profile_details.time_horizon}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--textSecondary)', marginBottom: '4px' }}>Volatility Tolerance</div>
                      <div style={{ fontWeight: '600' }}>{results.risk_assessment.profile_details.volatility_tolerance}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--textSecondary)', marginBottom: '4px' }}>Equity Range</div>
                      <div style={{ fontWeight: '600' }}>
                        {results.risk_assessment.profile_details.equity_allocation[0]}% - {results.risk_assessment.profile_details.equity_allocation[1]}%
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Calculation Reasoning */}
            {results.asset_allocation.reasoning && Array.isArray(results.asset_allocation.reasoning) && (
              <Card style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '16px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🧮 How We Calculated Your Allocation
                </h3>
                <div style={{ fontSize: '14px', color: 'var(--textSecondary)', marginBottom: '16px' }}>
                  Your personalized allocation is based on quantitative analysis of your answers:
                </div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {results.asset_allocation.reasoning.map((point, idx) => (
                    <div key={idx} style={{ 
                      padding: '12px', 
                      background: 'var(--neutralBg)', 
                      borderRadius: '8px',
                      borderLeft: '4px solid var(--accentGold)'
                    }}>
                      {point}
                    </div>
                  ))}
                </div>
                {results.asset_allocation.risk_metrics && (
                  <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '12px', fontSize: '14px' }}>📊 Quantitative Factors:</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '13px' }}>
                      <div>
                        <span style={{ color: 'var(--textSecondary)' }}>Risk Capacity Score:</span>
                        <strong style={{ marginLeft: '8px' }}>{results.asset_allocation.risk_metrics.risk_capacity_score}/100</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--textSecondary)' }}>Risk Tolerance Score:</span>
                        <strong style={{ marginLeft: '8px' }}>{results.asset_allocation.risk_metrics.risk_tolerance_score}/100</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--textSecondary)' }}>Constraint Factor:</span>
                        <strong style={{ marginLeft: '8px' }}>{results.asset_allocation.risk_metrics.constraint_factor}x</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--textSecondary)' }}>Horizon Factor:</span>
                        <strong style={{ marginLeft: '8px' }}>{results.asset_allocation.risk_metrics.horizon_factor}x</strong>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Suitable Products */}
            <Card style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={24} color="#10b981" />
                Suitable Investment Products
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {results.risk_assessment.profile_details.suitable_products.map((product, idx) => (
                  <span key={idx} style={{
                    padding: '8px 16px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    ✓ {product}
                  </span>
                ))}
              </div>
            </Card>

            {/* Products to Avoid */}
            <Card style={{ marginBottom: '32px' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <XCircle size={24} color="#ef4444" />
                Products to Avoid
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {results.risk_assessment.profile_details.avoid_products.map((product, idx) => (
                  <span key={idx} style={{
                    padding: '8px 16px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    ✗ {product}
                  </span>
                ))}
              </div>
            </Card>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={retakeAssessment}
                style={{
                  padding: '12px 32px',
                  background: 'var(--neutralBg)',
                  color: 'var(--textPrimary)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '16px'
                }}
              >
                Retake Assessment
              </button>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <Card style={{ background: '#fee2e2', border: '1px solid #ef4444', marginTop: '20px' }}>
            <p style={{ color: '#dc2626', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={20} />
              {error}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RiskAssessment;
