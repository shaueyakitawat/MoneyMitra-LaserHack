const LEADERBOARD_KEY = 'jainvest_leaderboard';

const seedLeaderboard = [
  { userId: '1', name: 'Demo Learner', totalScore: 850, streakDays: 7, badges: ['Rookie', 'Streak 7'] },
  { userId: 'user_123', name: 'Priya Sharma', totalScore: 1200, streakDays: 15, badges: ['Scholar', 'Streak 15', 'Quiz Master'] },
  { userId: 'user_456', name: 'Rahul Patel', totalScore: 980, streakDays: 5, badges: ['Rising Star', 'Streak 5'] },
  { userId: 'user_789', name: 'Sneha Gupta', totalScore: 1450, streakDays: 23, badges: ['Expert', 'Streak 20', 'Top Performer'] },
  { userId: 'user_321', name: 'Amit Singh', totalScore: 720, streakDays: 3, badges: ['Beginner', 'Streak 3'] }
];

export const getLeaderboard = () => {
  try {
    const data = localStorage.getItem(LEADERBOARD_KEY);
    return data ? JSON.parse(data) : seedLeaderboard;
  } catch {
    return seedLeaderboard;
  }
};

export const updateUserScore = (userId, newScore) => {
  const leaderboard = getLeaderboard();
  const userIndex = leaderboard.findIndex(u => u.userId === userId);
  
  if (userIndex !== -1) {
    leaderboard[userIndex].totalScore += newScore;
    leaderboard[userIndex].streakDays += 1;
    
    // Update badges based on score and streak
    const user = leaderboard[userIndex];
    user.badges = calculateBadges(user.totalScore, user.streakDays);
  }
  
  // Sort by total score
  leaderboard.sort((a, b) => b.totalScore - a.totalScore);
  
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
  return leaderboard;
};

const calculateBadges = (totalScore, streakDays) => {
  const badges = [];
  
  if (totalScore >= 1400) badges.push('Expert');
  else if (totalScore >= 1000) badges.push('Scholar');
  else if (totalScore >= 600) badges.push('Rising Star');
  else if (totalScore >= 300) badges.push('Rookie');
  else badges.push('Beginner');
  
  if (streakDays >= 20) badges.push('Streak 20');
  else if (streakDays >= 15) badges.push('Streak 15');
  else if (streakDays >= 10) badges.push('Streak 10');
  else if (streakDays >= 7) badges.push('Streak 7');
  else if (streakDays >= 5) badges.push('Streak 5');
  else if (streakDays >= 3) badges.push('Streak 3');
  
  if (totalScore >= 1200 && streakDays >= 15) badges.push('Top Performer');
  if (totalScore >= 800 && streakDays >= 10) badges.push('Quiz Master');
  
  return badges;
};