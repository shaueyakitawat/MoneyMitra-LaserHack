import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './GetReport.css';

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
      setReportData(null); // Clear previous report
      
      console.log(`Fetching report for ${symbol} with benchmark ${benchmarkIndex}`);
      
      // Now fetch the actual report
      const response = await fetch('http://localhost:5001/generate_report', {
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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Report data received:', data);
      
      if (data.success) {
        setReportData(data);
        console.log('Report successfully loaded');
      } else {
        throw new Error(data.error || 'Failed to generate report');
      }
    } catch (err) {
      console.error('Error details:', err);
      
      if (err.message.includes('Failed to fetch')) {
        setError('Cannot connect to backend server. Please ensure the Flask server is running on http://localhost:5001');
      } else {
        setError(`Error: ${err.message}`);
      }
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

      // Create PDF using jsPDF directly with text content for better clarity
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Helper function to add text with word wrapping
      const addText = (text, fontSize = 10, isBold = false, color = [0, 0, 0]) => {
        pdf.setFontSize(fontSize);
        pdf.setTextColor(color[0], color[1], color[2]);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        const lines = pdf.splitTextToSize(text, contentWidth);
        
        // Check if we need a new page
        if (yPosition + (lines.length * fontSize * 0.5) > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        pdf.text(lines, margin, yPosition);
        yPosition += lines.length * fontSize * 0.5 + 5;
      };

      const addSection = (title) => {
        yPosition += 10;
        addText(title, 14, true, [44, 62, 80]);
        yPosition += 5;
      };

      // Header
      addText('MONEYMITRA FINANCIAL ANALYSIS REPORT', 16, true, [0, 0, 0]);
      addText(`Generated on: ${new Date().toLocaleDateString()}`, 10, false, [100, 100, 100]);
      yPosition += 10;

      // Executive Summary
      addSection('EXECUTIVE SUMMARY');
      addText(`Company: ${reportData.executive_summary.company_name}`, 12, true);
      addText(`Sector: ${reportData.executive_summary.sector}`);
      addText(`Current Price: $${reportData.executive_summary.current_price?.toFixed(2)} ${reportData.executive_summary.currency}`);
      addText(`Overall Rating: ${reportData.executive_summary.overall_rating}`);
      addText(`Risk Level: ${reportData.executive_summary.investment_grade}`);
      addText(`Suitable For: ${reportData.executive_summary.suitable_for}`);

      // Performance Metrics
      addSection('PERFORMANCE METRICS');
      addText(`CAGR (Compound Annual Growth Rate): ${reportData.performance_analysis.returns.cagr.percentage}`, 11, true);
      addText(`Interpretation: ${reportData.performance_analysis.returns.cagr.interpretation}`);
      addText(reportData.performance_analysis.returns.cagr.explanation);
      yPosition += 5;

      addText(`Volatility: ${reportData.performance_analysis.risk_metrics.volatility.percentage}`, 11, true);
      addText(`Risk Level: ${reportData.performance_analysis.risk_metrics.volatility.risk_level}`);
      addText(reportData.performance_analysis.risk_metrics.volatility.explanation);
      yPosition += 5;

      addText(`Sharpe Ratio: ${reportData.performance_analysis.risk_metrics.sharpe_ratio.value?.toFixed(2)}`, 11, true);
      addText(`Rating: ${reportData.performance_analysis.risk_metrics.sharpe_ratio.rating}`);
      addText(reportData.performance_analysis.risk_metrics.sharpe_ratio.explanation);
      yPosition += 5;

      addText(`Beta: ${reportData.performance_analysis.risk_metrics.beta.value?.toFixed(2)}`, 11, true);
      addText(`Market Sensitivity: ${reportData.performance_analysis.risk_metrics.beta.market_sensitivity}`);
      addText(reportData.performance_analysis.risk_metrics.beta.explanation);
      yPosition += 5;

      addText(`Maximum Drawdown: ${reportData.performance_analysis.risk_metrics.maximum_drawdown.percentage}`, 11, true);
      addText(`Severity: ${reportData.performance_analysis.risk_metrics.maximum_drawdown.severity}`);
      addText(reportData.performance_analysis.risk_metrics.maximum_drawdown.explanation);

      // Advanced Analysis
      addSection('ADVANCED ANALYSIS');
      addText('CAPM Model Analysis:', 12, true);
      addText(`Expected Return: ${reportData.advanced_analysis.capm_model.expected_return_percentage}`);
      addText(reportData.advanced_analysis.camp_model?.explanation || reportData.advanced_analysis.capm_model.explanation);
      yPosition += 5;

      addText('Monte Carlo Simulation Results:', 12, true);
      addText(`Most Likely Outcome: ${reportData.advanced_analysis.monte_carlo_simulation.projected_scenarios.most_likely_outcome?.toFixed(2)}x`);
      addText(`Worst Case (5th percentile): ${reportData.advanced_analysis.monte_carlo_simulation.projected_scenarios.worst_case_5th_percentile?.toFixed(2)}x`);
      addText(`Best Case (95th percentile): ${reportData.advanced_analysis.monte_carlo_simulation.projected_scenarios.best_case_95th_percentile?.toFixed(2)}x`);
      addText(`Probability of Positive Return: ${reportData.advanced_analysis.monte_carlo_simulation.probability_analysis.positive_return_probability}`);

      // Investment Recommendation
      addSection('INVESTMENT RECOMMENDATION');
      addText(reportData.investment_recommendation.recommendation, 12, true);
      yPosition += 5;

      addText('Key Insights:', 11, true);
      reportData.investment_recommendation.key_insights.forEach(insight => {
        addText(`• ${insight}`);
      });
      yPosition += 5;

      addText('Action Points:', 11, true);
      reportData.investment_recommendation.action_points.forEach(action => {
        addText(`• ${action}`);
      });

      if (reportData.investment_recommendation.risk_assessment.key_risk_factors.length > 0) {
        yPosition += 5;
        addText('Risk Factors:', 11, true, [133, 100, 4]);
        reportData.investment_recommendation.risk_assessment.key_risk_factors.forEach(risk => {
          addText(`• ${risk}`, 10, false, [133, 100, 4]);
        });
      }

      // Educational Content
      addSection('EDUCATIONAL CONTENT');
      Object.entries(reportData.educational_content.key_concepts).forEach(([key, value]) => {
        addText(`${key.toUpperCase()}:`, 11, true);
        addText(value);
        yPosition += 3;
      });

      // Footer
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10);
        pdf.text('Confidential - For Investment Research Only', margin, pageHeight - 10);
      }

      // Save the PDF
      const filename = `MoneyMitra_${reportData.stock_symbol}_Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`;
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
        <h1>🚀 MoneyMitra Financial Analysis</h1>
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

          {/* Executive Summary */}
          <div className="document-section">
            <h2 className="section-title">EXECUTIVE SUMMARY</h2>
            <table className="summary-table">
              <tbody>
                <tr>
                  <th>Company Name</th>
                  <td>{reportData.executive_summary.company_name}</td>
                </tr>
                <tr>
                  <th>Sector</th>
                  <td>{reportData.executive_summary.sector}</td>
                </tr>
                <tr>
                  <th>Current Price</th>
                  <td>${reportData.executive_summary.current_price?.toFixed(2)} {reportData.executive_summary.currency}</td>
                </tr>
                <tr>
                  <th>Market Cap</th>
                  <td>{typeof reportData.executive_summary.market_cap === 'number' 
                    ? `$${(reportData.executive_summary.market_cap / 1e9).toFixed(1)}B` 
                    : reportData.executive_summary.market_cap}</td>
                </tr>
                <tr>
                  <th>Overall Rating</th>
                  <td><strong>{reportData.executive_summary.overall_rating}</strong></td>
                </tr>
                <tr>
                  <th>Risk Level</th>
                  <td><strong>{reportData.executive_summary.investment_grade}</strong></td>
                </tr>
                <tr>
                  <th>Suitable For</th>
                  <td>{reportData.executive_summary.suitable_for}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Performance Metrics */}
          <div className="document-section">
            <h2 className="section-title">PERFORMANCE METRICS</h2>
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                  <th>Interpretation</th>
                  <th>Explanation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>CAGR</strong></td>
                  <td className="metric-value">{reportData.performance_analysis.returns.cagr.percentage}</td>
                  <td>{reportData.performance_analysis.returns.cagr.interpretation}</td>
                  <td>{reportData.performance_analysis.returns.cagr.explanation}</td>
                </tr>
                <tr>
                  <td><strong>Volatility</strong></td>
                  <td className="metric-value">{reportData.performance_analysis.risk_metrics.volatility.percentage}</td>
                  <td>{reportData.performance_analysis.risk_metrics.volatility.risk_level}</td>
                  <td>{reportData.performance_analysis.risk_metrics.volatility.explanation}</td>
                </tr>
                <tr>
                  <td><strong>Sharpe Ratio</strong></td>
                  <td className="metric-value">{reportData.performance_analysis.risk_metrics.sharpe_ratio.value?.toFixed(2)}</td>
                  <td>{reportData.performance_analysis.risk_metrics.sharpe_ratio.rating}</td>
                  <td>{reportData.performance_analysis.risk_metrics.sharpe_ratio.explanation}</td>
                </tr>
                <tr>
                  <td><strong>Beta</strong></td>
                  <td className="metric-value">{reportData.performance_analysis.risk_metrics.beta.value?.toFixed(2)}</td>
                  <td>{reportData.performance_analysis.risk_metrics.beta.market_sensitivity}</td>
                  <td>{reportData.performance_analysis.risk_metrics.beta.explanation}</td>
                </tr>
                <tr>
                  <td><strong>Max Drawdown</strong></td>
                  <td className="metric-value">{reportData.performance_analysis.risk_metrics.maximum_drawdown.percentage}</td>
                  <td>{reportData.performance_analysis.risk_metrics.maximum_drawdown.severity}</td>
                  <td>{reportData.performance_analysis.risk_metrics.maximum_drawdown.explanation}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Advanced Analysis */}
          <div className="document-section">
            <h2 className="section-title">ADVANCED ANALYSIS</h2>
            
            <div className="text-section">
              <h3>CAPM Model Analysis</h3>
              <p><strong>Expected Return:</strong> {reportData.advanced_analysis.capm_model.expected_return_percentage}</p>
              <p><strong>Market Return:</strong> {(reportData.advanced_analysis.capm_model?.market_return * 100)?.toFixed(2)}%</p>
              <p>{reportData.advanced_analysis.capm_model.explanation}</p>
            </div>

            <div className="text-section">
              <h3>Monte Carlo Simulation Results</h3>
              <p><strong>Simulations Run:</strong> {reportData.advanced_analysis.monte_carlo_simulation.probability_analysis.simulations_run}</p>
              <p><strong>Most Likely Outcome:</strong> {reportData.advanced_analysis.monte_carlo_simulation.projected_scenarios.most_likely_outcome?.toFixed(2)}x return</p>
              <p><strong>Worst Case (5th percentile):</strong> {reportData.advanced_analysis.monte_carlo_simulation.projected_scenarios.worst_case_5th_percentile?.toFixed(2)}x return</p>
              <p><strong>Best Case (95th percentile):</strong> {reportData.advanced_analysis.monte_carlo_simulation.projected_scenarios.best_case_95th_percentile?.toFixed(2)}x return</p>
              <p><strong>Probability of Positive Return:</strong> {reportData.advanced_analysis.monte_carlo_simulation.probability_analysis.positive_return_probability}</p>
              <p>{reportData.advanced_analysis.monte_carlo_simulation.explanation}</p>
            </div>
          </div>

          {/* Investment Recommendation */}
          <div className="document-section">
            <h2 className="section-title">INVESTMENT RECOMMENDATION</h2>
            
            <div className="text-section">
              <h3>Overall Recommendation</h3>
              <p><strong>{reportData.investment_recommendation.recommendation}</strong></p>
              <p><strong>Suitable for:</strong> {reportData.executive_summary.suitable_for}</p>
            </div>

            <div className="text-section">
              <h3>Key Insights</h3>
              <ul>
                {reportData.investment_recommendation.key_insights.map((insight, index) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            </div>

            <div className="text-section">
              <h3>Recommended Action Points</h3>
              <ul>
                {reportData.investment_recommendation.action_points.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>

            {reportData.investment_recommendation.risk_assessment.key_risk_factors.length > 0 && (
              <div className="risk-factors-list">
                <h4>⚠️ Key Risk Factors</h4>
                <ul>
                  {reportData.investment_recommendation.risk_assessment.key_risk_factors.map((risk, index) => (
                    <li key={index}>{risk}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Educational Content */}
          <div className="document-section">
            <h2 className="section-title">EDUCATIONAL CONTENT</h2>
            
            <div className="educational-content">
              <h4>📚 Key Financial Concepts Explained</h4>
              {Object.entries(reportData.educational_content.key_concepts).map(([key, value]) => (
                <div key={key} className="text-section">
                  <h3>{key.toUpperCase()}</h3>
                  <p>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Details */}
          <div className="document-section">
            <h2 className="section-title">TECHNICAL DETAILS</h2>
            <table className="summary-table">
              <tbody>
                <tr>
                  <th>Analysis Period</th>
                  <td>{reportData.analysis_period}</td>
                </tr>
                <tr>
                  <th>Benchmark Used</th>
                  <td>{reportData.benchmark}</td>
                </tr>
                <tr>
                  <th>Data Points Analyzed</th>
                  <td>{reportData.technical_details?.data_points_analyzed || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Data Source</th>
                  <td>{reportData.technical_details?.data_source || 'Yahoo Finance'}</td>
                </tr>
                <tr>
                  <th>Analysis Methodology</th>
                  <td>{reportData.technical_details?.analysis_methodology || 'Modern Portfolio Theory & CAPM'}</td>
                </tr>
              </tbody>
            </table>
            
            <div className="text-section">
              <p><strong>Disclaimer:</strong> This report is for educational and informational purposes only. It should not be considered as investment advice. Past performance does not guarantee future results. Please consult with a qualified financial advisor before making investment decisions.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetReport;
