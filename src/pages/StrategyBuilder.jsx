import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const INDICATOR_TYPES = [
  { id: 'SMA', name: 'Simple Moving Average', params: [{ name: 'period', type: 'number', default: 20 }] },
  { id: 'EMA', name: 'Exponential Moving Average', params: [{ name: 'period', type: 'number', default: 20 }] },
  { id: 'RSI', name: 'Relative Strength Index', params: [{ name: 'period', type: 'number', default: 14 }] },
  { id: 'MACD', name: 'MACD', params: [
    { name: 'fast', type: 'number', default: 12 },
    { name: 'slow', type: 'number', default: 26 },
    { name: 'signal', type: 'number', default: 9 }
  ]},
  { id: 'BOLLINGER', name: 'Bollinger Bands', params: [
    { name: 'period', type: 'number', default: 20 },
    { name: 'std', type: 'number', default: 2 }
  ]},
  { id: 'VWAP', name: 'VWAP', params: [] },
  { id: 'ATR', name: 'Average True Range', params: [{ name: 'period', type: 'number', default: 14 }] }
];

const CONDITION_OPERATORS = ['>', '<', '>=', '<=', '==', 'cross_over', 'cross_under'];

const ACTION_TYPES = [
  { id: 'BUY', name: 'Buy', params: [
    { name: 'sizePct', label: 'Position Size %', type: 'number', default: 0.25, min: 0.01, max: 1, step: 0.01 },
    { name: 'stopLossPct', label: 'Stop Loss %', type: 'number', default: 0.05, min: 0, max: 1, step: 0.01 },
    { name: 'takeProfitPct', label: 'Take Profit %', type: 'number', default: 0.10, min: 0, max: 5, step: 0.01 }
  ]},
  { id: 'SELL', name: 'Sell', params: [] },
  { id: 'EXIT_ALL', name: 'Exit All', params: [] }
];

