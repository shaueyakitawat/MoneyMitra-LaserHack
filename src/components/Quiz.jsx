import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card';

const Quiz = ({ quiz, quizType, moduleTitle, onComplete, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswerSelect = (questionId, optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionIndex
    });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScore();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correctCount = 0;
    quiz.forEach((question) => {
      // Support both 'correct' and 'correctAnswer' field names
      const correctIndex = question.correct !== undefined ? question.correct : question.correctAnswer;
      if (selectedAnswers[question.id] === correctIndex) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowResults(true);
    
    // Call onComplete callback with results
    if (onComplete) {
      onComplete({
        score: correctCount,
        total: quiz.length,
        percentage: Math.round((correctCount / quiz.length) * 100),
        quizType,
        answers: selectedAnswers
      });
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#43e97b';
    if (percentage >= 60) return '#f5576c';
    return '#f093fb';
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 80) return 'Excellent! You have a strong grasp of the concepts.';
    if (percentage >= 60) return 'Good job! Review the lessons for better understanding.';
    return 'Keep learning! Consider reviewing the module content.';
  };

  const question = quiz[currentQuestion];
  const isAnswered = selectedAnswers[question?.id] !== undefined;
  const percentage = Math.round((score / quiz.length) * 100);

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
      padding: '20px'
    },
    quizContainer: {
      backgroundColor: 'white',
      borderRadius: '12px',
      maxWidth: '800px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
      padding: '32px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
    },
    header: {
      marginBottom: '24px',
      paddingBottom: '16px',
      borderBottom: '2px solid #E2E8F0'
    },
    title: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#2D3748',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '14px',
      color: '#718096',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    progressBar: {
      height: '8px',
      backgroundColor: '#EDF2F7',
      borderRadius: '4px',
      marginBottom: '24px',
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#667eea',
      transition: 'width 0.3s ease',
      borderRadius: '4px'
    },
    questionCard: {
      marginBottom: '24px'
    },
    questionText: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#2D3748',
      marginBottom: '20px',
      lineHeight: '1.6'
    },
    optionsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    option: {
      padding: '16px',
      borderRadius: '8px',
      border: '2px solid #E2E8F0',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '16px',
      color: '#2D3748',
      backgroundColor: 'white'
    },
    optionSelected: {
      borderColor: '#667eea',
      backgroundColor: '#EBF4FF',
      fontWeight: '600'
    },
    navigationButtons: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'space-between',
      marginTop: '24px'
    },
    button: {
      padding: '12px 24px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '14px',
      transition: 'all 0.2s ease'
    },
    buttonPrimary: {
      backgroundColor: '#667eea',
      color: 'white'
    },
    buttonSecondary: {
      backgroundColor: '#E2E8F0',
      color: '#2D3748'
    },
    buttonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    resultsContainer: {
      textAlign: 'center'
    },
    scoreCircle: {
      width: '200px',
      height: '200px',
      borderRadius: '50%',
      margin: '32px auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '48px',
      fontWeight: '700',
      color: 'white',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
    },
    resultMessage: {
      fontSize: '18px',
      color: '#2D3748',
      marginBottom: '24px',
      lineHeight: '1.6'
    },
    answersReview: {
      textAlign: 'left',
      marginTop: '32px'
    },
    reviewQuestion: {
      marginBottom: '20px',
      padding: '16px',
      borderRadius: '8px',
      backgroundColor: '#F7FAFC'
    },
    reviewQuestionText: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '12px',
      color: '#2D3748'
    },
    reviewAnswer: {
      fontSize: '14px',
      padding: '8px 12px',
      borderRadius: '6px',
      marginBottom: '4px'
    },
    correctAnswer: {
      backgroundColor: '#C6F6D5',
      color: '#22543D',
      fontWeight: '600'
    },
    wrongAnswer: {
      backgroundColor: '#FED7D7',
      color: '#742A2A',
      fontWeight: '600'
    },
    closeButton: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      background: 'transparent',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#718096',
      padding: '8px',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.2s ease'
    }
  };

  if (!quiz || quiz.length === 0) {
    return null;
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={styles.quizContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          style={styles.closeButton}
          onClick={onClose}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#E2E8F0'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          ×
        </button>

        {!showResults ? (
          <>
            {/* Header */}
            <div style={styles.header}>
              <h2 style={styles.title}>
                {quizType === 'pre' ? '📝 Pre-Quiz' : '✅ Post-Quiz'} - {moduleTitle}
              </h2>
              <div style={styles.subtitle}>
                <span>Question {currentQuestion + 1} of {quiz.length}</span>
                <span>•</span>
                <span>{Object.keys(selectedAnswers).length} answered</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={styles.progressBar}>
              <div 
                style={{
                  ...styles.progressFill,
                  width: `${((currentQuestion + 1) / quiz.length) * 100}%`
                }}
              />
            </div>

            {/* Question */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                style={styles.questionCard}
              >
                <div style={styles.questionText}>
                  {question.question}
                </div>

                <div style={styles.optionsList}>
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      style={{
                        ...styles.option,
                        ...(selectedAnswers[question.id] === index ? styles.optionSelected : {})
                      }}
                      onClick={() => handleAnswerSelect(question.id, index)}
                      onMouseEnter={(e) => {
                        if (selectedAnswers[question.id] !== index) {
                          e.target.style.borderColor = '#CBD5E0';
                          e.target.style.backgroundColor = '#F7FAFC';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedAnswers[question.id] !== index) {
                          e.target.style.borderColor = '#E2E8F0';
                          e.target.style.backgroundColor = 'white';
                        }
                      }}
                    >
                      <span style={{ fontWeight: '600', marginRight: '8px' }}>
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div style={styles.navigationButtons}>
              <button
                style={{
                  ...styles.button,
                  ...styles.buttonSecondary,
                  ...(currentQuestion === 0 ? styles.buttonDisabled : {})
                }}
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                ← Previous
              </button>
              <button
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  ...((!isAnswered) ? styles.buttonDisabled : {})
                }}
                onClick={handleNext}
                disabled={!isAnswered}
                onMouseEnter={(e) => {
                  if (isAnswered) e.target.style.backgroundColor = '#5568d3';
                }}
                onMouseLeave={(e) => {
                  if (isAnswered) e.target.style.backgroundColor = '#667eea';
                }}
              >
                {currentQuestion === quiz.length - 1 ? 'Submit Quiz' : 'Next →'}
              </button>
            </div>
          </>
        ) : (
          /* Results Screen */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={styles.resultsContainer}
          >
            <h2 style={styles.title}>
              {quizType === 'pre' ? '📝 Pre-Quiz Results' : '✅ Post-Quiz Results'}
            </h2>

            {/* Score Circle */}
            <div 
              style={{
                ...styles.scoreCircle,
                backgroundColor: getScoreColor(percentage)
              }}
            >
              <div>{percentage}%</div>
              <div style={{ fontSize: '16px', fontWeight: '400' }}>
                {score} / {quiz.length}
              </div>
            </div>

            <div style={styles.resultMessage}>
              {getScoreMessage(percentage)}
            </div>

            {/* Answers Review */}
            <div style={styles.answersReview}>
              <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                Review Your Answers
              </h3>
              {quiz.map((q, index) => {
                const userAnswer = selectedAnswers[q.id];
                const isCorrect = userAnswer === q.correctAnswer;
                return (
                  <div key={q.id} style={styles.reviewQuestion}>
                    <div style={styles.reviewQuestionText}>
                      {index + 1}. {q.question}
                    </div>
                    <div style={{
                      ...styles.reviewAnswer,
                      ...(isCorrect ? styles.correctAnswer : styles.wrongAnswer)
                    }}>
                      Your answer: {String.fromCharCode(65 + userAnswer)}. {q.options[userAnswer]}
                      {isCorrect ? ' ✓' : ' ✗'}
                    </div>
                    {!isCorrect && (
                      <div style={{
                        ...styles.reviewAnswer,
                        ...styles.correctAnswer
                      }}>
                        Correct answer: {String.fromCharCode(65 + q.correctAnswer)}. {q.options[q.correctAnswer]} ✓
                      </div>
                    )}
                    {q.explanation && (
                      <div style={{
                        fontSize: '14px',
                        color: '#4A5568',
                        marginTop: '8px',
                        fontStyle: 'italic'
                      }}>
                        💡 {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Close Button */}
            <button
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
                marginTop: '24px',
                width: '100%'
              }}
              onClick={onClose}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#5568d3'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
            >
              Close Quiz
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Quiz;
