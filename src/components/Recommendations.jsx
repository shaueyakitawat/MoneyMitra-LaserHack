import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const Recommendations = ({ moduleTitle, preQuizResult, postQuizResult, quiz, onClose }) => {
  const [recommendations, setRecommendations] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateRecommendations();
  }, []);

  const generateRecommendations = async () => {
    setLoading(true);
    
    // Analyze quiz answers to find weak and strong topics
    const weakTopics = [];
    const strongTopics = [];
    
    if (postQuizResult && quiz) {
      quiz.forEach((question) => {
        const userAnswer = postQuizResult.answers[question.id];
        // Support both 'correct' and 'correctAnswer' field names
        const correctIndex = question.correct !== undefined ? question.correct : question.correctAnswer;
        
        if (userAnswer === correctIndex) {
          strongTopics.push(question.question);
        } else if (userAnswer !== undefined) {
          // Only add to weak topics if user actually answered (not skipped)
          weakTopics.push(question.question);
        }
      });
    }

    const quizData = {
      moduleTitle,
      preQuizScore: {
        score: preQuizResult?.score || 0,
        total: preQuizResult?.total || 0,
        percentage: preQuizResult?.percentage || 0
      },
      postQuizScore: {
        score: postQuizResult?.score || 0,
        total: postQuizResult?.total || 0,
        percentage: postQuizResult?.percentage || 0
      },
      weakTopics: weakTopics.length > 0 ? weakTopics : ['Review all concepts'],
      strongTopics: strongTopics.length > 0 ? strongTopics : ['Continue learning']
    };

    try {
      // Call backend API with Groq
      const response = await fetch('http://localhost:5001/quiz_recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizData)
      });

      const data = await response.json();
      
      if (data.success) {
        setRecommendations(data.recommendations);
      } else {
        throw new Error(data.error || 'Failed to generate recommendations');
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      
      // Fallback to client-side mock recommendations
      const improvement = quizData.postQuizScore.percentage - quizData.preQuizScore.percentage;
      const performanceLevel = quizData.postQuizScore.percentage >= 80 ? 'excellent' : 
                               quizData.postQuizScore.percentage >= 60 ? 'good' : 'needs improvement';
      
      setRecommendations(`
# Learning Recommendations for ${quizData.moduleTitle}

## 📊 Performance Summary
You've shown ${improvement > 0 ? 'significant improvement' : 'consistent performance'} with a ${Math.abs(improvement).toFixed(0)}% ${improvement > 0 ? 'increase' : 'change'} from pre-quiz to post-quiz. Your ${performanceLevel} post-quiz score of ${quizData.postQuizScore.percentage}% demonstrates ${performanceLevel === 'excellent' ? 'strong mastery' : performanceLevel === 'good' ? 'good understanding' : 'room for growth'} of the module content.

## ✅ Key Strengths
${quizData.strongTopics.slice(0, 3).map(topic => `- **${topic}**: You've demonstrated solid understanding of this concept`).join('\n')}

## 📈 Areas for Improvement
${quizData.weakTopics.slice(0, 3).map(topic => `- **${topic}**: Review this topic with additional practice and examples`).join('\n')}

## 🎯 Personalized Recommendations

1. **Revisit Challenging Concepts**: Focus on ${quizData.weakTopics.slice(0, 2).join(' and ')}. Spend 15-20 minutes reviewing these topics with practical examples.

2. **Practice with Real Scenarios**: Apply your knowledge by analyzing real market data or case studies related to weak areas.

3. **Use Multiple Learning Resources**: Watch the recommended videos again, especially sections covering topics you found challenging.

4. **Take Notes**: Create summary notes for weak areas to reinforce learning through active recall.

5. **Retake the Quiz**: After reviewing, attempt the post-quiz again to track your progress and build confidence.

## 💪 Motivational Message
${improvement > 0 
  ? `Great progress! Your ${improvement.toFixed(0)}% improvement shows dedication to learning. Keep building on this momentum!` 
  : `You're on the right track! Consistency in learning is key. Focus on the improvement areas and you'll see great results.`}

Remember: Every expert was once a beginner. Keep learning, stay curious, and don't hesitate to revisit topics as many times as needed! 🚀
`);
    }
    
    setLoading(false);
  };

  return (
    <div style={styles.overlay}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        style={styles.modal}
      >
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>🎯 Personalized Learning Recommendations</h2>
            <p style={styles.subtitle}>{moduleTitle}</p>
          </div>
          <button
            onClick={onClose}
            style={styles.closeButton}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.loader}></div>
              <p style={styles.loadingText}>Analyzing your performance...</p>
              <p style={styles.loadingSubtext}>
                Our AI is reviewing your quiz results to create personalized recommendations
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={styles.recommendationsContainer}
            >
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 style={styles.markdownH1} {...props} />,
                  h2: ({node, ...props}) => <h2 style={styles.markdownH2} {...props} />,
                  h3: ({node, ...props}) => <h3 style={styles.markdownH3} {...props} />,
                  p: ({node, ...props}) => <p style={styles.markdownP} {...props} />,
                  ul: ({node, ...props}) => <ul style={styles.markdownUl} {...props} />,
                  li: ({node, ...props}) => <li style={styles.markdownLi} {...props} />,
                  strong: ({node, ...props}) => <strong style={styles.markdownStrong} {...props} />,
                  code: ({node, ...props}) => <code style={styles.markdownCode} {...props} />,
                }}
              >
                {recommendations}
              </ReactMarkdown>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <div style={styles.footer}>
            <button
              style={{...styles.button, ...styles.buttonSecondary}}
              onClick={generateRecommendations}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#e5e7eb'}
            >
              🔄 Regenerate
            </button>
            <button
              style={{...styles.button, ...styles.buttonPrimary}}
              onClick={onClose}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#5568d3'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
            >
              Got It!
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
    backdropFilter: 'blur(4px)'
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    padding: '24px',
    borderBottom: '2px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  subtitle: {
    margin: '8px 0 0 0',
    fontSize: '14px',
    opacity: 0.9
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '4px 12px',
    borderRadius: '8px',
    color: 'white',
    transition: 'all 0.2s',
    fontWeight: '300'
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
    gap: '16px'
  },
  loader: {
    width: '50px',
    height: '50px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0
  },
  loadingSubtext: {
    fontSize: '14px',
    color: '#6b7280',
    textAlign: 'center',
    maxWidth: '400px',
    margin: 0
  },
  recommendationsContainer: {
    lineHeight: '1.8'
  },
  markdownH1: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    marginTop: '0',
    marginBottom: '16px',
    borderBottom: '3px solid #667eea',
    paddingBottom: '12px'
  },
  markdownH2: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#374151',
    marginTop: '32px',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  markdownH3: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#4b5563',
    marginTop: '24px',
    marginBottom: '8px'
  },
  markdownP: {
    fontSize: '16px',
    color: '#4b5563',
    marginBottom: '16px',
    lineHeight: '1.8'
  },
  markdownUl: {
    marginLeft: '24px',
    marginBottom: '16px'
  },
  markdownLi: {
    fontSize: '16px',
    color: '#4b5563',
    marginBottom: '12px',
    lineHeight: '1.7'
  },
  markdownStrong: {
    color: '#667eea',
    fontWeight: '600'
  },
  markdownCode: {
    backgroundColor: '#f3f4f6',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#dc2626'
  },
  footer: {
    padding: '20px 24px',
    borderTop: '2px solid #e5e7eb',
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    backgroundColor: '#f9fafb'
  },
  button: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontFamily: 'inherit'
  },
  buttonPrimary: {
    backgroundColor: '#667eea',
    color: 'white'
  },
  buttonSecondary: {
    backgroundColor: '#e5e7eb',
    color: '#374151'
  }
};

// Add CSS animation for spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default Recommendations;
