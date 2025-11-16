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

export const getQuizRecommendations = async (quizData) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    return getMockQuizRecommendations(quizData);
  }
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const { moduleTitle, preQuizScore, postQuizScore, weakTopics, strongTopics } = quizData;
    
    const prompt = `
      As an AI learning advisor for financial education, analyze this student's quiz performance and provide personalized recommendations.
      
      **Module**: ${moduleTitle}
      **Pre-Quiz Score**: ${preQuizScore.score}/${preQuizScore.total} (${preQuizScore.percentage}%)
      **Post-Quiz Score**: ${postQuizScore.score}/${postQuizScore.total} (${postQuizScore.percentage}%)
      **Improvement**: ${postQuizScore.percentage - preQuizScore.percentage}%
      
      **Weak Topics** (questions answered incorrectly):
      ${weakTopics.map((t, i) => `${i + 1}. ${t}`).join('\n')}
      
      **Strong Topics** (questions answered correctly):
      ${strongTopics.map((t, i) => `${i + 1}. ${t}`).join('\n')}
      
      Please provide:
      
      1. **Performance Summary** (2-3 sentences): Overall assessment of their learning journey
      2. **Key Strengths** (2-3 bullet points): What they've mastered well
      3. **Areas for Improvement** (2-3 bullet points): Topics needing more focus
      4. **Personalized Recommendations** (4-5 actionable items): Specific next steps, resources, or practice areas
      5. **Motivational Message** (1-2 sentences): Encouraging words based on their progress
      
      Keep the tone supportive, educational, and suitable for Indian retail investors learning financial concepts.
      Format the response in clear markdown with headings and bullet points.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return getMockQuizRecommendations(quizData);
  }
};

const getMockQuizRecommendations = (quizData) => {
  const improvement = quizData.postQuizScore.percentage - quizData.preQuizScore.percentage;
  const performanceLevel = quizData.postQuizScore.percentage >= 80 ? 'excellent' : 
                           quizData.postQuizScore.percentage >= 60 ? 'good' : 'needs improvement';
  
  return `
# Learning Recommendations for ${quizData.moduleTitle}

## 📊 Performance Summary
You've shown ${improvement > 0 ? 'significant improvement' : 'consistent performance'} with a ${Math.abs(improvement)}% ${improvement > 0 ? 'increase' : 'change'} from pre-quiz to post-quiz. Your ${performanceLevel} post-quiz score of ${quizData.postQuizScore.percentage}% demonstrates ${performanceLevel === 'excellent' ? 'strong mastery' : performanceLevel === 'good' ? 'good understanding' : 'room for growth'} of the module content.

## ✅ Key Strengths
${quizData.strongTopics.slice(0, 3).map(topic => `- **${topic}**: You've demonstrated solid understanding of this concept`).join('\n')}

## 📈 Areas for Improvement
${quizData.weakTopics.slice(0, 3).map(topic => `- **${topic}**: Review this topic with additional practice and examples`).join('\n')}

## 🎯 Personalized Recommendations

1. **Revisit Challenging Concepts**: Focus on ${quizData.weakTopics.slice(0, 2).join(' and ')}. Spend 15-20 minutes reviewing these topics with practical examples.

2. **Practice with Real Scenarios**: Apply your knowledge by analyzing real market data or case studies related to weak areas.

3. **Use Multiple Learning Resources**: Watch the recommended videos again, especially sections covering topics you found challenging.

4. **Take Notes**: Create summary notes for ${quizData.weakTopics.length} weak areas to reinforce learning through active recall.

5. **Retake the Quiz**: After reviewing, attempt the post-quiz again to track your progress and build confidence.

## 💪 Motivational Message
${improvement > 0 
  ? `Great progress! Your ${improvement}% improvement shows dedication to learning. Keep building on this momentum!` 
  : `You're on the right track! Consistency in learning is key. Focus on the improvement areas and you'll see great results.`}

Remember: Every expert was once a beginner. Keep learning, stay curious, and don't hesitate to revisit topics as many times as needed! 🚀
`;
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