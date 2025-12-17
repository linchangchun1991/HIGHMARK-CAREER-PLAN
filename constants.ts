
import { ProductItem } from './types';

export const API_KEY_V2 = "AIzaSyAh0aV0Dotra2iOD_B0jW_NWMjimz-udo0";
export const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com"; 

// Optimized "Professional Consulting" Product List
export const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    id: 'p1',
    name: 'HighMark 旗舰·千里马全案',
    price: 69800,
    originalPrice: 88000,
    description: '名企大厂导师 1v1 结果负责制',
    features: ['无限次内推机会', '岗位定制规划', '求职教练全程陪跑', '名企导师 1v1 辅导', '模拟面试 & 复盘'],
    selected: true,
    isBonus: false,
  },
  {
    id: 'p2',
    name: '【背景提升】名企核心项目履历重塑',
    price: 18000,
    originalPrice: 25000,
    description: '补齐“数据思维”与“大厂背书”，弥补学历或经历短板',
    features: ['真实大厂数据项目', 'Tableau/SQL 实战', '导师推荐信', '弥补简历空白'],
    selected: true,
    isBonus: false,
  },
  {
    id: 'p3',
    name: '【赠送】网申代投服务 (100家)',
    price: 0,
    originalPrice: 12800,
    description: '今日签约限时赠送 (Bonus)',
    features: ['人工筛选岗位', '覆盖投递 (100家)', '每日进度报表', '查漏补缺'],
    selected: true,
    isBonus: true,
  },
  {
    id: 'p4',
    name: '【赠送】名企大厂导师1v1课时 (2节)',
    price: 0,
    originalPrice: 6800,
    description: '今日签约限时赠送 (Bonus)',
    features: ['行业通识课', 'OT真题训练', '性格测试解析'],
    selected: true,
    isBonus: true,
  }
];

export const REAL_CASES_DB = [
  {"name": "魏*鸣", "school": "天津外国语+埃克塞特", "major": "翻译/心理学", "offer": "深圳长帆国际物流 (全职)", "tag": "跨专业+双非逆袭"},
  {"name": "张*池", "school": "罗格斯+南洋理工", "major": "供应链管理", "offer": "赛力斯 (新能源供应链)", "tag": "热门赛道"},
  {"name": "陈*祺", "school": "吉林大学+LSE", "major": "外交学/国关", "offer": "厦门国贸 (供应链)", "tag": "文科转商科"},
  {"name": "赖*琛", "school": "宁波诺丁汉", "major": "化工", "offer": "中石化 (补录)", "tag": "GPA劣势逆袭"},
  {"name": "位*帆", "school": "南阳理工+NYU", "major": "商业分析", "offer": "中石油", "tag": "专升本/双非逆袭"},
  {"name": "王*迪", "school": "重庆大学+波士顿大学", "major": "CS", "offer": "商飞 (央企)", "tag": "情绪辅导+多Offer"},
  {"name": "冯*涵", "school": "迈阿密+东北大学", "major": "CS/IS", "offer": "昆仑数智 (社招捡漏)", "tag": "往届生/社招成功"},
  {"name": "L同学", "school": "UCL", "major": "管理学", "offer": "字节跳动 (商业化)", "tag": "G5对标"},
  {"name": "Z同学", "school": "哥伦比亚大学", "major": "金工", "offer": "中信证券 (投行部)", "tag": "藤校对标"}
];

const SHARED_ROLE_DEF = `
Role: Chief Career Architect at HighMark Career.
Tone: Professional, Objective, Analytical.
Language: STRICTLY CHINESE (Simplified).
Methodology: MECE (Mutually Exclusive, Collectively Exhaustive).
Constraint: DO NOT use markdown formatting like **bold** or *italic*. Use plain text.
`;

