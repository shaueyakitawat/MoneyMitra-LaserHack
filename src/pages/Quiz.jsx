import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import {
  quizzes,
  calculateScore,
  saveQuizAttempt,
  getUserAttempts,
} from "../lib/quiz";
import { updateUserScore } from "../lib/leaderboard";
import { getCurrentUser } from "../lib/auth";
import Card from "../components/Card";

const Quiz = () => {
  const { t } = useTranslation();
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [userAttempts, setUserAttempts] = useState([]);
  const user = getCurrentUser();

  useEffect(() => {
    if (user) {
      setUserAttempts(getUserAttempts());
    }
  }, [user]);

  const startQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setResults(null);
  };

  const selectAnswer = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < selectedQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitQuiz();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitQuiz = () => {
    const quizResults = calculateScore(answers, selectedQuiz);
    setResults(quizResults);
    setShowResults(true);

    const attempt = {
      userId: user.user.id,
      quizId: selectedQuiz.id,
      answers,
      score: quizResults.score,
    };

    saveQuizAttempt(attempt);
    updateUserScore(user.user.id, quizResults.score);
    setUserAttempts(getUserAttempts());
  };

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setShowResults(false);
  };

  // Extra Quizzes (demo purposes)
  const extendedQuizzes = [
    ...quizzes,
    {
      id: "quiz-4",
      title: "Stock Market Basics",
      description: "Test your knowledge about investing & trading",
      questions: [{ question: "Demo?", options: ["Yes", "No"], answer: 0 }],
    },
    {
      id: "quiz-5",
      title: "AI & Machine Learning",
      description: "How much do you know about AI trends?",
      questions: [{ question: "Demo?", options: ["Yes", "No"], answer: 0 }],
    },
    {
      id: "quiz-6",
      title: "Personnal Finance",
      description: "Personal finance,investments and more challenges await",
      questions: [{ question: "Demo?", options: ["Yes", "No"], answer: 0 }],
    },
  ];

  // Framer Motion variants
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.6, type: "spring" },
    }),
  };

  if (showResults && results) {
    return (
      <div style={{ padding: "40px 0" }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Card
              style={{
                textAlign: "center",
                maxWidth: "650px",
                margin: "0 auto",
                backdropFilter: "blur(10px)",
                background: "rgba(255, 255, 255, 0.1)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              }}
            >
              <h1 style={{ color: "var(--primaryCobalt)", marginBottom: "16px" }}>
                Quiz Complete! 🎉
              </h1>

              <div style={{ marginBottom: "32px" }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  style={{
                    fontSize: "56px",
                    fontWeight: "800",
                    color: "var(--accentGold)",
                    marginBottom: "12px",
                  }}
                >
                  {results.score}%
                </motion.div>
                <p style={{ color: "var(--textSecondary)" }}>
                  {results.correct} out of {results.total} correct answers
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.1, boxShadow: "0 0 20px #10b981" }}
                whileTap={{ scale: 0.95 }}
                onClick={resetQuiz}
                className="btn-primary"
                style={{
                  padding: "14px 28px",
                  borderRadius: "10px",
                  background:
                    "blue",
                }}
              >
                🚀 Take Another Quiz
              </motion.button>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  if (selectedQuiz) {
    const question = selectedQuiz.questions[currentQuestion];
    const progress =
      ((currentQuestion + 1) / selectedQuiz.questions.length) * 100;

    return (
      <div style={{ padding: "40px 0" }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              {/* Progress Bar */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                  background: "var(--border)",
                  height: "8px",
                  borderRadius: "4px",
                  marginBottom: "32px",
                  overflow: "hidden",
                }}
              >
                <motion.div
                  style={{
                    background:
                      "linear-gradient(90deg, var(--primaryCobalt), var(--accentGold))",
                    height: "100%",
                  }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>

              {/* Question */}
              <Card
                style={{
                  marginBottom: "32px",
                  backdropFilter: "blur(12px)",
                  background: "rgba(255, 255, 255, 0.08)",
                }}
              >
                <h3 style={{ marginBottom: "24px" }}>{question.question}</h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {question.options.map((option, index) => (
                    <motion.label
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        padding: "16px",
                        border: `2px solid ${
                          answers[currentQuestion] === index
                            ? "var(--primaryCobalt)"
                            : "var(--border)"
                        }`,
                        borderRadius: "12px",
                        cursor: "pointer",
                        background:
                          answers[currentQuestion] === index
                            ? "rgba(16,185,129,0.15)"
                            : "transparent",
                        transition: "0.3s all ease",
                      }}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        checked={answers[currentQuestion] === index}
                        onChange={() => selectAnswer(index)}
                        style={{ marginRight: "8px" }}
                      />
                      {option}
                    </motion.label>
                  ))}
                </div>
              </Card>

              {/* Navigation */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={previousQuestion}
                  disabled={currentQuestion === 0}
                  className="btn-secondary"
                >
                  ← Previous
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextQuestion}
                  disabled={answers[currentQuestion] === undefined}
                  className="btn-primary"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primaryCobalt), var(--accentGold))",
                    padding: "12px 28px",
                    borderRadius: "10px",
                  }}
                >
                  {currentQuestion === selectedQuiz.questions.length - 1
                    ? "Submit Quiz"
                    : "Next →"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 0" }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 style={{ marginBottom: "32px" }}>Enhance Your Learning,Take a Quiz</h1>

          {/* Quiz Grid */}
          <div
            className="grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            {extendedQuizzes.map((quiz, i) => (
              <motion.div
                key={quiz.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={i}
              >
                <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable={true} glareMaxOpacity={0.2}>
                  <Card
                    hover
                    style={{
                      backdropFilter: "blur(8px)",
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      transition: "0.3s all ease",
                    }}
                  >
                    <h3 style={{ marginBottom: "12px", color: "var(--primaryCobalt)" }}>
                      {quiz.title}
                    </h3>
                    <p
                      style={{
                        color: "var(--textSecondary)",
                        marginBottom: "20px",
                        minHeight: "48px",
                      }}
                    >
                      {quiz.description}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                      }}
                    >
                      <span style={{ fontSize: "14px", color: "var(--textMuted)" }}>
                        {quiz.questions.length} questions
                      </span>
                      <span style={{ fontSize: "14px", color: "var(--textMuted)" }}>
                        ~{quiz.questions.length * 2} mins
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 0 18px #10b981" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => startQuiz(quiz)}
                      className="btn-primary"
                      style={{
                        width: "100%",
                        padding: "12px 20px",
                        borderRadius: "10px",
                        background:
                          "green",
                      }}
                    >
                      Start Quiz
                    </motion.button>
                  </Card>
                </Tilt>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Quiz;
