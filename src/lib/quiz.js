const QUIZ_KEY = 'jainvest_quiz_attempts';

export const quizzes = [
  {
    id: 'basic-investing',
    title: 'Basic Investing Concepts',
    description: 'Test your knowledge of fundamental investing principles',
    questions: [
      {
        id: 'q1',
        question: 'What is diversification in investing?',
        options: [
          'Investing in only one stock',
          'Spreading investments across different assets',
          'Only buying government bonds',
          'Investing only in tech stocks'
        ],
        correct: 1,
        explanation: 'Diversification means spreading investments across different assets to reduce risk.'
      },
      {
        id: 'q2',
        question: 'What does P/E ratio represent?',
        options: [
          'Price to Earnings ratio',
          'Profit to Equity ratio',
          'Price to Expense ratio',
          'Portfolio to Earnings ratio'
        ],
        correct: 0,
        explanation: 'P/E ratio is Price to Earnings ratio, showing how much investors pay per rupee of earnings.'
      },
      {
        id: 'q3',
        question: 'What is SIP in mutual funds?',
        options: [
          'Systematic Investment Plan',
          'Strategic Investment Portfolio',
          'Systematic Insurance Plan',
          'Special Investment Product'
        ],
        correct: 0,
        explanation: 'SIP stands for Systematic Investment Plan, allowing regular investments in mutual funds.'
      }
    ]
  },
  {
    id: 'stock-analysis',
    title: 'Stock Analysis Fundamentals',
    description: 'Learn how to analyze stocks effectively',
    questions: [
      {
        id: 'q1',
        question: 'Which financial ratio measures a company\'s profitability?',
        options: [
          'Current Ratio',
          'Debt-to-Equity Ratio',
          'Return on Equity (ROE)',
          'Quick Ratio'
        ],
        correct: 2,
        explanation: 'ROE measures how effectively a company uses shareholders\' equity to generate profits.'
      }
    ]
  }
];

export const getUserAttempts = () => {
  try {
    const data = localStorage.getItem(QUIZ_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveQuizAttempt = (attempt) => {
  const attempts = getUserAttempts();
  attempts.push({
    ...attempt,
    id: Date.now(),
    timestamp: new Date().toISOString()
  });
  localStorage.setItem(QUIZ_KEY, JSON.stringify(attempts));
};

export const calculateScore = (answers, quiz) => {
  let correct = 0;
  const results = quiz.questions.map((question, index) => {
    const userAnswer = answers[index];
    const isCorrect = userAnswer === question.correct;
    if (isCorrect) correct++;
    
    return {
      questionId: question.id,
      userAnswer,
      correct: question.correct,
      isCorrect,
      explanation: question.explanation
    };
  });
  
  const score = Math.round((correct / quiz.questions.length) * 100);
  
  return { score, correct, total: quiz.questions.length, results };
};