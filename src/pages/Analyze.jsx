import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { extractTextFromPDF } from '../lib/pdf';
import { analyzeWithGemini } from '../lib/gemini';
import Card from '../components/Card';

const Analyze = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('upload'); // upload, extract, analyze, results
  const fileInputRef = useRef();

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setStep('extract');
    }
  };

  const extractText = async () => {
    if (!file) return;
    
    setLoading(true);
    try {
      const text = await extractTextFromPDF(file);
      setExtractedText(text);
      setStep('analyze');
    } catch (error) {
      console.error('Failed to extract text:', error);
      alert('Failed to extract text from PDF. Please try a different file.');
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    if (!extractedText) return;
    
    setLoading(true);
    try {
      const result = await analyzeWithGemini(extractedText);
      setAnalysis(result);
      setStep('results');
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setExtractedText('');
    setAnalysis('');
    setStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const copyAnalysis = () => {
    navigator.clipboard.writeText(analysis);
    alert('Analysis copied to clipboard!');
  };

  const downloadAnalysis = () => {
    const blob = new Blob([analysis], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 style={{ marginBottom: '32px' }}>AI Portfolio Analyzer</h1>

          {/* Security Warning */}
          <Card style={{ marginBottom: '32px', border: '1px solid var(--warning)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '24px' }}>⚠️</div>
              <div>
                <h4 style={{ color: 'var(--warning)', marginBottom: '4px' }}>Security Notice</h4>
                <p style={{ color: 'var(--textSecondary)', fontSize: '14px' }}>
                  This feature uses Gemini API directly from the browser. In production, API keys should be secured on the server.
                  {!import.meta.env.VITE_GEMINI_API_KEY && ' No API key configured - using mock analysis.'}
                </p>
              </div>
            </div>
          </Card>

          {step === 'upload' && (
            <Card style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: '20px' }}>Upload Portfolio PDF</h3>
              <div style={{
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '60px 20px',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📄</div>
                <h4 style={{ marginBottom: '12px', color: 'var(--ink)' }}>
                  Upload PDF for AI Analysis
                </h4>
                <p style={{ color: 'var(--textSecondary)', marginBottom: '24px' }}>
                  Upload your portfolio statement, mutual fund report, or any financial document
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary"
                  style={{ padding: '12px 32px' }}
                >
                  📁 Select PDF File
                </button>
              </div>
              <p style={{ color: 'var(--textMuted)', fontSize: '12px' }}>
                Supports PDF files up to 10MB
              </p>
            </Card>
          )}

          {step === 'extract' && (
            <Card style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: '20px' }}>Extract Text</h3>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                <p style={{ color: 'var(--textSecondary)' }}>
                  Selected: <strong>{file?.name}</strong>
                </p>
                <p style={{ color: 'var(--textMuted)', fontSize: '12px', marginTop: '8px' }}>
                  Size: {(file?.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button onClick={reset} className="btn-secondary">
                  ← Back
                </button>
                <button
                  onClick={extractText}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Extracting...' : 'Extract Text →'}
                </button>
              </div>
            </Card>
          )}

          {step === 'analyze' && (
            <div>
              <Card style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '16px' }}>Extracted Text Preview</h3>
                <div style={{
                  background: 'var(--neutralBg)',
                  padding: '16px',
                  borderRadius: 'var(--radius)',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  lineHeight: '1.4'
                }}>
                  {extractedText.slice(0, 1000)}
                  {extractedText.length > 1000 && '... (truncated)'}
                </div>
                <p style={{ color: 'var(--textMuted)', fontSize: '12px', marginTop: '8px' }}>
                  Extracted {extractedText.length} characters
                </p>
              </Card>

              <Card style={{ textAlign: 'center' }}>
                <h3 style={{ marginBottom: '20px' }}>Ready for AI Analysis</h3>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
                <p style={{ color: 'var(--textSecondary)', marginBottom: '24px' }}>
                  AI will analyze your document for holdings, risks, diversification, and provide recommendations
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button onClick={() => setStep('extract')} className="btn-secondary">
                    ← Back
                  </button>
                  <button
                    onClick={runAnalysis}
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Analyzing...' : '🚀 Analyze with AI'}
                  </button>
                </div>
              </Card>
            </div>
          )}

          {step === 'results' && analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3>AI Analysis Report</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={copyAnalysis} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      📋 Copy
                    </button>
                    <button onClick={downloadAnalysis} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      📥 Download
                    </button>
                    <button onClick={reset} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      🔄 New Analysis
                    </button>
                  </div>
                </div>

                <div style={{
                  background: 'var(--neutralBg)',
                  padding: '24px',
                  borderRadius: 'var(--radius)',
                  lineHeight: '1.6',
                  maxHeight: '600px',
                  overflowY: 'auto'
                }}>
                  <div style={{ whiteSpace: 'pre-line', color: 'var(--ink)' }}>
                    {analysis}
                  </div>
                </div>
              </Card>

              <Card style={{ textAlign: 'center' }}>
                <h4 style={{ color: 'var(--success)', marginBottom: '12px' }}>Analysis Complete! ✅</h4>
                <p style={{ color: 'var(--textSecondary)', marginBottom: '20px' }}>
                  Your portfolio analysis is ready. Review the recommendations and take action.
                </p>
                <button onClick={reset} className="btn-primary">
                  Analyze Another Document
                </button>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Analyze;