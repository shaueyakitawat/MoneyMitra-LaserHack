// Import all module data
import module1 from './module-1-basics.json';
import module2 from './module-2-stock-market.json';
import module3 from './module-3-technical-analysis.json';
import module4 from './module-4-fundamental-analysis.json';
import module5 from './module-5-mutual-funds-etfs.json';
import module6 from './module-6-portfolio-management.json';
import module7 from './module-7-options-derivatives.json';
import module8 from './module-8-risk-management.json';
import module9 from './module-9-taxation-regulations.json';
import module10 from './module-10-building-wealth.json';

// Export all modules as array
// Note: Each module JSON is an array with one object, so we extract the first element
export const learningModules = [
  Array.isArray(module1) ? module1[0] : module1,
  Array.isArray(module2) ? module2[0] : module2,
  Array.isArray(module3) ? module3[0] : module3,
  Array.isArray(module4) ? module4[0] : module4,
  Array.isArray(module5) ? module5[0] : module5,
  Array.isArray(module6) ? module6[0] : module6,
  Array.isArray(module7) ? module7[0] : module7,
  Array.isArray(module8) ? module8[0] : module8,
  Array.isArray(module9) ? module9[0] : module9,
  Array.isArray(module10) ? module10[0] : module10,
].filter(Boolean);

export default learningModules;
