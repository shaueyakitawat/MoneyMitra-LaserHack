import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getContentItems, addContentItem, updateContentStatus, getAuditLog } from '../lib/admin';
import { getCurrentUser } from '../lib/auth';
import Card from '../components/Card';

const Admin = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('content');
  const [contentItems, setContentItems] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContent, setNewContent] = useState({
    title: '',
    type: 'pdf',
    url: '',
    description: ''
  });
  const user = getCurrentUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setContentItems(getContentItems());
    setAuditLog(getAuditLog());
  };

  const handleAddContent = (e) => {
    e.preventDefault();
    addContentItem(newContent);
    setNewContent({ title: '', type: 'pdf', url: '', description: '' });
    setShowAddForm(false);
    loadData();
  };

  const handleStatusUpdate = (id, status) => {
    updateContentStatus(id, status, user.user.name);
    loadData();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'var(--success)';
      case 'rejected': return 'var(--error)';
      default: return 'var(--warning)';
    }
  };

  const tabs = [
    { id: 'content', label: 'Content Management', icon: '📁' },
    { id: 'audit', label: 'Audit Log', icon: '📋' }
  ];

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 style={{ marginBottom: '32px' }}>Admin Panel</h1>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '32px' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '16px 24px',
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
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'content' && (
            <div>
              {/* Add Content Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2>Content Items ({contentItems.length})</h2>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="btn-primary"
                >
                  + Add Content
                </button>
              </div>

              {/* Content Items */}
              {contentItems.length === 0 ? (
                <Card>
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--textMuted)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
                    <p>No content items yet. Add your first learning material!</p>
                  </div>
                </Card>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {contentItems.map(item => (
                    <Card key={item.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <h4>{item.title}</h4>
                            <span style={{
                              background: getStatusColor(item.status),
                              color: 'white',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '10px',
                              fontWeight: '600',
                              textTransform: 'uppercase'
                            }}>
                              {item.status}
                            </span>
                          </div>
                          <p style={{ color: 'var(--textSecondary)', marginBottom: '8px', fontSize: '14px' }}>
                            {item.description}
                          </p>
                          <div style={{ fontSize: '12px', color: 'var(--textMuted)' }}>
                            Type: {item.type.toUpperCase()} • Created: {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {item.status === 'pending' && user.user.role !== 'learner' && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleStatusUpdate(item.id, 'approved')}
                              className="btn-secondary"
                              style={{ background: 'var(--success)', color: 'white', padding: '6px 12px', fontSize: '12px' }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(item.id, 'rejected')}
                              className="btn-secondary"
                              style={{ background: 'var(--error)', color: 'white', padding: '6px 12px', fontSize: '12px' }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Add Content Modal */}
              {showAddForm && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000
                }}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card style={{ width: '500px', maxWidth: '90vw' }}>
                      <h3 style={{ marginBottom: '20px' }}>Add New Content</h3>
                      <form onSubmit={handleAddContent}>
                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                            Title
                          </label>
                          <input
                            type="text"
                            value={newContent.title}
                            onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                            required
                            style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                          />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                            Type
                          </label>
                          <select
                            value={newContent.type}
                            onChange={(e) => setNewContent({ ...newContent, type: e.target.value })}
                            style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                          >
                            <option value="pdf">PDF Document</option>
                            <option value="youtube">YouTube Video</option>
                            <option value="article">Article</option>
                          </select>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                            URL
                          </label>
                          <input
                            type="url"
                            value={newContent.url}
                            onChange={(e) => setNewContent({ ...newContent, url: e.target.value })}
                            placeholder={newContent.type === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://...'}
                            required
                            style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                          />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                            Description
                          </label>
                          <textarea
                            value={newContent.description}
                            onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                            rows={3}
                            style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', resize: 'vertical' }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="btn-secondary"
                            style={{ flex: 1 }}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="btn-primary"
                            style={{ flex: 1 }}
                          >
                            Add Content
                          </button>
                        </div>
                      </form>
                    </Card>
                  </motion.div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'audit' && (
            <div>
              <h2 style={{ marginBottom: '24px' }}>Audit Log</h2>
              <Card>
                {auditLog.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--textMuted)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                    <p>No audit entries yet</p>
                  </div>
                ) : (
                  <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {auditLog.map(entry => (
                      <div
                        key={entry.id}
                        style={{
                          padding: '16px',
                          borderBottom: '1px solid var(--border)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{
                              background: entry.action === 'CREATE' ? 'var(--success)' : 
                                         entry.action === 'APPROVED' ? 'var(--primaryCobalt)' :
                                         entry.action === 'REJECTED' ? 'var(--error)' : 'var(--textMuted)',
                              color: 'white',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: '600'
                            }}>
                              {entry.action}
                            </span>
                            <span style={{ fontWeight: '600', fontSize: '14px' }}>{entry.user}</span>
                          </div>
                          <p style={{ color: 'var(--textSecondary)', fontSize: '14px' }}>
                            {entry.description}
                          </p>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--textMuted)', textAlign: 'right' }}>
                          {new Date(entry.timestamp).toLocaleDateString()}<br />
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;