// 1. FAST CORE: ATS + Verdict + Title + Resume Highlights
export const PROMPT_CORE = `
${SHARED_ROLE_DEF}
# Task 1: Core Competency & Resume Deep Analysis
1.  **Identity**: Address candidate as "{Name}".
2.  **Analysis**: Use MECE principle to list 3-4 bullet points analyzing the resume based on Moka/Beisen ATS.
3.  **Resume Highlights**: Extract 5 key selling points (e.g., Overseas experience, Language, Specific Hard Skills).
4.  **Smart Prediction**:
    - Market Salary: Estimate a range (e.g. 8000-10000元/月).
    - Turnover Risk: Assess probability based on resume stability.
5.  **Tags**: Generate specific tags for:
    - Basic (e.g. "2025届", "硕士")
    - Education (e.g. "QS100", "US News Top 50", "海外留学")
    - Career (e.g. "互联网", "金融", "咨询")
    - Skills (e.g. "Python", "Data Analysis", "Java")

# Output JSON
{
  "atsScore": Number (40-90),
  "verdict": {
    "title": "String (e.g., 'Moka系统综合评分结果')",
    "content": "String (3-4 bullet points. Plain text only. No ** or # symbols.)",
    "gapSummary": "String (One summary sentence)"
  },
  "resumeAnalysis": {
    "highlights": ["String", "String", "String", "String", "String"],
    "smartPrediction": {
      "marketSalary": "String (e.g. '8k-12k')",
      "turnoverRisk": "String (e.g. '中等')"
    },
    "tags": {
      "basic": ["String", "String"],
      "education": ["String", "String"],
      "career": ["String", "String"],
      "skills": ["String", "String", "String", "String"]
    }
  },
  "suggestedPlanName": "String"
}
`;

// 2. VISUALS: Radar + Gap + Financial
export const PROMPT_VISUALS = `
${SHARED_ROLE_DEF}
# Task 2: Visual Data Generation
1.  **Radar Chart**: 
    - Subjects: "学历背景", "实习经历", "实习匹配度", "ATS评分", "技能匹配度", "行业/岗位认知".
    - **CRITICAL**: "学历背景" (Education) CANNOT improve. Current score MUST EQUAL Potential score.
    - Other scores can improve realistically (e.g. 30 -> 85). **DO NOT USE 100**.
2.  **Opportunity Points (Gap Analysis)**: 
    - Identify 3 key areas. Target Score 85-95.
    - Item 3 MUST BE: "简历通过率".
3.  **Financial**: 
    - **DIY Salary**: 8-12 (Realistic).
    - **HighMark Salary**: 18-25 (Realistic).

# Output JSON
{
  "radarData": [
    { "subject": "学历背景", "current": 70, "potential": 70, "fullMark": 100 },
    { "subject": "实习经历", "current": 30, "potential": 90, "fullMark": 100 },
    { "subject": "实习匹配度", "current": 40, "potential": 88, "fullMark": 100 },
    { "subject": "ATS评分", "current": 45, "potential": 92, "fullMark": 100 },
    { "subject": "技能匹配度", "current": 35, "potential": 90, "fullMark": 100 },
    { "subject": "行业/岗位认知", "current": 20, "potential": 85, "fullMark": 100 }
  ],
  "gapAnalysis": [
    { "skill": "数据分析能力", "currentScore": 30, "targetScore": 90, "description": "缺乏实战项目支撑" },
    { "skill": "业务敏锐度", "currentScore": 40, "targetScore": 88, "description": "缺乏商业变现逻辑理解" },
    { "skill": "简历通过率", "currentScore": 20, "targetScore": 90, "description": "Moka系统关键词匹配度低" }
  ],
  "financialAnalysis": {
    "diySalaryVal": Number (8-12),
    "highmarkSalaryVal": Number (20-25)
  }
}
`;

// 3. ROADMAP: Timeline + Companies + Stories
export const PROMPT_ROADMAP = `
${SHARED_ROLE_DEF}
# Task 3: Roadmap & Strategy
1.  **Timeline**: 4 Phases with dates (e.g., 2024.10 - 2024.12).
    - Phase 1: "错位竞争与背景提升".
    - Phase 2: "名企核心项目实战".
    - Phase 3: "全渠道冲刺与面试".
    - Phase 4: "Offer选择与薪资谈判".
2.  **Contrast**: DIY Risks vs HM Solutions.

# Output JSON
{
  "timeline": [
    { 
      "phase": "Phase 1: 错位竞争与背景提升", 
      "time": "2024.03 - 2024.05", 
      "diyRisks": ["简历关键词匹配度低", "实习含金量不足", "投递方向偏差"], 
      "hmSolutions": ["Tier 2 互联网切口策略", "SQL/Python 数据技能补全", "名企核心项目背景提升"] 
    },
    // ... phases 2, 3, 4
  ],
  "companyList": [
    { "category": "Tier 1 (Target)", "companies": ["字节跳动", "腾讯", "小红书"], "description": "String" }
  ],
  "similarSuccessStories": [
    { "name": "String", "background": "String", "difficulty": "String", "offer": "String", "comment": "String" }
  ]
}
`;
