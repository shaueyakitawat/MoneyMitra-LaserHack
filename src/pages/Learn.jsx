import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import YouTube from 'react-youtube';
import Card from '../components/Card';
import Quiz from '../components/Quiz';
import Documentation from '../components/Documentation';
import Recommendations from '../components/Recommendations';
import { learningModules } from '../data/modules/index.js';
import { 
  markLessonComplete, 
  markLessonIncomplete, 
  isLessonComplete,
  getModuleProgress,
  markModuleStarted,
  getLearningStats
} from '../lib/progress';
import { getVideoId, hasVideoId, getYouTubeWatchUrl } from '../lib/youtube';

const Learn = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('original');
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizType, setQuizType] = useState(null); // 'pre' or 'post'
  const [quizResults, setQuizResults] = useState({});
  const [learningStats, setLearningStats] = useState(null);
  const [refreshProgress, setRefreshProgress] = useState(0);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [generatedContent, setGeneratedContent] = useState({});
  const [loadingContent, setLoadingContent] = useState(false);
  const [aiSummaries, setAiSummaries] = useState({});
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Get URL parameters
  const moduleIdFromUrl = searchParams.get('module');
  const lessonIdFromUrl = searchParams.get('lesson');

  // Find current module and lesson based on URL
  const selectedModule = moduleIdFromUrl && learningModules
    ? learningModules.find(m => m.id === moduleIdFromUrl) 
    : null;
  
  const currentLessonIndex = selectedModule && lessonIdFromUrl
    ? selectedModule.lessons.findIndex(l => l.id === lessonIdFromUrl)
    : 0;
  
  const currentLesson = selectedModule?.lessons?.[currentLessonIndex >= 0 ? currentLessonIndex : 0];

  // Update learning stats
  useEffect(() => {
    if (learningModules && learningModules.length > 0) {
      const stats = getLearningStats(learningModules);
      setLearningStats(stats);
    }
  }, [refreshProgress]);

  // Scroll to top when module/lesson changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [moduleIdFromUrl, lessonIdFromUrl]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only activate shortcuts when viewing a module
      if (!selectedModule || showQuiz) return;

      // Left arrow - Previous lesson
      if (e.key === 'ArrowLeft' && currentLessonIndex > 0) {
        e.preventDefault();
        handlePreviousLesson();
      }
      
      // Right arrow - Next lesson
      if (e.key === 'ArrowRight' && currentLessonIndex < selectedModule.lessons.length - 1) {
        e.preventDefault();
        handleNextLesson();
      }
      
      // Escape - Back to modules
      if (e.key === 'Escape') {
        e.preventDefault();
        handleBackToModules();
      }

      // M - Toggle documentation
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setShowDocumentation(prev => !prev);
      }

      // Space - Mark lesson complete/incomplete
      if (e.key === ' ' && currentLesson) {
        e.preventDefault();
        toggleLessonComplete(selectedModule.id, currentLesson.id);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedModule, currentLessonIndex, showQuiz, currentLesson]);

  // Difficulty colors
  const difficultyColors = {
    beginner: '#4facfe',
    intermediate: '#f093fb',
    advanced: '#43e97b'
  };

  const tabs = [
    { id: 'original', label: 'Original', icon: '📄' },
    { id: 'simplified', label: 'Simplified', icon: '📝' },
    { id: 'vernacular', label: 'Vernacular', icon: '🌐' }
  ];

  const handleSummarize = () => {
    alert('Summary feature would connect to AI service in production');
  };

  const handleTranslate = () => {
    alert('Translation feature would connect to AI service in production');
  };

  // Module card colors based on difficulty
  const moduleColors = {
    beginner: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    intermediate: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    advanced: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
  };

  // Helper function to get gradient color
  const getModuleColor = (difficulty) => {
    return moduleColors[difficulty] || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  };

  // Content formats data
  const contentFormats = [
    {
      type: "Original",
      title: "Comprehensive Content",
      description: "In-depth material with industry terminology and detailed analysis for advanced learners."
    },
    {
      type: "Simplified",
      title: "Video Lectures",
      description: "Professional video content with expert instructors and real market examples."
    },
    {
      type: "Regional",
      title: "Interactive Charts",
      description: "Live market data integration with hands-on chart analysis exercises."
    }
  ];

  // Handle module selection
  const handleModuleSelect = (module) => {
    setSearchParams({ module: module.id, lesson: module.lessons[0].id });
    setActiveTab('original');
    setShowDocumentation(false);
    markModuleStarted(module.id);
    setRefreshProgress(prev => prev + 1);
  };

  // Handle back to modules
  const handleBackToModules = () => {
    setSearchParams({});
    setShowDocumentation(false);
  };

  // Handle lesson selection
  const handleLessonSelect = (lessonIndex) => {
    if (selectedModule) {
      setSearchParams({ 
        module: selectedModule.id, 
        lesson: selectedModule.lessons[lessonIndex].id 
      });
      setActiveTab('original');
    }
  };

  // Navigate to next/previous lesson
  const handleNextLesson = () => {
    if (selectedModule && currentLessonIndex < selectedModule.lessons.length - 1) {
      const nextLesson = selectedModule.lessons[currentLessonIndex + 1];
      setSearchParams({ module: selectedModule.id, lesson: nextLesson.id });
      setActiveTab('original');
    }
  };

  const handlePreviousLesson = () => {
    if (selectedModule && currentLessonIndex > 0) {
      const prevLesson = selectedModule.lessons[currentLessonIndex - 1];
      setSearchParams({ module: selectedModule.id, lesson: prevLesson.id });
      setActiveTab('original');
    }
  };

  // Handle quiz
  const handleStartQuiz = (type) => {
    setQuizType(type);
    setShowQuiz(true);
  };

  const handleQuizComplete = (results) => {
    const key = `${selectedModule.id}_${results.quizType}`;
    setQuizResults({
      ...quizResults,
      [key]: results
    });
    
    // Store in localStorage
    const storedResults = JSON.parse(localStorage.getItem('quizResults') || '{}');
    storedResults[key] = {
      ...results,
      completedAt: new Date().toISOString()
    };
    localStorage.setItem('quizResults', JSON.stringify(storedResults));

    // If both pre and post quiz completed, show recommendations
    const preKey = `${selectedModule.id}_pre`;
    const postKey = `${selectedModule.id}_post`;
    if (storedResults[preKey] && storedResults[postKey] && results.quizType === 'post') {
      // Small delay to let user see their score first
      setTimeout(() => {
        setShowRecommendations(true);
      }, 2000);
    }
  };

  const handleCloseQuiz = () => {
    setShowQuiz(false);
    setQuizType(null);
  };

  // Get quiz result for current module
  const getQuizResult = (type) => {
    const key = `${selectedModule?.id}_${type}`;
    const stored = JSON.parse(localStorage.getItem('quizResults') || '{}');
    return quizResults[key] || stored[key];
  };

  // Toggle lesson completion
  const toggleLessonComplete = (moduleId, lessonId) => {
    const isComplete = isLessonComplete(moduleId, lessonId);
    if (isComplete) {
      markLessonIncomplete(moduleId, lessonId);
    } else {
      markLessonComplete(moduleId, lessonId);
    }
    setRefreshProgress(prev => prev + 1);
  };

  // Generate AI content for current lesson
  const generateAIContent = async (contentType) => {
    if (!currentLesson || !selectedModule) return;
    
    const cacheKey = `${selectedModule.id}_${currentLesson.id}_${contentType}`;
    
    // Check if already generated
    if (generatedContent[cacheKey]) {
      return generatedContent[cacheKey];
    }
    
    setLoadingContent(true);
    
    try {
      const response = await fetch('http://localhost:5001/generate_lesson_content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalContent: currentLesson.content.original,
          lessonTitle: currentLesson.title,
          moduleTitle: selectedModule.title,
          contentType: contentType
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedContent(prev => ({
          ...prev,
          [cacheKey]: data
        }));
        return data;
      } else {
        throw new Error(data.error || 'Failed to generate content');
      }
    } catch (error) {
      console.error('Error generating AI content:', error);
      // Return static content as fallback
      return null;
    } finally {
      setLoadingContent(false);
    }
  };

  // Get content based on active tab
  const getCurrentContent = () => {
    if (!currentLesson) return '';
    
    const cacheKey = `${selectedModule.id}_${currentLesson.id}`;
    
    if (activeTab === 'original') {
      return currentLesson.content.original;
    } else if (activeTab === 'simplified') {
      const simplifiedKey = `${cacheKey}_simplified`;
      return generatedContent[simplifiedKey]?.simplified || currentLesson.content.simplified || '';
    } else if (activeTab === 'vernacular') {
      const hindiKey = `${cacheKey}_hindi`;
      return generatedContent[hindiKey]?.hindi || currentLesson.content.hindi || '';
    }
    
    return '';
  };

  // Generate AI summary for current lesson
  const generateAISummary = async () => {
    if (!currentLesson || !selectedModule) return;
    
    const cacheKey = `${selectedModule.id}_${currentLesson.id}_summary`;
    
    // Check if already generated
    if (aiSummaries[cacheKey]) {
      return aiSummaries[cacheKey];
    }
    
    setLoadingSummary(true);
    
    try {
      const response = await fetch('http://localhost:5001/generate_ai_summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalContent: currentLesson.content.original,
          lessonTitle: currentLesson.title
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setAiSummaries(prev => ({
          ...prev,
          [cacheKey]: data.summary
        }));
        return data.summary;
      } else {
        throw new Error(data.error || 'Failed to generate summary');
      }
    } catch (error) {
      console.error('Error generating AI summary:', error);
      return currentLesson.aiSummary || null;
    } finally {
      setLoadingSummary(false);
    }
  };

  // Get AI summary for current lesson
  const getCurrentAISummary = () => {
    if (!currentLesson || !selectedModule) return null;
    const cacheKey = `${selectedModule.id}_${currentLesson.id}_summary`;
    return aiSummaries[cacheKey] || currentLesson.aiSummary || null;
  };

  // Load AI content when tab changes
  useEffect(() => {
    if (currentLesson && selectedModule && (activeTab === 'simplified' || activeTab === 'vernacular')) {
      const contentType = activeTab === 'simplified' ? 'simplified' : 'hindi';
      generateAIContent(contentType);
    }
  }, [activeTab, currentLesson?.id, selectedModule?.id]);

  // Auto-generate AI summary when lesson changes
  useEffect(() => {
    if (currentLesson && selectedModule) {
      const cacheKey = `${selectedModule.id}_${currentLesson.id}_summary`;
      if (!aiSummaries[cacheKey] && !currentLesson.aiSummary) {
        generateAISummary();
      }
    }
  }, [currentLesson?.id, selectedModule?.id]);

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: '#2D3748',
      backgroundColor: '#F7FAFC'
    },
    header: {
      textAlign: 'center',
      marginBottom: '48px'
    },
    headerTitle: {
      fontSize: '36px',
      fontWeight: '700',
      color: '#2D3748',
      marginBottom: '12px'
    },
    headerSubtitle: {
      fontSize: '18px',
      color: '#718096'
    },
    section: {
      marginBottom: '48px'
    },
    sectionTitle: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#2D3748',
      marginBottom: '24px'
    },
    pathsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px',
      marginBottom: '24px'
    },
    pathCard: {
      padding: '24px',
      borderRadius: '12px',
      color: 'white',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      minHeight: '120px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'transform 0.2s ease'
    },
    pathTitle: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '8px'
    },
    pathModules: {
      fontSize: '14px',
      opacity: 0.9
    },
    popularTag: {
      position: 'absolute',
      top: '12px',
      right: '12px',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      padding: '4px 8px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600'
    },
    divider: {
      height: '1px',
      backgroundColor: '#E2E8F0',
      margin: '40px 0'
    },
    formatsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px'
    },
    formatCard: {
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      border: '1px solid #E2E8F0'
    },
    formatType: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#667eea',
      marginBottom: '8px'
    },
    formatTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#2D3748',
      marginBottom: '12px'
    },
    formatDescription: {
      fontSize: '14px',
      color: '#718096',
      lineHeight: '1.6'
    },
    modulesContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '24px'
    },
    moduleCard: {
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      border: '1px solid #E2E8F0'
    },
    moduleHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    moduleLevel: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#667eea',
      padding: '4px 8px',
      backgroundColor: '#EBF4FF',
      borderRadius: '4px'
    },
    moduleStats: {
      display: 'flex',
      gap: '12px'
    },
    stat: {
      fontSize: '12px',
      color: '#718096'
    },
    moduleTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#2D3748',
      marginBottom: '12px'
    },
    moduleDescription: {
      fontSize: '14px',
      color: '#718096',
      lineHeight: '1.6',
      marginBottom: '20px'
    },
    progressContainer: {
      marginBottom: '20px'
    },
    progressBar: {
      height: '8px',
      backgroundColor: '#EDF2F7',
      borderRadius: '4px',
      marginBottom: '8px',
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      borderRadius: '4px',
      transition: 'width 0.3s ease'
    },
    progressText: {
      fontSize: '12px',
      color: '#718096'
    },
    continueButton: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    confirmSection: {
      backgroundColor: 'white',
      padding: '32px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      textAlign: 'center',
      border: '1px solid #E2E8F0'
    },
    confirmTitle: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#2D3748',
      marginBottom: '12px'
    },
    confirmText: {
      fontSize: '16px',
      color: '#718096',
      marginBottom: '24px'
    },
    viewProgressButton: {
      padding: '12px 24px',
      backgroundColor: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    }
  };

  // Loading state
  if (!learningModules || learningModules.length === 0) {
    return (
      <div style={{ 
        padding: '80px 40px', 
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '24px' }}>📚</div>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>Loading Modules...</h2>
        <p style={{ color: '#718096' }}>Please wait while we load the learning content.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Show module detail view or modules grid */}
      {selectedModule ? (
        /* Module Detail View */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back Button and Keyboard Shortcuts */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <button 
              onClick={handleBackToModules}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#2D3748'
              }}
            >
              ← Back to Modules
            </button>
            <div style={{ 
              fontSize: '12px', 
              color: '#A0AEC0',
              display: 'flex',
              gap: '16px',
              alignItems: 'center'
            }}>
              <span>⌨️ Shortcuts:</span>
              <span>← → Navigate</span>
              <span>Space Complete</span>
              <span>M Docs</span>
              <span>Esc Back</span>
            </div>
          </div>

          {/* Module Header */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '40px' }}>{selectedModule.icon}</span>
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                  {selectedModule.title}
                </h1>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: difficultyColors[selectedModule.difficulty],
                    textTransform: 'capitalize'
                  }}>
                    {selectedModule.difficulty}
                  </span>
                  <span style={{ color: '#718096' }}>•</span>
                  <span style={{ color: '#718096' }}>{selectedModule.duration}</span>
                  <span style={{ color: '#718096' }}>•</span>
                  <span style={{ color: '#718096' }}>{selectedModule.lessons.length} Lessons</span>
                </div>
              </div>
            </div>
            <p style={{ color: '#718096', fontSize: '16px', lineHeight: '1.6' }}>
              {selectedModule.description}
            </p>
          </div>

          {/* Objectives */}
          <Card style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>🎯 Learning Objectives</h3>
            <ul style={{ paddingLeft: '20px', color: '#718096', lineHeight: '1.8' }}>
              {selectedModule.objectives.map((obj, idx) => (
                <li key={idx}>{obj}</li>
              ))}
            </ul>
          </Card>

          {/* Prerequisites */}
          {selectedModule.prerequisites.length > 0 && (
            <Card style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px' }}>📚 Prerequisites</h3>
              <ul style={{ paddingLeft: '20px', color: '#718096', lineHeight: '1.8' }}>
                {selectedModule.prerequisites.map((prereq, idx) => (
                  <li key={idx}>{prereq}</li>
                ))}
              </ul>
            </Card>
          )}

          {/* Current Lesson Content */}
          {currentLesson && (
            <>
              {/* Lesson Navigation */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ marginBottom: '0' }}>
                    Lesson {currentLessonIndex + 1}: {currentLesson.title}
                  </h3>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    cursor: 'pointer',
                    padding: '8px 16px',
                    backgroundColor: isLessonComplete(selectedModule.id, currentLesson.id) ? '#C6F6D5' : '#EDF2F7',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease'
                  }}>
                    <input
                      type="checkbox"
                      checked={isLessonComplete(selectedModule.id, currentLesson.id)}
                      onChange={() => toggleLessonComplete(selectedModule.id, currentLesson.id)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ 
                      fontSize: '14px', 
                      fontWeight: '600',
                      color: isLessonComplete(selectedModule.id, currentLesson.id) ? '#22543D' : '#4A5568'
                    }}>
                      {isLessonComplete(selectedModule.id, currentLesson.id) ? 'Completed ✓' : 'Mark as Complete'}
                    </span>
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {selectedModule.lessons.map((lesson, idx) => {
                    const isComplete = isLessonComplete(selectedModule.id, lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => handleLessonSelect(idx)}
                        className={currentLessonIndex === idx ? 'btn-primary' : 'btn-secondary'}
                        style={{ 
                          padding: '8px 16px', 
                          fontSize: '14px',
                          position: 'relative',
                          opacity: isComplete ? 1 : 0.9
                        }}
                      >
                        Lesson {idx + 1}
                        {isComplete && <span style={{ marginLeft: '4px' }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content Tabs */}
              <Card style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        padding: '12px 20px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        borderBottom: activeTab === tab.id ? '2px solid var(--primaryCobalt)' : '2px solid transparent',
                        color: activeTab === tab.id ? 'var(--primaryCobalt)' : 'var(--textSecondary)',
                        fontWeight: activeTab === tab.id ? '600' : '400',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span>{tab.icon}</span>
                      {tab.label === 'Vernacular' ? 'Hindi' : tab.label}
                    </button>
                  ))}
                </div>

                <div style={{ minHeight: '200px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0 }}>
                      {tabs.find(t => t.id === activeTab).label === 'Vernacular' ? 'Hindi' : tabs.find(t => t.id === activeTab).label} Content
                    </h3>
                    {(activeTab === 'simplified' || activeTab === 'vernacular') && (
                      <button
                        onClick={() => generateAIContent(activeTab === 'simplified' ? 'simplified' : 'hindi')}
                        disabled={loadingContent}
                        className="btn-secondary"
                        style={{ fontSize: '14px', padding: '6px 12px' }}
                      >
                        {loadingContent ? '⏳ Generating...' : '🤖 Generate with AI'}
                      </button>
                    )}
                  </div>
                  
                  {loadingContent && (activeTab === 'simplified' || activeTab === 'vernacular') ? (
                    <div style={{ 
                      padding: '40px', 
                      textAlign: 'center',
                      backgroundColor: '#F7FAFC',
                      borderRadius: '8px'
                    }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        border: '4px solid #E2E8F0',
                        borderTop: '4px solid #667eea',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                      }}></div>
                      <p style={{ color: '#718096', margin: 0 }}>
                        Generating {activeTab === 'simplified' ? 'simplified' : 'Hindi'} content with Groq AI...
                      </p>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--textSecondary)', lineHeight: '1.8', marginBottom: '24px', whiteSpace: 'pre-line' }}>
                      {getCurrentContent() || `Click "Generate with AI" to create ${activeTab === 'simplified' ? 'simplified' : 'Hindi'} version of this content.`}
                    </p>
                  )}
                </div>
              </Card>

              {/* AI Summary */}
              <Card style={{ marginBottom: '24px', backgroundColor: '#EBF4FF' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🤖 AI Summary
                  </h3>
                  <button
                    onClick={generateAISummary}
                    disabled={loadingSummary}
                    className="btn-secondary"
                    style={{ fontSize: '14px', padding: '6px 12px' }}
                  >
                    {loadingSummary ? '⏳ Generating...' : '🔄 Regenerate'}
                  </button>
                </div>
                {loadingSummary ? (
                  <div style={{ 
                    padding: '20px', 
                    textAlign: 'center',
                    color: '#718096'
                  }}>
                    <div style={{ 
                      width: '30px', 
                      height: '30px', 
                      border: '3px solid #E2E8F0',
                      borderTop: '3px solid #667eea',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 12px'
                    }}></div>
                    Generating AI summary...
                  </div>
                ) : (
                  <p style={{ color: '#4A5568', lineHeight: '1.8', margin: 0 }}>
                    {getCurrentAISummary() || 'Click "Regenerate" to generate AI summary for this lesson.'}
                  </p>
                )}
              </Card>

              {/* Key Takeaways */}
              {currentLesson.keyTakeaways && currentLesson.keyTakeaways.length > 0 && (
                <Card style={{ marginBottom: '24px' }}>
                  <h3 style={{ marginBottom: '16px' }}>💡 Key Takeaways</h3>
                  <ul style={{ paddingLeft: '20px', color: '#718096', lineHeight: '1.8' }}>
                    {currentLesson.keyTakeaways.map((takeaway, idx) => (
                      <li key={idx}>{takeaway}</li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Common Mistakes */}
              {currentLesson.commonMistakes && currentLesson.commonMistakes.length > 0 && (
                <Card style={{ marginBottom: '24px', backgroundColor: '#FFF5F5' }}>
                  <h3 style={{ marginBottom: '16px', color: '#C53030' }}>⚠️ Common Mistakes to Avoid</h3>
                  <ul style={{ paddingLeft: '20px', color: '#C53030', lineHeight: '1.8' }}>
                    {currentLesson.commonMistakes.map((mistake, idx) => (
                      <li key={idx}>{mistake}</li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Video Section */}
              <Card style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '20px' }}>📹 Video Lesson: {currentLesson.videoTopic}</h3>
                {(() => {
                  const videoId = getVideoId(selectedModule.id, currentLesson.id);
                  const hasVideo = hasVideoId(selectedModule.id, currentLesson.id);
                  
                  return hasVideo ? (
                    <>
                      <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '16px' }}>
                        <YouTube
                          videoId={videoId}
                          opts={{
                            width: '100%',
                            height: '400',
                            playerVars: {
                              autoplay: 0,
                            }
                          }}
                        />
                      </div>
                      <button
                        onClick={() => window.open(getYouTubeWatchUrl(videoId), '_blank')}
                        className="btn-secondary"
                        style={{ width: '100%' }}
                      >
                        ▶️ Watch on YouTube
                      </button>
                    </>
                  ) : (
                    <div style={{ 
                      background: '#EDF2F7', 
                      border: '2px dashed #CBD5E0', 
                      borderRadius: '8px', 
                      padding: '60px 20px', 
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎥</div>
                      <p style={{ color: '#718096', marginBottom: '8px' }}>
                        Video for: <strong>{currentLesson.videoTopic}</strong>
                      </p>
                      <p style={{ color: '#A0AEC0', fontSize: '14px' }}>
                        YouTube video will be added here
                      </p>
                    </div>
                  );
                })()}
              </Card>

              {/* Lesson Navigation Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                <button
                  onClick={handlePreviousLesson}
                  disabled={currentLessonIndex === 0}
                  className="btn-secondary"
                  style={{ 
                    opacity: currentLessonIndex === 0 ? 0.5 : 1,
                    cursor: currentLessonIndex === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  ← Previous Lesson
                </button>
                <button
                  onClick={handleNextLesson}
                  disabled={currentLessonIndex === selectedModule.lessons.length - 1}
                  className="btn-primary"
                  style={{ 
                    opacity: currentLessonIndex === selectedModule.lessons.length - 1 ? 0.5 : 1,
                    cursor: currentLessonIndex === selectedModule.lessons.length - 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next Lesson →
                </button>
              </div>
            </>
          )}

          {/* Quizzes and Documentation Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            <Card>
              <h3 style={{ marginBottom: '16px' }}>📝 Pre-Quiz</h3>
              <p style={{ color: '#718096', marginBottom: '16px' }}>
                Test your baseline knowledge with {selectedModule.preQuiz.length} questions
              </p>
              {getQuizResult('pre') ? (
                <div style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#EBF4FF', borderRadius: '6px' }}>
                  <div style={{ fontWeight: '600', color: '#667eea' }}>
                    Completed: {getQuizResult('pre').percentage}%
                  </div>
                  <div style={{ fontSize: '14px', color: '#718096' }}>
                    Score: {getQuizResult('pre').score}/{getQuizResult('pre').total}
                  </div>
                </div>
              ) : null}
              <button 
                className="btn-secondary" 
                style={{ width: '100%' }}
                onClick={() => handleStartQuiz('pre')}
              >
                {getQuizResult('pre') ? 'Retake Pre-Quiz' : 'Take Pre-Quiz'}
              </button>
            </Card>
            <Card>
              <h3 style={{ marginBottom: '16px' }}>✅ Post-Quiz</h3>
              <p style={{ color: '#718096', marginBottom: '16px' }}>
                Evaluate your learning with {selectedModule.postQuiz.length} questions
              </p>
              {getQuizResult('post') ? (
                <div style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#C6F6D5', borderRadius: '6px' }}>
                  <div style={{ fontWeight: '600', color: '#22543D' }}>
                    Completed: {getQuizResult('post').percentage}%
                  </div>
                  <div style={{ fontSize: '14px', color: '#22543D' }}>
                    Score: {getQuizResult('post').score}/{getQuizResult('post').total}
                  </div>
                </div>
              ) : null}
              <button 
                className="btn-primary" 
                style={{ width: '100%' }}
                onClick={() => handleStartQuiz('post')}
              >
                {getQuizResult('post') ? 'Retake Post-Quiz' : 'Take Post-Quiz'}
              </button>
            </Card>
            <Card>
              <h3 style={{ marginBottom: '16px' }}>📚 Documentation</h3>
              <p style={{ color: '#718096', marginBottom: '16px' }}>
                Comprehensive notes and references for {selectedModule.title}
              </p>
              <button 
                className="btn-secondary" 
                style={{ width: '100%' }}
                onClick={() => setShowDocumentation(!showDocumentation)}
              >
                {showDocumentation ? 'Hide Documentation' : 'View Documentation'}
              </button>
            </Card>
            
            {/* AI Recommendations Card */}
            {getQuizResult('pre') && getQuizResult('post') && (
              <Card>
                <h3 style={{ marginBottom: '16px' }}>🤖 AI Recommendations</h3>
                <p style={{ color: '#718096', marginBottom: '16px' }}>
                  Get personalized learning recommendations based on your quiz performance
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <span style={{ 
                    padding: '4px 12px', 
                    backgroundColor: '#e0e7ff', 
                    color: '#667eea',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Pre: {getQuizResult('pre').percentage}%
                  </span>
                  <span style={{ 
                    padding: '4px 12px', 
                    backgroundColor: '#dcfce7', 
                    color: '#16a34a',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Post: {getQuizResult('post').percentage}%
                  </span>
                  <span style={{ 
                    padding: '4px 12px', 
                    backgroundColor: '#fef3c7', 
                    color: '#d97706',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    {getQuizResult('post').percentage > getQuizResult('pre').percentage ? '📈' : '📊'} 
                    {' '}{Math.abs(getQuizResult('post').percentage - getQuizResult('pre').percentage)}% change
                  </span>
                </div>
                <button 
                  className="btn-primary" 
                  style={{ width: '100%' }}
                  onClick={() => setShowRecommendations(true)}
                >
                  View AI Recommendations
                </button>
              </Card>
            )}
          </div>

          {/* Documentation Viewer */}
          {showDocumentation && selectedModule.documentation && (
            <Documentation
              documentation={selectedModule.documentation}
              moduleTitle={selectedModule.title}
              moduleIcon={selectedModule.icon}
            />
          )}

          {/* Quiz Modal */}
          {showQuiz && selectedModule && (
            <Quiz
              quiz={quizType === 'pre' ? selectedModule.preQuiz : selectedModule.postQuiz}
              quizType={quizType}
              moduleTitle={selectedModule.title}
              onComplete={handleQuizComplete}
              onClose={handleCloseQuiz}
            />
          )}

          {/* Recommendations Modal */}
          {showRecommendations && selectedModule && getQuizResult('pre') && getQuizResult('post') && (
            <Recommendations
              moduleTitle={selectedModule.title}
              preQuizResult={getQuizResult('pre')}
              postQuizResult={getQuizResult('post')}
              quiz={selectedModule.postQuiz}
              onClose={() => setShowRecommendations(false)}
            />
          )}
        </motion.div>
      ) : (
        /* Modules Grid View */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <header style={styles.header}>
            <h1 style={styles.headerTitle}>Learning Hub</h1>
            <p style={styles.headerSubtitle}>Master investing with our comprehensive 10-module curriculum</p>
            
            {/* Learning Stats */}
            {learningStats && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '16px',
                marginTop: '24px',
                padding: '24px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#667eea' }}>
                    {learningStats.completedModules}/{learningStats.totalModules}
                  </div>
                  <div style={{ fontSize: '14px', color: '#718096' }}>Modules Complete</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#f5576c' }}>
                    {learningStats.completedLessons}/{learningStats.totalLessons}
                  </div>
                  <div style={{ fontSize: '14px', color: '#718096' }}>Lessons Complete</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#43e97b' }}>
                    {learningStats.overallProgress}%
                  </div>
                  <div style={{ fontSize: '14px', color: '#718096' }}>Overall Progress</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#f093fb' }}>
                    {learningStats.estimatedHoursSpent}h
                  </div>
                  <div style={{ fontSize: '14px', color: '#718096' }}>Time Invested</div>
                </div>
              </div>
            )}
          </header>

          {/* All Modules Grid */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>All Learning Modules</h2>
            <div style={styles.modulesContainer}>
              {learningModules && learningModules.map((module) => {
                const moduleProgress = getModuleProgress(module.id, module.lessons?.length || 0);
                return (
                  <div key={module.id} style={styles.moduleCard}>
                    <div style={styles.moduleHeader}>
                      <span style={{ fontSize: '32px' }}>{module.icon}</span>
                      <span style={{
                        ...styles.moduleLevel,
                        color: difficultyColors[module.difficulty],
                        backgroundColor: `${difficultyColors[module.difficulty]}15`
                      }}>
                        {module.difficulty.charAt(0).toUpperCase() + module.difficulty.slice(1)}
                      </span>
                    </div>
                    
                    <h3 style={styles.moduleTitle}>{module.title}</h3>
                    <p style={styles.moduleDescription}>{module.description}</p>
                    
                    <div style={{ marginBottom: '20px' }}>
                      <div style={styles.moduleStats}>
                        <span style={styles.stat}>⏱️ {module.duration}</span>
                        <span style={styles.stat}>📚 {module.lessons.length} lessons</span>
                        <span style={styles.stat}>🎯 {module.objectives.length} objectives</span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    {moduleProgress > 0 && (
                      <div style={styles.progressContainer}>
                        <div style={styles.progressBar}>
                          <div 
                            style={{
                              ...styles.progressFill, 
                              width: `${moduleProgress}%`,
                              backgroundColor: difficultyColors[module.difficulty]
                            }}
                          ></div>
                        </div>
                        <span style={styles.progressText}>{moduleProgress}% Complete</span>
                      </div>
                    )}
                    
                    <button 
                      style={styles.continueButton}
                      onClick={() => handleModuleSelect(module)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#5568d3';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#667eea';
                      }}
                    >
                      {moduleProgress > 0 ? 'Continue Module →' : 'Start Module →'}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <div style={styles.divider}></div>

          {/* Content Formats Section */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Learning Features</h2>
            <div style={styles.formatsContainer}>
              {contentFormats.map((format, index) => (
                <div key={index} style={styles.formatCard}>
                  <h4 style={styles.formatType}>{format.type}</h4>
                  <h3 style={styles.formatTitle}>{format.title}</h3>
                  <p style={styles.formatDescription}>{format.description}</p>
                </div>
              ))}
            </div>
          </section>
        </motion.div>
      )}
    </div>
  );
};

export default Learn;