export default function StrategyBuilder() {
  const navigate = useNavigate();
  const [strategyName, setStrategyName] = useState('My Strategy');
  const [symbols, setSymbols] = useState(['RELIANCE.NS']);
  const [timeframe, setTimeframe] = useState('1d');
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const addBlock = (type) => {
    const blockId = `b${blocks.length + 1}`;
    let newBlock = {
      id: blockId,
      type: type
    };

    if (type === 'indicator') {
      newBlock.indicator = 'SMA';
      newBlock.params = { period: 20 };
    } else if (type === 'condition') {
      newBlock.expr = '';
    } else if (type === 'action') {
      newBlock.action = 'BUY';
      newBlock.params = { sizePct: 0.25, stopLossPct: 0.05, takeProfitPct: 0.10 };
    }

    setBlocks([...blocks, newBlock]);
    setSelectedBlock(newBlock);
  };

  const updateBlock = (blockId, updates) => {
    const updatedBlocks = blocks.map(b => 
      b.id === blockId ? { ...b, ...updates } : b
    );
    setBlocks(updatedBlocks);
    
    // Update selectedBlock if it's the one being edited
    if (selectedBlock?.id === blockId) {
      const updatedBlock = updatedBlocks.find(b => b.id === blockId);
      setSelectedBlock(updatedBlock);
    }
  };

  const deleteBlock = (blockId) => {
    setBlocks(blocks.filter(b => b.id !== blockId));
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(null);
    }
  };

  const saveStrategy = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:5001/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: strategyName,
          userId: 'default',
          symbols: symbols,
          timeframe: timeframe,
          blocks: blocks
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Strategy saved successfully! Starting backtest...');
        // Navigate to backtest results page with strategy ID
        navigate(`/backtest-results?strategyId=${data.strategyId}`);
      } else {
        alert('Failed to save strategy');
      }
    } catch (error) {
      console.error('Error saving strategy:', error);
      alert('Error saving strategy');
    } finally {
      setIsSaving(false);
    }
  };

  const getBlockIcon = (type) => {
    if (type === 'indicator') return '📊';
    if (type === 'condition') return '🔍';
    if (type === 'action') return '⚡';
    return '📦';
  };

  const getBlockColor = (type) => {
    if (type === 'indicator') return '#10B981';
    if (type === 'condition') return '#3B82F6';
    if (type === 'action') return '#F59E0B';
    return '#6B7280';
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.headerIcon}>🛠️</span>
          <input
            type="text"
            value={strategyName}
            onChange={(e) => setStrategyName(e.target.value)}
            style={styles.strategyNameInput}
            placeholder="Strategy Name"
          />
        </div>
        <div style={styles.headerRight}>
          <button 
            onClick={saveStrategy}
            disabled={blocks.length === 0 || isSaving}
            style={{
              ...styles.saveButton,
              opacity: blocks.length === 0 || isSaving ? 0.5 : 1,
              cursor: blocks.length === 0 || isSaving ? 'not-allowed' : 'pointer'
            }}
          >
            {isSaving ? '💾 Saving...' : '💾 Save & Backtest'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Left Panel - Block Palette */}
        <div style={styles.palette}>
          <h3 style={styles.paletteTitle}>Add Blocks</h3>
          
          <div style={styles.paletteSection}>
            <h4 style={styles.paletteSectionTitle}>📊 Indicators</h4>
            {INDICATOR_TYPES.map(ind => (
              <button
                key={ind.id}
                onClick={() => addBlock('indicator')}
                style={styles.paletteButton}
              >
                + {ind.name}
              </button>
            ))}
          </div>

          <div style={styles.paletteSection}>
            <h4 style={styles.paletteSectionTitle}>🔍 Conditions</h4>
            <button onClick={() => addBlock('condition')} style={styles.paletteButton}>
              + Add Condition
            </button>
          </div>

          <div style={styles.paletteSection}>
            <h4 style={styles.paletteSectionTitle}>⚡ Actions</h4>
            {ACTION_TYPES.map(action => (
              <button
                key={action.id}
                onClick={() => addBlock('action')}
                style={styles.paletteButton}
              >
                + {action.name}
              </button>
            ))}
          </div>
        </div>

        {/* Center Panel - Canvas */}
        <div style={styles.canvas}>
          <div style={styles.canvasHeader}>
            <div>
              <label style={styles.label}>Symbols (comma-separated):</label>
              <input
                type="text"
                value={symbols.join(', ')}
                onChange={(e) => setSymbols(e.target.value.split(',').map(s => s.trim()))}
                style={styles.input}
                placeholder="RELIANCE.NS, TCS.NS"
              />
            </div>
            <div>
              <label style={styles.label}>Timeframe:</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                style={styles.select}
              >
                <option value="1m">1 Minute</option>
                <option value="5m">5 Minutes</option>
                <option value="15m">15 Minutes</option>
                <option value="1h">1 Hour</option>
                <option value="1d">1 Day</option>
              </select>
            </div>
          </div>

          <div style={styles.blocksContainer}>
            {blocks.length === 0 ? (
              <div style={styles.emptyState}>
                <span style={styles.emptyIcon}>🎯</span>
                <p style={styles.emptyText}>Add blocks from the left panel to build your strategy</p>
              </div>
            ) : (
              blocks.map((block, index) => (
                <div
                  key={block.id}
                  onClick={() => setSelectedBlock(block)}
                  style={{
                    ...styles.block,
                    borderColor: selectedBlock?.id === block.id ? getBlockColor(block.type) : '#E5E7EB',
                    borderWidth: selectedBlock?.id === block.id ? '2px' : '1.5px',
                    backgroundColor: selectedBlock?.id === block.id ? `${getBlockColor(block.type)}08` : '#FFFFFF'
                  }}
                >
                  <div style={styles.blockHeader}>
                    <span style={styles.blockIcon}>{getBlockIcon(block.type)}</span>
                    <span style={{ ...styles.blockId, color: getBlockColor(block.type) }}>{block.id}</span>
                    <span style={styles.blockType}>{block.type.toUpperCase()}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBlock(block.id);
                      }}
                      style={styles.deleteButton}
                    >
                      ×
                    </button>
                  </div>
                  <div style={styles.blockContent}>
                    {block.type === 'indicator' && (
                      <span style={styles.blockLabel}>{block.indicator} ({Object.entries(block.params || {}).map(([k,v]) => `${k}:${v}`).join(', ')})</span>
                    )}
                    {block.type === 'condition' && (
                      <span style={styles.blockLabel}>{block.expr || 'No condition set'}</span>
                    )}
                    {block.type === 'action' && (
                      <span style={styles.blockLabel}>{block.action}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Block Editor */}
        <div style={styles.editor}>
          {selectedBlock ? (
            <>
              <h3 style={styles.editorTitle}>
                <span style={styles.editorIcon}>{getBlockIcon(selectedBlock.type)}</span>
                Edit {selectedBlock.type}
              </h3>

              {selectedBlock.type === 'indicator' && (
                <IndicatorEditor 
                  key={`${selectedBlock.id}-${selectedBlock.indicator}`}
                  block={selectedBlock} 
                  updateBlock={updateBlock} 
                />
              )}
              {selectedBlock.type === 'condition' && (
                <ConditionEditor 
                  key={selectedBlock.id}
                  block={selectedBlock} 
                  updateBlock={updateBlock} 
                  blocks={blocks} 
                />
              )}
              {selectedBlock.type === 'action' && (
                <ActionEditor 
                  key={`${selectedBlock.id}-${selectedBlock.action}`}
                  block={selectedBlock} 
                  updateBlock={updateBlock} 
                />
              )}
            </>
          ) : (
            <div style={styles.editorEmpty}>
              <p style={styles.editorEmptyText}>Select a block to edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Block Editors
function IndicatorEditor({ block, updateBlock }) {
  const indicatorType = INDICATOR_TYPES.find(i => i.id === block.indicator);

  return (
    <div style={styles.editorContent}>
      <label style={styles.label}>Indicator Type:</label>
      <select
        value={block.indicator}
        onChange={(e) => {
          const newType = INDICATOR_TYPES.find(i => i.id === e.target.value);
          const defaultParams = {};
          newType.params.forEach(p => defaultParams[p.name] = p.default);
          updateBlock(block.id, { indicator: e.target.value, params: defaultParams });
        }}
        style={styles.select}
      >
        {INDICATOR_TYPES.map(ind => (
          <option key={ind.id} value={ind.id}>{ind.name}</option>
        ))}
      </select>

      {indicatorType?.params.map(param => (
        <div key={param.name} style={styles.formGroup}>
          <label style={styles.label}>{param.name.charAt(0).toUpperCase() + param.name.slice(1)}:</label>
          <input
            type={param.type}
            value={block.params?.[param.name] || param.default}
            onChange={(e) => updateBlock(block.id, {
              params: { ...block.params, [param.name]: parseFloat(e.target.value) }
            })}
            style={styles.input}
          />
        </div>
      ))}
    </div>
  );
}

function ConditionEditor({ block, updateBlock, blocks }) {
  const indicatorBlocks = blocks.filter(b => b.type === 'indicator');

  return (
    <div style={styles.editorContent}>
      <label style={styles.label}>Condition Expression:</label>
      <textarea
        value={block.expr}
        onChange={(e) => updateBlock(block.id, { expr: e.target.value })}
        style={styles.textarea}
        placeholder="e.g., cross_over(b1,b2) or b3 > 70"
        rows={4}
      />

      <div style={styles.helpBox}>
        <p style={styles.helpTitle}>Available Blocks:</p>
        <ul style={styles.helpList}>
          {indicatorBlocks.map(b => (
            <li key={b.id} style={styles.helpItem}>{b.id} = {b.indicator}</li>
          ))}
        </ul>
        <p style={styles.helpTitle}>Examples:</p>
        <ul style={styles.helpList}>
          <li style={styles.helpItem}>cross_over(b1, b2) - b1 crosses above b2</li>
          <li style={styles.helpItem}>cross_under(b1, b2) - b1 crosses below b2</li>
          <li style={styles.helpItem}>b3 {'>'} 70 - RSI above 70</li>
          <li style={styles.helpItem}>b1 {'<'} b2 - SMA comparison</li>
        </ul>
      </div>
    </div>
  );
}

function ActionEditor({ block, updateBlock }) {
  const actionType = ACTION_TYPES.find(a => a.id === block.action);

  return (
    <div style={styles.editorContent}>
      <label style={styles.label}>Action Type:</label>
      <select
        value={block.action}
        onChange={(e) => {
          const newType = ACTION_TYPES.find(a => a.id === e.target.value);
          const defaultParams = {};
          newType.params.forEach(p => defaultParams[p.name] = p.default);
          updateBlock(block.id, { action: e.target.value, params: defaultParams });
        }}
        style={styles.select}
      >
        {ACTION_TYPES.map(action => (
          <option key={action.id} value={action.id}>{action.name}</option>
        ))}
      </select>

      {actionType?.params.map(param => (
        <div key={param.name} style={styles.formGroup}>
          <label style={styles.label}>{param.label}:</label>
          <input
            type={param.type}
            value={block.params?.[param.name] || param.default}
            onChange={(e) => updateBlock(block.id, {
              params: { ...block.params, [param.name]: parseFloat(e.target.value) }
            })}
            min={param.min}
            max={param.max}
            step={param.step}
            style={styles.input}
          />
          <span style={styles.inputHint}>{(parseFloat(block.params?.[param.name] || param.default) * 100).toFixed(0)}%</span>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F0FDFA',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 32px',
    background: 'linear-gradient(135deg, #10B981, #059669)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  headerIcon: {
    fontSize: '28px'
  },
  strategyNameInput: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    border: '1.5px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '8px',
    padding: '8px 16px',
    outline: 'none',
    minWidth: '300px'
  },
  headerRight: {
    display: 'flex',
    gap: '12px'
  },
  saveButton: {
    background: 'linear-gradient(135deg, #FFFFFF, #F0FDFA)',
    color: '#059669',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.3s ease'
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr 320px',
    gap: '24px',
    padding: '24px',
    height: 'calc(100vh - 88px)'
  },
  palette: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)',
    overflowY: 'auto'
  },
  paletteTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#059669',
    marginBottom: '20px'
  },
  paletteSection: {
    marginBottom: '24px'
  },
  paletteSectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: '12px'
  },
  paletteButton: {
    width: '100%',
    padding: '10px 16px',
    marginBottom: '8px',
    backgroundColor: '#F0FDFA',
    border: '1.5px solid #D1FAE5',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#059669',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'left'
  },
  canvas: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto'
  },
  canvasHeader: {
    display: 'flex',
    gap: '24px',
    marginBottom: '24px',
    paddingBottom: '20px',
    borderBottom: '1.5px solid #E5E7EB'
  },
  blocksContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#9CA3AF'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px'
  },
  emptyText: {
    fontSize: '16px',
    fontWeight: '500'
  },
  block: {
    backgroundColor: '#FFFFFF',
    border: '1.5px solid #E5E7EB',
    borderRadius: '10px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  blockHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px'
  },
  blockIcon: {
    fontSize: '20px'
  },
  blockId: {
    fontSize: '14px',
    fontWeight: '700'
  },
  blockType: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    padding: '4px 8px',
    borderRadius: '4px'
  },
  deleteButton: {
    marginLeft: 'auto',
    backgroundColor: '#FEE2E2',
    border: 'none',
    borderRadius: '6px',
    width: '28px',
    height: '28px',
    fontSize: '20px',
    color: '#DC2626',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  blockContent: {
    fontSize: '14px',
    color: '#4B5563'
  },
  blockLabel: {
    fontFamily: 'monospace',
    fontSize: '13px'
  },
  editor: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)',
    overflowY: 'auto'
  },
  editorTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '18px',
    fontWeight: '700',
    color: '#059669',
    marginBottom: '20px'
  },
  editorIcon: {
    fontSize: '24px'
  },
  editorContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  editorEmpty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#9CA3AF'
  },
  editorEmptyText: {
    fontSize: '15px',
    fontWeight: '500'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '4px'
  },
  input: {
    padding: '10px 14px',
    border: '1.5px solid #D1FAE5',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.3s ease'
  },
  select: {
    padding: '10px 14px',
    border: '1.5px solid #D1FAE5',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer'
  },
  textarea: {
    padding: '10px 14px',
    border: '1.5px solid #D1FAE5',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'monospace',
    outline: 'none',
    resize: 'vertical'
  },
  inputHint: {
    fontSize: '12px',
    color: '#6B7280',
    fontWeight: '500'
  },
  helpBox: {
    backgroundColor: '#F0FDFA',
    border: '1.5px solid #D1FAE5',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '8px'
  },
  helpTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#059669',
    marginBottom: '8px'
  },
  helpList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 12px 0'
  },
  helpItem: {
    fontSize: '12px',
    color: '#4B5563',
    fontFamily: 'monospace',
    marginBottom: '4px'
  }
};
