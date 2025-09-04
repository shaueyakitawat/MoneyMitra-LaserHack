import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getLeaderboard } from '../lib/leaderboard';
import { getCurrentUser } from '../lib/auth';
import Card from '../components/Card';

const Leaderboard = () => {
  const { t } = useTranslation();
  const [leaderboard, setLeaderboard] = useState([]);
  const user = getCurrentUser();

  useEffect(() => {
    setLeaderboard(getLeaderboard());
  }, []);

  const getBadgeColor = (badge) => {
    if (badge.includes('Expert')) return 'var(--error)';
    if (badge.includes('Scholar')) return 'var(--primaryCobalt)';
    if (badge.includes('Rising Star')) return 'var(--accentGold)';
    if (badge.includes('Streak')) return 'var(--success)';
    return 'var(--textMuted)';
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const chartData = leaderboard.slice(0, 10).map((user, index) => ({
    name: user.name.split(' ')[0],
    score: user.totalScore,
    rank: index + 1
  }));

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 style={{ marginBottom: '32px' }}>Leaderboard</h1>

          {/* User's Rank */}
          {user && (
            <Card style={{ marginBottom: '32px' }}>
              <h3 style={{ marginBottom: '16px' }}>Your Performance</h3>
              {(() => {
                const userRank = leaderboard.findIndex(u => u.userId === user.user.id) + 1;
                const userData = leaderboard.find(u => u.userId === user.user.id);
                
                if (userData) {
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', marginBottom: '4px' }}>
                          {getRankIcon(userRank)}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--textMuted)' }}>Your Rank</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primaryCobalt)' }}>
                          {userData.totalScore}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--textMuted)' }}>Total Score</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success)' }}>
                          {userData.streakDays}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--textMuted)' }}>Day Streak</div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {userData.badges.map(badge => (
                            <span
                              key={badge}
                              style={{
                                background: getBadgeColor(badge),
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '10px',
                                fontWeight: '600'
                              }}
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }
                
                return (
                  <p style={{ color: 'var(--textMuted)' }}>
                    Take a quiz to appear on the leaderboard!
                  </p>
                );
              })()}
            </Card>
          )}

          {/* Charts */}
          <Card style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '20px' }}>Top 10 Performers</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--textSecondary)" fontSize={12} />
                <YAxis stroke="var(--textSecondary)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--neutralCard)', 
                    border: '1px solid var(--border)', 
                    borderRadius: 'var(--radius)' 
                  }}
                />
                <Bar 
                  dataKey="score" 
                  fill="var(--primaryCobalt)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Leaderboard Table */}
          <Card>
            <h3 style={{ marginBottom: '20px' }}>Rankings</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--textMuted)', fontSize: '12px' }}>RANK</th>
                    <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--textMuted)', fontSize: '12px' }}>USER</th>
                    <th style={{ textAlign: 'right', padding: '12px 0', color: 'var(--textMuted)', fontSize: '12px' }}>SCORE</th>
                    <th style={{ textAlign: 'right', padding: '12px 0', color: 'var(--textMuted)', fontSize: '12px' }}>STREAK</th>
                    <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--textMuted)', fontSize: '12px' }}>BADGES</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((userData, index) => (
                    <motion.tr
                      key={userData.userId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      style={{ 
                        borderBottom: '1px solid var(--border)',
                        background: userData.userId === user?.user?.id ? '#eff6ff' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '16px 0', fontSize: '18px', fontWeight: '600' }}>
                        {getRankIcon(index + 1)}
                      </td>
                      <td style={{ padding: '16px 0' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--ink)' }}>
                            {userData.name}
                          </div>
                          {userData.userId === user?.user?.id && (
                            <div style={{ fontSize: '12px', color: 'var(--accentGold)' }}>You</div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px 0', textAlign: 'right' }}>
                        <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primaryCobalt)' }}>
                          {userData.totalScore.toLocaleString()}
                        </span>
                      </td>
                      <td style={{ padding: '16px 0', textAlign: 'right' }}>
                        <span style={{ color: 'var(--success)', fontWeight: '600' }}>
                          {userData.streakDays} days
                        </span>
                      </td>
                      <td style={{ padding: '16px 0' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {userData.badges.slice(0, 3).map(badge => (
                            <span
                              key={badge}
                              style={{
                                background: getBadgeColor(badge),
                                color: 'white',
                                padding: '2px 6px',
                                borderRadius: '8px',
                                fontSize: '9px',
                                fontWeight: '600'
                              }}
                            >
                              {badge}
                            </span>
                          ))}
                          {userData.badges.length > 3 && (
                            <span style={{ fontSize: '10px', color: 'var(--textMuted)' }}>
                              +{userData.badges.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;