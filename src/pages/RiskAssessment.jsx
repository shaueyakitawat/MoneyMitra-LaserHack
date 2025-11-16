import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, AlertCircle, PieChart, Target, CheckCircle2, XCircle, Sparkles, IndianRupee } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Card from '../components/Card';

const RiskAssessment = () => {
  const [step, setStep] = useState(1); // 1: intro, 2: questionnaire, 3: results
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [age, setAge] = useState(30);
  const [investmentHorizon, setInvestmentHorizon] = useState(5);
  const [corpus, setCorpus] = useState(100000);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('http://localhost:5001/risk_questions');
      const data = await response.json();
      if (data.success) {
        // Filter out questions 1 (age) and 2 (investment horizon) since we ask them in pre-questions
        const filteredQuestions = data.questions.filter(q => q.id !== 1 && q.id !== 2);
        setQuestions(filteredQuestions);
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
    setCurrentQuestion(-3); // Start with age question
    setAnswers({});
  };

  const retakeAssessment = () => {
    setStep(1);
    setCurrentQuestion(-3);
    setAnswers({});
    setResults(null);
    setAiInsights(null);
  };

  const fetchAIInsights = async () => {
    if (!results) return;
    
    setLoadingAI(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5001/ai_risk_insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          risk_profile: results.risk_assessment.risk_profile,
          risk_score: results.risk_assessment.total_score,
          corpus: corpus,
          age: age,
          investment_horizon: investmentHorizon,
          allocation: results.asset_allocation
        })
      });

      const data = await response.json();
      if (data.success) {
        setAiInsights(data.insights);
      } else {
        setError(data.error || 'Failed to generate AI insights');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to fetch AI insights. Please try again.');
    } finally {
      setLoadingAI(false);
    }
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

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={startAssessment}
                disabled={questions.length === 0}
                style={{
                  padding: '16px 48px',
                  background: 'var(--accentGold)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: questions.length > 0 ? 'pointer' : 'not-allowed',
                  opacity: questions.length > 0 ? 1 : 0.5,
                  boxShadow: questions.length > 0 ? '0 4px 12px rgba(212, 175, 55, 0.3)' : 'none',
                  transition: 'all 0.3s'
                }}
              >
                Start Assessment (10 Questions)
              </button>
            </div>
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
                    {currentQuestion === -3 ? 'Basic Info 1/3' : 
                     currentQuestion === -2 ? 'Basic Info 2/3' : 
                     currentQuestion === -1 ? 'Basic Info 3/3' : 
                     `Question ${currentQuestion + 1} of ${questions.length}`}
                  </span>
                  <span style={{ fontSize: '14px', color: 'var(--textSecondary)' }}>
                    {currentQuestion < 0 ? 
                      Math.round(((currentQuestion + 4) / (questions.length + 3)) * 100) :
                      Math.round(((currentQuestion + 4) / (questions.length + 3)) * 100)}% Complete
                  </span>
                </div>
                <div style={{ height: '8px', background: 'var(--neutralBg)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    background: 'var(--accentGold)',
                    width: `${currentQuestion < 0 ? 
                      ((currentQuestion + 4) / (questions.length + 3)) * 100 :
                      ((currentQuestion + 4) / (questions.length + 3)) * 100}%`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              <Card>
                {/* Age Input */}
                {currentQuestion === -3 && (
                  <>
                    <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '600' }}>
                      What is your age?
                    </h2>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setAge('');
                        } else {
                          const parsed = parseInt(val);
                          setAge(isNaN(parsed) ? 30 : parsed);
                        }
                      }}
                      min="18"
                      max="100"
                      style={{
                        width: '100%',
                        padding: '16px',
                        border: '2px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '20px',
                        background: 'var(--neutralBg)',
                        textAlign: 'center',
                        fontWeight: '600'
                      }}
                    />
                    <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)', fontSize: '14px', color: 'var(--textSecondary)' }}>
                      💡 <strong>Why this matters:</strong> Age helps determine your investment time horizon and risk capacity. Younger investors typically have more time to recover from market downturns.
                    </div>
                    <button
                      onClick={() => setCurrentQuestion(-2)}
                      disabled={!age || age < 18 || age > 100}
                      style={{
                        marginTop: '24px',
                        width: '100%',
                        padding: '14px',
                        background: (age >= 18 && age <= 100) ? 'var(--primaryCobalt)' : 'var(--neutralBg)',
                        color: (age >= 18 && age <= 100) ? 'white' : 'var(--textSecondary)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: (age >= 18 && age <= 100) ? 'pointer' : 'not-allowed',
                        fontWeight: '600',
                        fontSize: '16px'
                      }}
                    >
                      Next
                    </button>
                  </>
                )}

                {/* Investment Horizon Input */}
                {currentQuestion === -2 && (
                  <>
                    <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '600' }}>
                      What is your investment time horizon?
                    </h2>
                    <input
                      type="number"
                      value={investmentHorizon}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setInvestmentHorizon('');
                        } else {
                          const parsed = parseInt(val);
                          setInvestmentHorizon(isNaN(parsed) ? 5 : parsed);
                        }
                      }}
                      min="1"
                      max="50"
                      style={{
                        width: '100%',
                        padding: '16px',
                        border: '2px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '20px',
                        background: 'var(--neutralBg)',
                        textAlign: 'center',
                        fontWeight: '600'
                      }}
                    />
                    <div style={{ marginTop: '8px', fontSize: '14px', color: 'var(--textSecondary)', textAlign: 'center' }}>
                      {investmentHorizon} years
                    </div>
                    <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)', fontSize: '14px', color: 'var(--textSecondary)' }}>
                      💡 <strong>Why this matters:</strong> Longer investment horizons allow you to take more risk and potentially earn higher returns. Short-term investors should be more conservative.
                    </div>
                    <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => setCurrentQuestion(-3)}
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
                      <button
                        onClick={() => setCurrentQuestion(-1)}
                        disabled={!investmentHorizon || investmentHorizon < 1}
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: (investmentHorizon && investmentHorizon >= 1) ? 'var(--primaryCobalt)' : 'var(--neutralBg)',
                          color: (investmentHorizon && investmentHorizon >= 1) ? 'white' : 'var(--textSecondary)',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: investmentHorizon >= 1 ? 'pointer' : 'not-allowed',
                          fontWeight: '600'
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}

                {/* Corpus Input */}
                {currentQuestion === -1 && (
                  <>
                    <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '600' }}>
                      <IndianRupee size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
                      What is your available investment corpus?
                    </h2>
                    <input
                      type="number"
                      value={corpus}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setCorpus('');
                        } else {
                          const parsed = parseInt(val);
                          setCorpus(isNaN(parsed) ? 100000 : parsed);
                        }
                      }}
                      min="10000"
                      max="100000000"
                      step="10000"
                      style={{
                        width: '100%',
                        padding: '16px',
                        border: '2px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '20px',
                        background: 'var(--neutralBg)',
                        textAlign: 'center',
                        fontWeight: '600'
                      }}
                    />
                    <div style={{ marginTop: '8px', fontSize: '16px', color: 'var(--textSecondary)', textAlign: 'center', fontWeight: '600' }}>
                      {corpus ? `₹${corpus.toLocaleString('en-IN')}` : '₹0'}
                    </div>
                    <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)', fontSize: '14px', color: 'var(--textSecondary)' }}>
                      💡 <strong>Why this matters:</strong> Your corpus size helps us create a practical investment plan with specific fund recommendations and allocation amounts.
                    </div>
                    <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => setCurrentQuestion(-2)}
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
                      <button
                        onClick={() => setCurrentQuestion(0)}
                        disabled={!corpus || corpus < 10000}
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: (corpus && corpus >= 10000) ? 'var(--primaryCobalt)' : 'var(--neutralBg)',
                          color: (corpus && corpus >= 10000) ? 'white' : 'var(--textSecondary)',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: corpus >= 10000 ? 'pointer' : 'not-allowed',
                          fontWeight: '600'
                        }}
                      >
                        Start Questions
                      </button>
                    </div>
                  </>
                )}

                {/* Regular Questions */}
                {currentQuestion >= 0 && (
                  <>
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
                      {currentQuestion === 0 && (
                        <button
                          onClick={() => setCurrentQuestion(-1)}
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
                  </>
                )}
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

            {/* Detailed Risk Score Breakdown */}
            {results.risk_assessment.score_breakdown && (
              <Card style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '16px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📊 How We Calculated Your Risk Score
                </h3>
                <div style={{ fontSize: '14px', color: 'var(--textSecondary)', marginBottom: '20px', lineHeight: '1.6' }}>
                  Your total risk score of <strong style={{ color: getProfileColor(results.risk_assessment.risk_profile) }}>{results.risk_assessment.total_score}/100</strong> is calculated from {results.risk_assessment.score_breakdown.length} questions. 
                  Each question evaluates different aspects of your financial situation and risk tolerance.
                </div>

                <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--neutralBg)', borderRadius: '12px', border: '2px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>Your Total Score</span>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: getProfileColor(results.risk_assessment.risk_profile) }}>
                      {results.risk_assessment.raw_score}/{results.risk_assessment.max_possible_score} points
                    </span>
                  </div>
                  <div style={{ height: '12px', background: '#e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      background: `linear-gradient(90deg, ${getProfileColor(results.risk_assessment.risk_profile)}, ${getProfileColor(results.risk_assessment.risk_profile)}dd)`,
                      width: `${results.risk_assessment.total_score}%`,
                      transition: 'width 1s ease'
                    }} />
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--textSecondary)' }}>
                    Normalized Score: {results.risk_assessment.total_score}% → <strong>{results.risk_assessment.profile_details.name} Profile</strong>
                  </div>
                </div>

                <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', color: 'var(--textPrimary)' }}>
                  Question-by-Question Breakdown:
                </div>
                
                <div style={{ display: 'grid', gap: '16px' }}>
                  {results.risk_assessment.score_breakdown.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      style={{ 
                        padding: '16px', 
                        background: 'white',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        borderLeft: `4px solid ${item.percentage >= 80 ? '#10b981' : item.percentage >= 50 ? '#f59e0b' : '#ef4444'}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--textPrimary)' }}>
                            {idx + 1}. {item.question}
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--textSecondary)', marginBottom: '4px' }}>
                            <strong>Your Answer:</strong> {item.your_answer}
                          </div>
                        </div>
                        <div style={{ 
                          minWidth: '80px', 
                          textAlign: 'right',
                          padding: '8px 12px',
                          background: 'var(--neutralBg)',
                          borderRadius: '8px'
                        }}>
                          <div style={{ fontSize: '18px', fontWeight: '700', color: getProfileColor(results.risk_assessment.risk_profile) }}>
                            {item.score}/{item.max_score}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--textSecondary)', marginTop: '2px' }}>
                            {item.percentage}%
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        padding: '10px',
                        background: 'var(--neutralBg)',
                        borderRadius: '8px',
                        fontSize: '13px',
                        marginBottom: '8px'
                      }}>
                        <span style={{ fontSize: '16px' }}>{item.impact_icon}</span>
                        <span style={{ fontWeight: '600' }}>{item.impact}</span>
                      </div>

                      <div style={{ 
                        fontSize: '12px', 
                        color: 'var(--textSecondary)', 
                        fontStyle: 'italic',
                        paddingLeft: '12px',
                        borderLeft: '2px solid var(--border)',
                        marginTop: '8px'
                      }}>
                        💡 {item.rationale}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(102, 126, 234, 0.05)', borderRadius: '12px', border: '1px solid rgba(102, 126, 234, 0.2)' }}>
                  <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>🎯 What This Means:</div>
                  <div style={{ fontSize: '13px', color: 'var(--textSecondary)', lineHeight: '1.7' }}>
                    Based on your {results.risk_assessment.total_score}/100 score, you are classified as a <strong>{results.risk_assessment.profile_details.name} investor</strong>. 
                    This profile suggests you {results.risk_assessment.profile_details.description.toLowerCase()} 
                    Your recommended asset allocation reflects this by balancing growth potential with risk management appropriate for your profile.
                  </div>
                </div>
              </Card>
            )}

            {/* Calculation Reasoning */}
            {results.asset_allocation.reasoning && Array.isArray(results.asset_allocation.reasoning) && (
              <Card style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '16px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🧮 How We Calculated Your Asset Allocation
                </h3>
                <div style={{ fontSize: '14px', color: 'var(--textSecondary)', marginBottom: '16px', lineHeight: '1.6' }}>
                  Your personalized allocation of <strong style={{ color: '#3b82f6' }}>{results.asset_allocation.equity}% Equity</strong>, 
                  <strong style={{ color: '#10b981' }}> {results.asset_allocation.debt}% Debt</strong>, and 
                  <strong style={{ color: '#f59e0b' }}> {results.asset_allocation.gold}% Gold</strong> is calculated using a multi-factor algorithm 
                  that considers your risk profile, age, investment horizon, financial stability, and behavioral factors.
                </div>

                <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--neutralBg)', borderRadius: '12px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '12px', fontSize: '14px' }}>⚙️ Algorithm Steps:</div>
                  <div style={{ display: 'grid', gap: '10px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ fontWeight: '700', color: 'var(--accentGold)', minWidth: '20px' }}>1.</span>
                      <span>Base equity allocation calculated using modified age rule (110 - age = {110 - age}%)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ fontWeight: '700', color: 'var(--accentGold)', minWidth: '20px' }}>2.</span>
                      <span>Risk capacity score computed from age, time horizon, savings rate, emergency fund, and net worth capacity</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ fontWeight: '700', color: 'var(--accentGold)', minWidth: '20px' }}>3.</span>
                      <span>Risk tolerance score assessed from your emotional response to losses, investment goals, and return expectations</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ fontWeight: '700', color: 'var(--accentGold)', minWidth: '20px' }}>4.</span>
                      <span>Constraint penalties applied for missing emergency fund, high debt burden, or beginner status</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ fontWeight: '700', color: 'var(--accentGold)', minWidth: '20px' }}>5.</span>
                      <span>Time horizon multiplier adjusts allocation based on investment duration ({investmentHorizon} years)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ fontWeight: '700', color: 'var(--accentGold)', minWidth: '20px' }}>6.</span>
                      <span>Final allocation capped within your risk profile ranges and diversified across sub-asset classes</span>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', color: 'var(--textPrimary)' }}>
                  Key Factors That Influenced Your Allocation:
                </div>
                
                <div style={{ display: 'grid', gap: '12px' }}>
                  {results.asset_allocation.reasoning.map((point, idx) => (
                    <div key={idx} style={{ 
                      padding: '12px', 
                      background: 'var(--neutralBg)', 
                      borderRadius: '8px',
                      borderLeft: '4px solid var(--accentGold)',
                      fontSize: '14px',
                      lineHeight: '1.6'
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
                        <div style={{ fontSize: '11px', color: 'var(--textSecondary)', marginTop: '2px' }}>
                          Financial ability to take risk
                        </div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--textSecondary)' }}>Risk Tolerance Score:</span>
                        <strong style={{ marginLeft: '8px' }}>{results.asset_allocation.risk_metrics.risk_tolerance_score}/100</strong>
                        <div style={{ fontSize: '11px', color: 'var(--textSecondary)', marginTop: '2px' }}>
                          Emotional willingness to take risk
                        </div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--textSecondary)' }}>Constraint Factor:</span>
                        <strong style={{ marginLeft: '8px' }}>{results.asset_allocation.risk_metrics.constraint_factor}x</strong>
                        <div style={{ fontSize: '11px', color: 'var(--textSecondary)', marginTop: '2px' }}>
                          Penalties from debt/emergency fund
                        </div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--textSecondary)' }}>Horizon Factor:</span>
                        <strong style={{ marginLeft: '8px' }}>{results.asset_allocation.risk_metrics.horizon_factor}x</strong>
                        <div style={{ fontSize: '11px', color: 'var(--textSecondary)', marginTop: '2px' }}>
                          Time-based risk adjustment
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Asset Allocation Donut Chart */}
            <Card style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PieChart size={24} color="var(--accentGold)" />
                Portfolio Allocation Visualization
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={[
                      { name: 'Equity', value: results.asset_allocation.equity, color: '#3b82f6' },
                      { name: 'Debt', value: results.asset_allocation.debt, color: '#10b981' },
                      { name: 'Gold', value: results.asset_allocation.gold, color: '#f59e0b' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Equity', value: results.asset_allocation.equity, color: '#3b82f6' },
                      { name: 'Debt', value: results.asset_allocation.debt, color: '#10b981' },
                      { name: 'Gold', value: results.asset_allocation.gold, color: '#f59e0b' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPie>
              </ResponsiveContainer>
            </Card>

            {/* AI Insights Section */}
            {!aiInsights ? (
              <Card style={{ marginBottom: '24px', textAlign: 'center' }}>
                <div style={{ padding: '20px' }}>
                  <Sparkles size={48} color="var(--accentGold)" style={{ marginBottom: '16px' }} />
                  <h3 style={{ marginBottom: '12px', fontSize: '20px' }}>Get Personalized AI Insights</h3>
                  <p style={{ color: 'var(--textSecondary)', marginBottom: '20px', lineHeight: '1.6' }}>
                    Receive tailored investment strategy, corpus allocation plan, and actionable recommendations powered by AI
                  </p>
                  <button
                    onClick={fetchAIInsights}
                    disabled={loadingAI}
                    style={{
                      padding: '14px 32px',
                      background: loadingAI ? 'var(--neutralBg)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: loadingAI ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      boxShadow: loadingAI ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)',
                      opacity: loadingAI ? 0.6 : 1
                    }}
                  >
                    {loadingAI ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles size={18} />
                        </motion.div>
                        Generating Insights...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Get AI Insights for ₹{corpus.toLocaleString('en-IN')} Corpus
                      </>
                    )}
                  </button>
                </div>
              </Card>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
                    }}>
                      <Sparkles size={32} color="white" />
                    </div>
                    <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700' }}>
                      AI-Powered Investment Insights
                    </h2>
                    <p style={{ margin: 0, fontSize: '16px', color: 'var(--textSecondary)' }}>
                      Personalized strategy for your ₹{corpus.toLocaleString('en-IN')} corpus
                    </p>
                  </div>

                  {(() => {
                    // Parse AI insights into sections
                    const insights = aiInsights.raw_insights;
                    const sections = [];
                    
                    // Split by numbered sections or headers
                    const lines = insights.split('\n');
                    let currentSection = { title: '', content: [] };
                    
                    lines.forEach((line) => {
                      const trimmed = line.trim();
                      
                      // Detect section headers (lines with ** or numbered like 1., 2., etc.)
                      if (trimmed.match(/^\*\*.*\*\*$/) || trimmed.match(/^\d+\.\s+\*\*/)) {
                        if (currentSection.content.length > 0) {
                          sections.push({ ...currentSection });
                        }
                        currentSection = {
                          title: trimmed.replace(/\*\*/g, '').replace(/^\d+\.\s+/, '').trim(),
                          content: []
                        };
                      } else if (trimmed.length > 0) {
                        currentSection.content.push(trimmed);
                      }
                    });
                    
                    if (currentSection.content.length > 0) {
                      sections.push(currentSection);
                    }

                    // If no sections detected, treat as single block
                    if (sections.length === 0) {
                      sections.push({ title: 'Investment Strategy', content: insights.split('\n').filter(l => l.trim()) });
                    }

                    return (
                      <div style={{ display: 'grid', gap: '16px' }}>
                        {sections.map((section, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.1 }}
                          >
                            <Card style={{
                              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)',
                              border: '2px solid rgba(102, 126, 234, 0.15)',
                              borderLeft: '6px solid #667eea',
                              transition: 'all 0.3s',
                              cursor: 'default'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-4px)';
                              e.currentTarget.style.boxShadow = '0 12px 24px rgba(102, 126, 234, 0.15)';
                              e.currentTarget.style.borderLeftColor = '#764ba2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                              e.currentTarget.style.borderLeftColor = '#667eea';
                            }}>
                              {section.title && (
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  marginBottom: '16px',
                                  paddingBottom: '12px',
                                  borderBottom: '2px solid rgba(102, 126, 234, 0.1)'
                                }}>
                                  <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: '700',
                                    fontSize: '18px'
                                  }}>
                                    {idx + 1}
                                  </div>
                                  <h3 style={{
                                    margin: 0,
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    color: 'var(--textPrimary)',
                                    flex: 1
                                  }}>
                                    {section.title}
                                  </h3>
                                </div>
                              )}
                              
                              <div style={{
                                fontSize: '15px',
                                lineHeight: '1.8',
                                color: 'var(--textPrimary)'
                              }}>
                                {section.content.map((text, textIdx) => {
                                  // Check if it's a bullet point
                                  if (text.startsWith('•') || text.startsWith('-') || text.startsWith('*')) {
                                    return (
                                      <div key={textIdx} style={{
                                        display: 'flex',
                                        gap: '12px',
                                        marginBottom: '10px',
                                        paddingLeft: '8px'
                                      }}>
                                        <span style={{ color: '#667eea', fontWeight: '700', fontSize: '18px' }}>•</span>
                                        <span style={{ flex: 1 }}>{text.replace(/^[•\-\*]\s*/, '')}</span>
                                      </div>
                                    );
                                  }
                                  
                                  // Regular paragraph
                                  return (
                                    <p key={textIdx} style={{
                                      margin: '0 0 12px 0',
                                      lineHeight: '1.8'
                                    }}>
                                      {text}
                                    </p>
                                  );
                                })}
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    );
                  })()}

                  <div style={{
                    marginTop: '24px',
                    padding: '16px 24px',
                    background: 'rgba(102, 126, 234, 0.08)',
                    borderRadius: '12px',
                    border: '2px dashed rgba(102, 126, 234, 0.3)',
                    textAlign: 'center'
                  }}>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      color: 'var(--textSecondary)',
                      lineHeight: '1.6'
                    }}>
                      <strong style={{ color: 'var(--textPrimary)' }}>⚠️ Disclaimer:</strong> These insights are AI-generated recommendations based on your risk profile. 
                      Please consult a certified financial advisor (CFP/RIA) before making any investment decisions.
                    </p>
                  </div>
                </div>
              </motion.div>
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
