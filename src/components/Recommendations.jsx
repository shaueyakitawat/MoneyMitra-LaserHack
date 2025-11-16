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
    
    // Deep analysis: Compare pre and post quiz performance
    const weakTopics = [];
    const strongTopics = [];
    const improvedTopics = [];
    const declinedTopics = [];
    const consistentlyWrongTopics = [];
    
    if (postQuizResult && quiz) {
      quiz.forEach((question) => {
        const postAnswer = postQuizResult.answers[question.id];
        const preAnswer = preQuizResult?.answers?.[question.id];
        const correctIndex = question.correct !== undefined ? question.correct : question.correctAnswer;
        
        const postCorrect = postAnswer === correctIndex;
        const preCorrect = preAnswer === correctIndex;
        
        // Categorize questions based on performance change
        if (postCorrect && !preCorrect) {
          // Improved: Was wrong, now correct
          improvedTopics.push(question.question);
          strongTopics.push(question.question);
        } else if (postCorrect && preCorrect) {
          // Consistently correct: Mastered
          strongTopics.push(question.question);
        } else if (!postCorrect && preCorrect) {
          // Declined: Was correct, now wrong (needs attention!)
          declinedTopics.push(question.question);
          weakTopics.push(question.question);
        } else if (!postCorrect && !preCorrect) {
          // Consistently wrong: Critical gap
          consistentlyWrongTopics.push(question.question);
          weakTopics.push(question.question);
        } else if (!postCorrect && postAnswer !== undefined) {
          // Wrong in post quiz
          weakTopics.push(question.question);
        }
      });
    }

    const improvement = (postQuizResult?.percentage || 0) - (preQuizResult?.percentage || 0);
    
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
      improvement: improvement,
      weakTopics: weakTopics.length > 0 ? weakTopics : ['All topics mastered!'],
      strongTopics: strongTopics.length > 0 ? strongTopics : ['Need to build foundation'],
      improvedTopics: improvedTopics,
      declinedTopics: declinedTopics,
      consistentlyWrongTopics: consistentlyWrongTopics,
      performanceTrend: improvement > 0 ? 'improving' : improvement < 0 ? 'declining' : 'stable'
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
      
      const performanceDescription = improvement > 0 
        ? `significant improvement with a ${improvement.toFixed(0)}% increase` 
        : improvement < 0 
          ? `a decline with a ${Math.abs(improvement).toFixed(0)}% decrease` 
          : 'consistent performance with no change';
      
      const trendEmoji = improvement > 0 ? '📈' : improvement < 0 ? '⚠️' : '➡️';
      
      setRecommendations(`
# Learning Recommendations for ${quizData.moduleTitle}

## 📊 Performance Summary
${trendEmoji} **Performance Trend**: You've shown ${performanceDescription} from pre-quiz to post-quiz.

- **Pre-Quiz Score**: ${quizData.preQuizScore.percentage}%
- **Post-Quiz Score**: ${quizData.postQuizScore.percentage}%
- **Net Change**: ${improvement > 0 ? '+' : ''}${improvement.toFixed(0)}%

Your ${performanceLevel} post-quiz score demonstrates ${performanceLevel === 'excellent' ? 'strong mastery' : performanceLevel === 'good' ? 'good understanding' : 'room for significant growth'} of the module content.

${improvement < 0 ? `\n⚠️ **Important Notice**: Your score decreased from pre to post quiz. This suggests the material may need deeper review or a different learning approach. Don't worry - this is a valuable learning opportunity!\n` : ''}

${quizData.declinedTopics.length > 0 ? `## ⚠️ Critical Attention Areas (Topics You Forgot)
${quizData.declinedTopics.slice(0, 3).map(topic => `- **${topic}**: You answered this correctly in the pre-quiz but got it wrong in the post-quiz. This indicates you may have forgotten key concepts or gotten confused. PRIORITY: Review this immediately!`).join('\n')}
` : ''}

${quizData.consistentlyWrongTopics.length > 0 ? `## 🔴 High Priority Topics (Consistently Wrong)
${quizData.consistentlyWrongTopics.slice(0, 3).map(topic => `- **${topic}**: You got this wrong in both quizzes, indicating a fundamental gap in understanding. Focus on building a strong foundation here.`).join('\n')}
` : ''}

${quizData.improvedTopics.length > 0 ? `## ✅ Topics You Improved
${quizData.improvedTopics.slice(0, 3).map(topic => `- **${topic}**: Great job! You learned this successfully (wrong → correct). Keep reinforcing this knowledge.`).join('\n')}
` : ''}

${quizData.strongTopics.length > 0 ? `## 💪 Your Strengths
${quizData.strongTopics.slice(0, 3).map(topic => `- **${topic}**: Consistently correct - solid understanding!`).join('\n')}
` : ''}

## 🎯 Personalized Action Plan

${improvement < 0 ? `### Immediate Actions (Next 24 Hours)
1. **Review Declined Topics**: Focus on ${quizData.declinedTopics.slice(0, 2).join(' and ')}. These are concepts you knew but forgot - quick review can restore your understanding.
2. **Identify Confusion Points**: Note where you changed from correct to incorrect answers. What caused the confusion?
3. **Rest and Reset**: Sometimes a fresh perspective helps. Take a short break and come back with a clear mind.

### This Week
` : '### This Week - Priority Actions\n'}4. **Deep Dive on Weak Areas**: Spend 20-30 minutes daily on ${quizData.weakTopics.slice(0, 2).join(' and ')}.
5. **Use Multiple Resources**: Watch videos, read articles, and try practice problems on challenging topics.
6. **Create Summary Notes**: Write key points in your own words to reinforce learning.

### Ongoing Strategy
7. **Spaced Repetition**: Review topics multiple times over several days to build long-term memory.
8. **Real-World Practice**: Apply concepts to actual market scenarios or case studies.
9. **Test Yourself**: Attempt the quiz again after review to measure improvement.

## 💪 Motivational Message
${improvement > 0 
  ? `🎉 Excellent progress! Your ${improvement.toFixed(0)}% improvement shows real dedication. You're building strong financial knowledge - keep this momentum going!` 
  : improvement < 0
    ? `💪 A decline in score is actually a valuable learning opportunity! It shows which areas need more attention. Many successful investors faced setbacks while learning. The fact that you're identifying these gaps now means you're on the path to true mastery. Don't give up - refocus and come back stronger!`
    : `📚 Consistent performance shows stability. Now it's time to push forward and break through to the next level. Focus on converting your weak areas into strengths!`}

Remember: Financial literacy is a journey, not a destination. Every challenge you overcome makes you a smarter investor. Stay curious and keep learning! 🚀
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
