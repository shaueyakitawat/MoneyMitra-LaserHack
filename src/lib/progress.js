// Progress tracking utility for learning modules

const STORAGE_KEY = 'jainvest_learning_progress';

// Get all progress data
export const getProgress = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading progress:', error);
    return {};
  }
};

// Save progress data
const saveProgress = (progress) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
};

// Mark a lesson as completed
export const markLessonComplete = (moduleId, lessonId) => {
  const progress = getProgress();
  
  if (!progress[moduleId]) {
    progress[moduleId] = {
      completedLessons: [],
      startedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString()
    };
  }
  
  if (!progress[moduleId].completedLessons.includes(lessonId)) {
    progress[moduleId].completedLessons.push(lessonId);
  }
  
  progress[moduleId].lastAccessedAt = new Date().toISOString();
  saveProgress(progress);
  
  return progress[moduleId];
};

// Mark a lesson as incomplete
export const markLessonIncomplete = (moduleId, lessonId) => {
  const progress = getProgress();
  
  if (progress[moduleId]) {
    progress[moduleId].completedLessons = progress[moduleId].completedLessons.filter(
      id => id !== lessonId
    );
    progress[moduleId].lastAccessedAt = new Date().toISOString();
    saveProgress(progress);
  }
  
  return progress[moduleId];
};

// Check if a lesson is completed
export const isLessonComplete = (moduleId, lessonId) => {
  const progress = getProgress();
  return progress[moduleId]?.completedLessons?.includes(lessonId) || false;
};

// Get module progress percentage
export const getModuleProgress = (moduleId, totalLessons) => {
  const progress = getProgress();
  const completedLessons = progress[moduleId]?.completedLessons?.length || 0;
  return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
};

// Mark module as started
export const markModuleStarted = (moduleId) => {
  const progress = getProgress();
  
  if (!progress[moduleId]) {
    progress[moduleId] = {
      completedLessons: [],
      startedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString()
    };
  } else {
    progress[moduleId].lastAccessedAt = new Date().toISOString();
  }
  
  saveProgress(progress);
  return progress[moduleId];
};

// Get overall learning progress
export const getOverallProgress = (modules) => {
  const progress = getProgress();
  let totalLessons = 0;
  let completedLessons = 0;
  
  modules.forEach(module => {
    totalLessons += module.lessons.length;
    completedLessons += progress[module.id]?.completedLessons?.length || 0;
  });
  
  return {
    totalLessons,
    completedLessons,
    percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
  };
};

// Get completed modules count
export const getCompletedModulesCount = (modules) => {
  const progress = getProgress();
  let completedCount = 0;
  
  modules.forEach(module => {
    const completedLessons = progress[module.id]?.completedLessons?.length || 0;
    if (completedLessons === module.lessons.length) {
      completedCount++;
    }
  });
  
  return completedCount;
};

// Get learning stats
export const getLearningStats = (modules) => {
  const progress = getProgress();
  const overall = getOverallProgress(modules);
  const completedModules = getCompletedModulesCount(modules);
  
  // Calculate total time spent (estimate based on completed lessons)
  let estimatedMinutes = 0;
  modules.forEach(module => {
    const completedLessons = progress[module.id]?.completedLessons || [];
    completedLessons.forEach(lessonId => {
      const lesson = module.lessons.find(l => l.id === lessonId);
      if (lesson) {
        // Parse duration like "15-20 minutes" and take average
        const match = lesson.duration.match(/(\d+)-(\d+)/);
        if (match) {
          estimatedMinutes += (parseInt(match[1]) + parseInt(match[2])) / 2;
        }
      }
    });
  });
  
  // Get active streak
  const lastAccessDates = Object.values(progress)
    .map(p => p.lastAccessedAt)
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a));
  
  return {
    totalModules: modules.length,
    completedModules,
    inProgressModules: Object.keys(progress).length - completedModules,
    totalLessons: overall.totalLessons,
    completedLessons: overall.completedLessons,
    overallProgress: overall.percentage,
    estimatedHoursSpent: Math.round(estimatedMinutes / 60 * 10) / 10,
    lastAccessed: lastAccessDates[0] || null
  };
};

// Reset all progress (use with caution)
export const resetProgress = () => {
  localStorage.removeItem(STORAGE_KEY);
  return {};
};

// Export module progress for a specific module
export const getModuleDetails = (moduleId) => {
  const progress = getProgress();
  return progress[moduleId] || null;
};
