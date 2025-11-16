import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from './Card';

const Documentation = ({ documentation, moduleTitle, moduleIcon }) => {
  const [activeSection, setActiveSection] = useState(0);

  if (!documentation || !documentation.sections || documentation.sections.length === 0) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
          <p>No documentation available for this module yet.</p>
        </div>
      </Card>
    );
  }

  const styles = {
    container: {
      display: 'grid',
      gridTemplateColumns: '250px 1fr',
      gap: '24px',
      marginBottom: '32px'
    },
    sidebar: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      height: 'fit-content',
      position: 'sticky',
      top: '20px'
    },
    sidebarTitle: {
      fontSize: '16px',
      fontWeight: '700',
      color: '#2D3748',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    sectionList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    sectionItem: {
      padding: '10px 12px',
      marginBottom: '4px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      color: '#4A5568'
    },
    sectionItemActive: {
      backgroundColor: '#EBF4FF',
      color: '#667eea',
      fontWeight: '600'
    },
    content: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '32px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      minHeight: '500px'
    },
    header: {
      marginBottom: '32px',
      paddingBottom: '24px',
      borderBottom: '2px solid #E2E8F0'
    },
    mainTitle: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#2D3748',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    summary: {
      fontSize: '16px',
      color: '#718096',
      lineHeight: '1.6',
      fontStyle: 'italic'
    },
    sectionTitle: {
      fontSize: '22px',
      fontWeight: '700',
      color: '#2D3748',
      marginBottom: '16px',
      marginTop: '32px'
    },
    sectionContent: {
      fontSize: '16px',
      color: '#4A5568',
      lineHeight: '1.8',
      whiteSpace: 'pre-line'
    },
    subsectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#2D3748',
      marginTop: '24px',
      marginBottom: '12px'
    },
    list: {
      paddingLeft: '24px',
      marginTop: '12px',
      marginBottom: '12px'
    },
    listItem: {
      marginBottom: '8px',
      color: '#4A5568',
      lineHeight: '1.6'
    },
    highlight: {
      backgroundColor: '#FFF5E6',
      padding: '16px',
      borderRadius: '8px',
      borderLeft: '4px solid #f5576c',
      marginTop: '16px',
      marginBottom: '16px'
    },
    highlightTitle: {
      fontWeight: '600',
      color: '#f5576c',
      marginBottom: '8px'
    },
    downloadButton: {
      padding: '10px 20px',
      backgroundColor: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'background-color 0.2s ease',
      marginTop: '24px'
    },
    responsiveContainer: {
      '@media (max-width: 768px)': {
        gridTemplateColumns: '1fr',
      }
    }
  };

  const currentSection = documentation.sections[activeSection];

  const handleDownload = () => {
    // Create markdown content
    let markdown = `# ${documentation.title}\n\n`;
    markdown += `${documentation.summary}\n\n`;
    markdown += `---\n\n`;
    
    documentation.sections.forEach((section, idx) => {
      markdown += `## ${idx + 1}. ${section.title}\n\n`;
      markdown += `${section.content}\n\n`;
      
      if (section.keyPoints && section.keyPoints.length > 0) {
        markdown += `### Key Points:\n\n`;
        section.keyPoints.forEach(point => {
          markdown += `- ${point}\n`;
        });
        markdown += `\n`;
      }
      
      markdown += `---\n\n`;
    });

    // Create blob and download
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${moduleTitle.replace(/\s+/g, '-').toLowerCase()}-documentation.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.container}>
      {/* Sidebar Navigation */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarTitle}>
          📑 Contents
        </div>
        <ul style={styles.sectionList}>
          {documentation.sections.map((section, idx) => (
            <li
              key={idx}
              style={{
                ...styles.sectionItem,
                ...(activeSection === idx ? styles.sectionItemActive : {})
              }}
              onClick={() => setActiveSection(idx)}
              onMouseEnter={(e) => {
                if (activeSection !== idx) {
                  e.target.style.backgroundColor = '#F7FAFC';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== idx) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              {idx + 1}. {section.title}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.mainTitle}>
            <span style={{ fontSize: '36px' }}>{moduleIcon}</span>
            {documentation.title}
          </h1>
          <p style={styles.summary}>{documentation.summary}</p>
        </div>

        {/* Current Section */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 style={styles.sectionTitle}>
            {activeSection + 1}. {currentSection.title}
          </h2>
          
          <div style={styles.sectionContent}>
            {currentSection.content}
          </div>

          {/* Key Points */}
          {currentSection.keyPoints && currentSection.keyPoints.length > 0 && (
            <div style={styles.highlight}>
              <div style={styles.highlightTitle}>💡 Key Points</div>
              <ul style={styles.list}>
                {currentSection.keyPoints.map((point, idx) => (
                  <li key={idx} style={styles.listItem}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Examples */}
          {currentSection.examples && currentSection.examples.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <h3 style={styles.subsectionTitle}>📊 Examples</h3>
              {currentSection.examples.map((example, idx) => (
                <div key={idx} style={{
                  backgroundColor: '#F7FAFC',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontWeight: '600', color: '#2D3748', marginBottom: '8px' }}>
                    {example.title}
                  </div>
                  <div style={{ color: '#4A5568', fontSize: '14px', lineHeight: '1.6' }}>
                    {example.description}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #E2E8F0'
          }}>
            <button
              onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
              disabled={activeSection === 0}
              style={{
                padding: '10px 20px',
                backgroundColor: activeSection === 0 ? '#E2E8F0' : 'white',
                color: activeSection === 0 ? '#A0AEC0' : '#2D3748',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                cursor: activeSection === 0 ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              ← Previous
            </button>
            <button
              onClick={() => setActiveSection(Math.min(documentation.sections.length - 1, activeSection + 1))}
              disabled={activeSection === documentation.sections.length - 1}
              style={{
                padding: '10px 20px',
                backgroundColor: activeSection === documentation.sections.length - 1 ? '#E2E8F0' : '#667eea',
                color: activeSection === documentation.sections.length - 1 ? '#A0AEC0' : 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: activeSection === documentation.sections.length - 1 ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              Next →
            </button>
          </div>
        </motion.div>

        {/* Download Button */}
        <button
          style={styles.downloadButton}
          onClick={handleDownload}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#5568d3'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
        >
          <span>📥</span>
          Download Documentation
        </button>
      </div>
    </div>
  );
};

export default Documentation;
