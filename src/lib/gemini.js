import { GoogleGenerativeAI } from '@google/generative-ai';

export const analyzeWithGemini = async (text) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    // Return mock analysis if no API key
    return getMockAnalysis();
  }
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
      Analyze the following financial document/portfolio and provide:
      
      1. **Key Holdings Summary**: List main investments and allocations
      2. **Risk Assessment**: Identify risk factors and concentration risks
      3. **Diversification Analysis**: Evaluate asset class and sector distribution
      4. **Performance Review**: Assess returns and benchmarking
      5. **Cost Analysis**: Review fees, charges, and expense ratios
      6. **Pros & Cons**: List strengths and weaknesses
      7. **Action Checklist**: Provide 3-5 specific recommendations
      
      Keep the analysis professional, educational, and suitable for Indian retail investors.
      
      Document text:
      ${text}
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return getMockAnalysis();
  }
};

const getMockAnalysis = () => {
  return `
# Portfolio Analysis Report

## 1. Key Holdings Summary
- Large Cap Equity: 45% (₹45,000)
- Mid Cap Equity: 25% (₹25,000)
- Debt Funds: 20% (₹20,000)
- Cash/FD: 10% (₹10,000)

## 2. Risk Assessment
**Medium Risk Profile**
- Concentration risk in financial services sector (30%)
- Good mix of equity and debt instruments
- Limited international exposure

## 3. Diversification Analysis
- **Asset Classes**: Well diversified across equity and debt
- **Sectors**: Overweight in financials, underweight in healthcare
- **Market Cap**: Good spread across large and mid-cap

## 4. Performance Review
- 1-year return: 12.5% vs Nifty 50: 11.2%
- 3-year CAGR: 14.8%
- Outperformed benchmark in 7 out of 12 months

## 5. Cost Analysis
- Average expense ratio: 1.2%
- Total annual costs: ₹1,200 on ₹1,00,000 portfolio
- Consider direct plans to reduce costs

## 6. Pros & Cons

**Pros:**
- Good asset allocation for moderate risk appetite
- Consistent outperformance vs benchmark
- Regular SIP discipline maintained

**Cons:**
- High sector concentration in financials
- Limited international exposure
- Higher expense ratios in some funds

## 7. Action Checklist
1. **Rebalance**: Reduce financial sector exposure to 25%
2. **Diversify**: Add healthcare and technology sector funds
3. **Cost Optimization**: Switch to direct plans to save 0.5-1% annually
4. **International Exposure**: Consider adding 5-10% international equity
5. **Review Frequency**: Set quarterly portfolio review schedule

*This is a mock analysis. Actual Gemini AI analysis would provide more detailed insights based on the uploaded document.*
  `.trim();
};