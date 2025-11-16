import { useTranslation } from "react-i18next";

const NewsInsights = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md border border-border p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primaryCobalt to-accentGold flex items-center justify-center">
            <span className="text-2xl">📰</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-ink">News Insights</h1>
            <p className="text-textSecondary mt-1">
              Stay updated with the latest financial news and market analysis
            </p>
          </div>
        </div>

        <div className="border border-border rounded-lg p-8 text-center bg-neutralBg">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primaryCobalt/10 flex items-center justify-center">
              <span className="text-5xl">🚧</span>
            </div>
            <h2 className="text-xl font-semibold text-ink mb-2">Coming Soon</h2>
            <p className="text-textSecondary">
              News Insights will provide you with curated financial news, market
              analysis, and expert commentary to help you make informed
              decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsInsights;
