
import React, { useState } from 'react';
import Layout from './components/Layout';
import InputForm from './components/InputForm';
import ReportView from './components/ReportView';
import ApiKeyModal from './components/ApiKeyModal';
import { StudentProfile, AnalysisResult } from './types';
import { generateCoreIdentity, generateVisualAnalysis, generateRoadmap } from './services/geminiService';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [step, setStep] = useState<'input' | 'report'>('input');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleFormSubmit = async (data: StudentProfile) => {
    if (!apiKey) return;
    setLoading(true);
    setProfile(data);

    // Initial Empty State
    const initialAnalysis: AnalysisResult = {
        atsScore: 0,
        verdict: { title: '生成中...', content: 'AI 正在深度分析背景...', tags: [], gapSummary: '正在对比大厂模型...' },
        radarChart: [],
        gapAnalysis: [],
        financialAnalysis: { diySalaryVal: 14, highmarkSalaryVal: 22, investmentCost: 0, recoupPeriod: '' },
        suggestedPlanName: 'AI 职业规划报告生成中...',
        timeline: [],
        companyList: [],
        similarSuccessStories: []
    };
    setAnalysis(initialAnalysis);

    try {
      // 1. Fire all requests in parallel with API Key
      const corePromise = generateCoreIdentity(apiKey, data);
      const visualsPromise = generateVisualAnalysis(apiKey, data);
      const roadmapPromise = generateRoadmap(apiKey, data);

      // 2. Await Core (Fastest) -> Render UI Immediately
      const coreResult = await corePromise;
      setAnalysis(prev => ({
          ...prev!,
          ...coreResult,
          // Ensure defaults if AI fails
          atsScore: coreResult.atsScore || 65,
          suggestedPlanName: coreResult.suggestedPlanName || `${data.name}_${data.university}_专属职业规划报告`
      }));
      
      setStep('report');
      setLoading(false); 

      // 3. Update Visuals when ready
      visualsPromise.then(visualResult => {
          setAnalysis(prev => {
             if(!prev) return null;
             return { ...prev, ...visualResult };
          });
      });

      // 4. Update Roadmap when ready
      roadmapPromise.then(roadmapResult => {
          setAnalysis(prev => {
             if(!prev) return null;
             return { ...prev, ...roadmapResult };
          });
      });

    } catch (error) {
      alert("生成报告时出错: " + (error as Error).message);
      setLoading(false);
    }
  };

  return (
    <Layout>
      {!apiKey && <ApiKeyModal onSubmit={setApiKey} />}
      
      <div className="w-full max-w-7xl px-4 py-8 flex flex-col items-center">
        {step === 'input' && (
          <>
            <div className="text-center mb-10 no-print">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-highmark-900 mb-4">
                HIGHMARK CAREER ARCHITECT
              </h1>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                海马职加·首席AI职业规划系统
                <br/>
                <span className="text-sm opacity-80">上传简历，即刻生成 MBB 级职业发展全案报告</span>
              </p>
            </div>
            <InputForm apiKey={apiKey} onSubmit={handleFormSubmit} isLoading={loading} />
          </>
        )}

        {step === 'report' && profile && analysis && (
          <div className="w-full flex flex-col items-center">
             <div className="w-full max-w-5xl flex justify-start mb-4 no-print">
                <button 
                  onClick={() => setStep('input')}
                  className="text-sm text-slate-500 hover:text-highmark-500 underline flex items-center gap-1"
                >
                  ← 发起新的咨询
                </button>
             </div>
            <ReportView profile={profile} analysis={analysis} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;