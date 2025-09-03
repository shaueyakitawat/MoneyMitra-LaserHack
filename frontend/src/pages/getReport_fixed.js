import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './getReport.css';

const GetReport = () => {
  const [stockSymbol, setStockSymbol] = useState('');
  const [benchmark, setBenchmark] = useState('^GSPC');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef(null);

  const popularStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft' },
    { symbol: 'GOOGL', name: 'Google' },
    { symbol: 'TSLA', name: 'Tesla' },
    { symbol: 'AMZN', name: 'Amazon' },
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services' },
    { symbol: 'INFY.NS', name: 'Infosys' }
  ];

  const benchmarkOptions = [
    { value: '^GSPC', name: 'S&P 500' },
    { value: '^NSEI', name: 'Nifty 50' },
    { value: '^DJI', name: 'Dow Jones' },
    { value: '^IXIC', name: 'NASDAQ' }
  ];

  const fetchFinancialReport = async (symbol, benchmarkIndex) => {
    try {
      setLoading(true);
      setError('');
      
      console.log(`Fetching report for ${symbol} with benchmark ${benchmarkIndex}`);
      
      // First test connectivity
      const testResponse = await fetch('http://localhost:5000/test', {
        method: 'GET',
        mode: 'cors',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Test response status:', testResponse.status);
      
      if (!testResponse.ok) {
        throw new Error('Cannot connect to backend server');
      }
      
      // Now fetch the actual report
      const response = await fetch('http://localhost:5000/generate_report', {
        method: 'POST',
        mode: 'cors',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          symbol: symbol.toUpperCase(), 
          benchmark: benchmarkIndex 
        })
      });
      
      console.log('Report response status:', response.status);
      console.log('Report response headers:', response.headers);
      
      const data = await response.json();
      console.log('Report data:', data);
      
      if (data.success) {
        setReportData(data);
      } else {
        setError(data.error || 'Failed to generate report');
      }
    } catch (err) {
      console.error('Error details:', err);
      setError(`Network error: ${err.message}. Please ensure the backend server is running on http://localhost:5000`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!stockSymbol.trim()) {
      setError('Please enter a stock symbol');
      return;
    }
    fetchFinancialReport(stockSymbol, benchmark);
  };

  const handleQuickSelect = (symbol) => {
    setStockSymbol(symbol);
    setError('');
  };

  const downloadReportAsPDF = async () => {
    if (!reportData || !reportRef.current) {
      alert('No report available to download');
      return;
    }

    try {
      setDownloading(true);

      // Create a clean version of the report for PDF
      const reportElement = reportRef.current;
      
      // Temporarily hide the download button
      const downloadBtn = document.querySelector('.download-btn');
      if (downloadBtn) downloadBtn.style.display = 'none';

      // Configure html2canvas options for better quality
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        height: reportElement.scrollHeight,
        width: reportElement.scrollWidth
      });

      // Show the download button again
      if (downloadBtn) downloadBtn.style.display = 'block';

      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 10; // 10mm top margin

      // Add first page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20; // Account for margins

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      // Add header and footer to each page
      const pageCount = pdf.internal.getNumberOfPages();
      const companyName = reportData.executive_summary.company_name;
      const reportDate = new Date().toLocaleDateString();

      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        
        // Header
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(`JainVest Financial Analysis - ${companyName}`, 10, 5);
        pdf.text(`Generated: ${reportDate}`, pdfWidth - 60, 5);
        
        // Footer
        pdf.text(`Page ${i} of ${pageCount}`, pdfWidth - 30, pdfHeight - 5);
        pdf.text('Confidential - For Investment Research Only', 10, pdfHeight - 5);
      }

      // Save the PDF
      const filename = `JainVest_${reportData.stock_symbol}_Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return '#28a745';
      case 'moderate': case 'medium': return '#ffc107';
      case 'high': return '#dc3545';
      case 'very high': return '#721c24';
      default: return '#6c757d';
    }
  };

  const getRatingColor = (rating) => {
    switch (rating?.toLowerCase()) {
      case 'excellent': return '#28a745';
      case 'good': return '#20c997';
      case 'fair': return '#ffc107';
      case 'poor': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div className="report-container">
      <header className="report-header">
        <h1>🚀 JainVest Financial Analysis</h1>
        <p>Get comprehensive financial reports with AI-powered insights</p>
      </header>

      {/* Input Section */}
      <div className="input-section">
        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-group">
            <label htmlFor="stockSymbol">Stock Symbol</label>
            <input
              type="text"
              id="stockSymbol"
              value={stockSymbol}
              onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
              placeholder="Enter stock symbol (e.g., AAPL, MSFT)"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="benchmark">Benchmark Index</label>
            <select
              id="benchmark"
              value={benchmark}
              onChange={(e) => setBenchmark(e.target.value)}
              className="form-select"
            >
              {benchmarkOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            className="generate-btn"
            disabled={loading}
          >
            {loading ? '📊 Analyzing...' : '📈 Generate Report'}
          </button>
        </form>

        {/* Quick Select Buttons */}
        <div className="quick-select">
          <h3>Popular Stocks</h3>
          <div className="stock-buttons">
            {popularStocks.map(stock => (
              <button
                key={stock.symbol}
                onClick={() => handleQuickSelect(stock.symbol)}
                className="stock-btn"
              >
                {stock.symbol}
                <span>{stock.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Analyzing {stockSymbol}... Please wait</p>
        </div>
      )}

      {/* Report Display */}
      {reportData && !loading && (
        <div className="report-results" ref={reportRef}>
          {/* Report Header with Download Button */}
          <div className="report-header-controls">
            <div className="report-title">
              <h2>📈 Financial Analysis Report</h2>
              <p>Comprehensive analysis for {reportData.stock_symbol}</p>
            </div>
            <button 
              onClick={downloadReportAsPDF}
              className="download-btn"
              disabled={downloading}
            >
              {downloading ? (
                <>📄 Generating PDF...</>
              ) : (
                <>📄 Download PDF</>
              )}
            </button>
          </div>

          {/* Executive Summary Card */}
          <div className="summary-card">
            <h2>📊 Executive Summary</h2>
            <div className="summary-grid">
              <div className="summary-item">
                <h3>{reportData.executive_summary.company_name}</h3>
                <p className="sector">{reportData.executive_summary.sector}</p>
              </div>
              <div className="summary-item">
                <span className="label">Current Price</span>
                <span className="value">
                  ${reportData.executive_summary.current_price?.toFixed(2)} {reportData.executive_summary.currency}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">Overall Rating</span>
                <span 
                  className="value rating"
                  style={{ color: getRatingColor(reportData.executive_summary.overall_rating) }}
                >
                  {reportData.executive_summary.overall_rating}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">Risk Level</span>
                <span 
                  className="value risk"
                  style={{ color: getRiskColor(reportData.executive_summary.investment_grade) }}
                >
                  {reportData.executive_summary.investment_grade}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>📈 CAGR</h3>
              <div className="metric-value">
                {reportData.performance_analysis.returns.cagr.percentage}
              </div>
              <p className="metric-interpretation">
                {reportData.performance_analysis.returns.cagr.interpretation}
              </p>
              <p className="metric-explanation">
                {reportData.performance_analysis.returns.cagr.explanation}
              </p>
            </div>

            <div className="metric-card">
              <h3>⚡ Volatility</h3>
              <div className="metric-value">
                {reportData.performance_analysis.risk_metrics.volatility.percentage}
              </div>
              <p className="metric-interpretation">
                {reportData.performance_analysis.risk_metrics.volatility.risk_level}
              </p>
              <p className="metric-explanation">
                {reportData.performance_analysis.risk_metrics.volatility.explanation}
              </p>
            </div>

            <div className="metric-card">
              <h3>🎯 Sharpe Ratio</h3>
              <div className="metric-value">
                {reportData.performance_analysis.risk_metrics.sharpe_ratio.value?.toFixed(2)}
              </div>
              <p className="metric-interpretation">
                {reportData.performance_analysis.risk_metrics.sharpe_ratio.rating}
              </p>
              <p className="metric-explanation">
                {reportData.performance_analysis.risk_metrics.sharpe_ratio.explanation}
              </p>
            </div>

            <div className="metric-card">
              <h3>📉 Beta</h3>
              <div className="metric-value">
                {reportData.performance_analysis.risk_metrics.beta.value?.toFixed(2)}
              </div>
              <p className="metric-interpretation">
                {reportData.performance_analysis.risk_metrics.beta.market_sensitivity}
              </p>
              <p className="metric-explanation">
                {reportData.performance_analysis.risk_metrics.beta.explanation}
              </p>
            </div>

            <div className="metric-card">
              <h3>🔻 Max Drawdown</h3>
              <div className="metric-value">
                {reportData.performance_analysis.risk_metrics.maximum_drawdown.percentage}
              </div>
              <p className="metric-interpretation">
                {reportData.performance_analysis.risk_metrics.maximum_drawdown.severity}
              </p>
              <p className="metric-explanation">
                {reportData.performance_analysis.risk_metrics.maximum_drawdown.explanation}
              </p>
            </div>

            <div className="metric-card">
              <h3>🎲 Monte Carlo</h3>
              <div className="metric-value">
                {reportData.advanced_analysis.monte_carlo_simulation.probability_analysis.positive_return_probability}
              </div>
              <p className="metric-interpretation">
                Positive Return Probability
              </p>
              <p className="metric-explanation">
                Based on {reportData.advanced_analysis.monte_carlo_simulation.probability_analysis.simulations_run} simulations
              </p>
            </div>
          </div>

          {/* Investment Recommendation */}
          <div className="recommendation-card">
            <h2>💡 Investment Recommendation</h2>
            <div className="recommendation-content">
              <div className="recommendation-main">
                <h3>{reportData.investment_recommendation.recommendation}</h3>
                <p><strong>Suitable for:</strong> {reportData.executive_summary.suitable_for}</p>
              </div>
              
              <div className="insights-section">
                <h4>🔍 Key Insights:</h4>
                <ul>
                  {reportData.investment_recommendation.key_insights.map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </div>

              <div className="actions-section">
                <h4>🎯 Action Points:</h4>
                <ul>
                  {reportData.investment_recommendation.action_points.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>

              {reportData.investment_recommendation.risk_assessment.key_risk_factors.length > 0 && (
                <div className="risk-factors">
                  <h4>⚠️ Risk Factors:</h4>
                  <ul>
                    {reportData.investment_recommendation.risk_assessment.key_risk_factors.map((risk, index) => (
                      <li key={index}>{risk}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Advanced Analysis */}
          <div className="advanced-analysis">
            <h2>🎯 Advanced Analysis</h2>
            <div className="analysis-grid">
              <div className="analysis-card">
                <h3>CAPM Model</h3>
                <p><strong>Expected Return:</strong> {reportData.advanced_analysis.capm_model.expected_return_percentage}</p>
                <p><strong>Market Return:</strong> {(reportData.advanced_analysis.capm_model?.market_return * 100)?.toFixed(2)}%</p>
              </div>
              
              <div className="analysis-card">
                <h3>Monte Carlo Scenarios</h3>
                <p><strong>Most Likely:</strong> {reportData.advanced_analysis.monte_carlo_simulation.projected_scenarios.most_likely_outcome?.toFixed(2)}x</p>
                <p><strong>Worst Case (5%):</strong> {reportData.advanced_analysis.monte_carlo_simulation.projected_scenarios.worst_case_5th_percentile?.toFixed(2)}x</p>
                <p><strong>Best Case (95%):</strong> {reportData.advanced_analysis.monte_carlo_simulation.projected_scenarios.best_case_95th_percentile?.toFixed(2)}x</p>
              </div>
            </div>
          </div>

          {/* Educational Content */}
          <div className="educational-section">
            <h2>📚 Educational Content</h2>
            <div className="educational-grid">
              <div className="educational-card">
                <h3>📖 Key Concepts</h3>
                <div className="concept-list">
                  {Object.entries(reportData.educational_content.key_concepts).map(([key, value]) => (
                    <div key={key} className="concept-item">
                      <strong>{key.toUpperCase()}:</strong>
                      <p>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetReport;
