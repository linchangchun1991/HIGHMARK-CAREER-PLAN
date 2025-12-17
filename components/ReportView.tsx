
import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { AnalysisResult, StudentProfile, ProductItem, GapAnalysisItem } from '../types';
import RadarChartComponent from './RadarChartComponent';
import { 
  GraduationCap, TrendingUp, Target, CheckCircle2, Download, 
  Zap, MonitorCheck, Calculator, Rocket, Gem, Lightbulb, Map, 
  Loader2, ShoppingBag, Gift, Check, AlertCircle, BarChart3, XCircle, ArrowRight, AlertTriangle, ShieldCheck, Tag, BrainCircuit, User
} from 'lucide-react';
import { DEFAULT_PRODUCTS } from '../constants';

interface ReportViewProps {
  profile: StudentProfile;
  analysis: AnalysisResult;
}

const ReportView: React.FC<ReportViewProps> = ({ profile, analysis }) => {
  const [editableAnalysis, setEditableAnalysis] = useState<AnalysisResult>(analysis);
  const [products, setProducts] = useState<ProductItem[]>(DEFAULT_PRODUCTS);
  const [isExporting, setIsExporting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditableAnalysis(prev => ({
        ...prev,
        timeline: analysis.timeline && analysis.timeline.length > 0 ? analysis.timeline : prev.timeline,
        similarSuccessStories: analysis.similarSuccessStories && analysis.similarSuccessStories.length > 0 ? analysis.similarSuccessStories : prev.similarSuccessStories,
        gapAnalysis: analysis.gapAnalysis && analysis.gapAnalysis.length > 0 ? analysis.gapAnalysis : prev.gapAnalysis,
        radarChart: analysis.radarChart && analysis.radarChart.length > 0 ? analysis.radarChart : prev.radarChart,
        atsScore: analysis.atsScore || prev.atsScore,
        verdict: analysis.verdict?.title ? analysis.verdict : prev.verdict,
        resumeAnalysis: analysis.resumeAnalysis?.highlights ? analysis.resumeAnalysis : prev.resumeAnalysis,
        financialAnalysis: analysis.financialAnalysis?.highmarkSalaryVal ? analysis.financialAnalysis : prev.financialAnalysis,
        suggestedPlanName: analysis.suggestedPlanName || prev.suggestedPlanName
    }));
  }, [analysis]);

  // Pricing Logic
  const selectedProducts = products.filter(p => p.selected);
  const finalPrice = selectedProducts.reduce((sum, p) => sum + (p.originalPrice || p.price), 0);
  
  // Clean text helper (removes markdown bolding)
  const cleanText = (text: string) => {
      if(!text) return "";
      return text.replace(/\*\*/g, '').replace(/\*/g, '•'); // Replace stars with bullets if needed
  };

  const displayTimeline = (editableAnalysis.timeline && editableAnalysis.timeline.length > 0) 
    ? editableAnalysis.timeline 
    : [];

  // Components
  const EditableText = ({ 
    value, onChange, className, multiline = false 
  }: { value: string | number, onChange: (val: string) => void, className?: string, multiline?: boolean }) => {
    if (!isEditMode) return <span className={className}>{value}</span>;
    if (multiline) {
        return <textarea value={value} onChange={(e) => onChange(e.target.value)} className={`border border-blue-400 bg-blue-50 p-1 rounded w-full ${className}`} rows={4}/>;
    }
    return <input type={typeof value === 'number' ? 'number' : 'text'} value={value} onChange={(e) => onChange(e.target.value)} className={`border border-blue-400 bg-blue-50 px-1 rounded ${className}`} />;
  };

  const atsRating = (score: number) => {
    if (score < 60) return { label: 'High Risk (高风险)', color: 'text-red-700 bg-red-50 border-red-200', icon: <AlertTriangle size={24} className="text-red-700" /> };
    if (score < 80) return { label: 'Moderate (需优化)', color: 'text-amber-800 bg-amber-50 border-amber-200', icon: <AlertCircle size={24} className="text-amber-600" /> };
    return { label: 'Competitive (有竞争力)', color: 'text-emerald-800 bg-emerald-50 border-emerald-200', icon: <CheckCircle2 size={24} className="text-emerald-600" /> };
  };

  const currentAts = atsRating(editableAnalysis.atsScore);

  const handleExportImage = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    setIsEditMode(false);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1200,
      });

      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement('a');
      link.download = `HighMark_Report_${profile.name}.png`;
      link.href = image;
      link.click();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const updateNestedAnalysis = (section: keyof AnalysisResult, index: number, field: string, value: any) => {
    setEditableAnalysis(prev => {
      const list = [...(prev[section] as any[])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, [section]: list };
    });
  };

  const updateProduct = (id: string, field: keyof ProductItem, value: any) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  // 3-Year Career Value Calc
  const diySal = editableAnalysis.financialAnalysis?.diySalaryVal || 9;
  const hmSal = editableAnalysis.financialAnalysis?.highmarkSalaryVal || 22;
  const careerValue = Math.floor((hmSal - diySal) * 3);

  return (
    <div className="w-full max-w-5xl mx-auto mb-10 font-sans">
      {/* Consultant Toolbar */}
      <div className="flex justify-between items-center bg-slate-800 text-white p-4 rounded-lg mb-6 shadow-lg no-print sticky top-20 z-40">
        <div className="flex items-center gap-3">
            <span className="font-bold text-sm uppercase tracking-wider text-highmark-gold">Consultant Mode</span>
            <div className="h-6 w-px bg-slate-600"></div>
            <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                <input type="checkbox" checked={isEditMode} onChange={() => setIsEditMode(!isEditMode)} className="accent-highmark-gold"/>
                <span className="text-sm">启用编辑</span>
            </label>
        </div>
        <button onClick={handleExportImage} disabled={isExporting} className="bg-highmark-gold text-slate-900 px-4 py-2 rounded font-bold hover:bg-white flex items-center gap-2">
            {isExporting ? '生成中...' : <><Download size={16} /> 导出高清报告</>}
        </button>
      </div>

      {/* REPORT CANVAS */}
      <div ref={reportRef} className="bg-white shadow-2xl overflow-hidden w-full relative text-slate-900 pb-12">
        
        {/* HEADER */}
        <div className="bg-[#0f172a] text-white p-12 relative overflow-hidden">
          <div className="relative z-10">
              <div className="flex items-center gap-2 text-highmark-gold mb-4 uppercase tracking-[0.2em] text-[10px] font-bold">
                 <Gem size={14} /> HighMark Career Planning System
              </div>
              <h1 className="text-5xl font-serif font-bold mb-6 leading-tight">
                 <EditableText value={editableAnalysis.suggestedPlanName || `${profile.name} · 职业规划发展报告`} onChange={(v) => setEditableAnalysis({...editableAnalysis, suggestedPlanName: v})} />
              </h1>
              <div className="flex items-center flex-wrap gap-6 text-slate-300 text-base font-medium">
                 <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded border border-slate-700">
                    <GraduationCap size={18} className="text-white" /> 
                    <span>{String(profile.university || '').replace(/[\+,\/]/g, ' | ')} ({profile.graduationYear})</span>
                 </div>
                 <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded border border-slate-700">
                    <Target size={18} className="text-highmark-gold" />
                    <span>目标：</span>
                    <EditableText value={profile.targetRole || "互联网核心岗"} onChange={()=>{}} />
                 </div>
              </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-highmark-gold opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        </div>

        <div className="px-12 py-12">

          {/* 1. IDENTITY DECODING & RESUME ANALYSIS */}
          <section className="mb-16">
             <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-highmark-900 text-white rounded-lg"><MonitorCheck size={20} /></div>
                <h3 className="text-2xl font-bold text-slate-900">职业基因解码 (Identity Decoding)</h3>
             </div>
            
             <div className="grid md:grid-cols-12 gap-8">
                 {/* Left Column: ATS & Verdict */}
                 <div className="md:col-span-7 space-y-6">
                     {/* ATS Score */}
                     <div className={`p-5 rounded-xl border flex items-center justify-between ${currentAts.color} shadow-sm transition-colors`}>
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-white/60 rounded-full shadow-sm">
                                {currentAts.icon}
                            </div>
                            <div>
                                <div className="text-xs font-bold uppercase opacity-70 tracking-wider mb-1">ATS 简历评分系统 (Moka/Beisen)</div>
                                <div className="text-xl font-bold flex items-center gap-2">
                                    {currentAts.label}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <div className="text-4xl font-serif font-bold">
                                <EditableText value={editableAnalysis.atsScore} onChange={(v) => setEditableAnalysis({...editableAnalysis, atsScore: Number(v)})} />
                            </div>
                            <span className="text-sm opacity-60 font-bold">/ 100</span>
                        </div>
                     </div>

                     {/* Verdict / Core Analysis */}
                     <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-3 text-highmark-900 font-bold">
                            <Lightbulb size={18} className="text-highmark-gold" />
                            <EditableText value={editableAnalysis.verdict?.title || "发展潜力评估"} onChange={(v) => setEditableAnalysis(prev => ({...prev, verdict: {...prev.verdict, title: v}}))} />
                        </div>
                        <div className="text-slate-700 leading-relaxed text-justify mb-4 whitespace-pre-line pl-1">
                             <EditableText multiline value={cleanText(editableAnalysis.verdict?.content || "")} onChange={(v) => setEditableAnalysis(prev => ({...prev, verdict: {...prev.verdict, content: v}}))} />
                        </div>
                     </div>

                     {/* Smart Prediction */}
                     {editableAnalysis.resumeAnalysis?.smartPrediction && (
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                              <div className="flex items-center gap-2 text-blue-800 text-xs font-bold uppercase mb-1">
                                 <BrainCircuit size={14} /> 智能预测 · 市场薪资
                              </div>
                              <div className="text-xl font-bold text-slate-900">
                                 {editableAnalysis.resumeAnalysis.smartPrediction.marketSalary}
                              </div>
                           </div>
                           <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                              <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase mb-1">
                                 <TrendingUp size={14} /> 智能预测 · 离职风险
                              </div>
                              <div className="text-xl font-bold text-slate-900">
                                 {editableAnalysis.resumeAnalysis.smartPrediction.turnoverRisk}
                              </div>
                           </div>
                        </div>
                     )}
                 </div>

                 {/* Right Column: Radar Chart */}
                 <div className="md:col-span-5 flex flex-col gap-6">
                     <div className="bg-white rounded-2xl shadow-card p-4 border border-slate-100 flex-grow flex flex-col justify-center min-h-[300px]">
                         <div className="text-center mb-4">
                             <div className="inline-block px-4 py-1 bg-slate-50 rounded-full">
                                <span className="text-xs font-bold text-slate-400 uppercase mr-4">■ Before HM</span>
                                <span className="text-xs font-bold text-highmark-gold uppercase">■ After HM</span>
                             </div>
                         </div>
                         <RadarChartComponent data={editableAnalysis.radarChart || []} />
                     </div>
                 </div>
             </div>

             {/* RESUME HIGHLIGHTS & TAGS (Full Width) */}
             <div className="mt-8 grid md:grid-cols-2 gap-8">
                {/* Highlights */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                   <div className="flex items-center gap-2 mb-4">
                      <Zap size={20} className="text-highmark-gold" />
                      <h4 className="font-bold text-slate-900">简历亮点 (Highlights)</h4>
                   </div>
                   <ul className="space-y-3">
                      {(editableAnalysis.resumeAnalysis?.highlights || []).slice(0, 5).map((highlight, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                             <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                             <span>{cleanText(highlight)}</span>
                          </li>
                      ))}
                   </ul>
                </div>

                {/* Tag Cloud */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                   <div className="flex items-center gap-2 mb-4">
                      <Tag size={20} className="text-blue-500" />
                      <h4 className="font-bold text-slate-900">候选人画像标签 (Tags)</h4>
                   </div>
                   <div className="space-y-4">
                      {editableAnalysis.resumeAnalysis?.tags && (
                         <>
                            <div>
                               <span className="text-xs font-bold text-slate-400 block mb-2">基本/教育</span>
                               <div className="flex flex-wrap gap-2">
                                  {[...(editableAnalysis.resumeAnalysis.tags.basic || []), ...(editableAnalysis.resumeAnalysis.tags.education || [])].map((tag, i) => (
                                     <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded border border-slate-200">{tag}</span>
                                  ))}
                               </div>
                            </div>
                            <div>
                               <span className="text-xs font-bold text-slate-400 block mb-2">职业/技能</span>
                               <div className="flex flex-wrap gap-2">
                                  {[...(editableAnalysis.resumeAnalysis.tags.career || []), ...(editableAnalysis.resumeAnalysis.tags.skills || [])].map((tag, i) => (
                                     <span key={i} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded border border-blue-100">{tag}</span>
                                  ))}
                               </div>
                            </div>
                         </>
                      )}
                   </div>
                </div>
             </div>
          </section>

          {/* 2. CORE OPPORTUNITIES */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-red-600 text-white rounded-lg"><BarChart3 size={20} /></div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">核心机会点 (Core Opportunity Points)</h3>
                  <p className="text-sm text-slate-500">基于目标岗位画像的能力差距分析</p>
                </div>
            </div>

            <div className="bg-slate-50 border-l-4 border-highmark-gold p-6 rounded-r-lg mb-8">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-white rounded-full text-highmark-gold shadow-sm shrink-0"><Lightbulb size={24} /></div>
                    <div className="flex-1">
                        <h4 className="font-bold text-lg text-slate-900 mb-2">海马职加求职大数据研究院分析</h4>
                        <p className="text-slate-700 leading-relaxed text-lg font-medium text-justify">
                           <EditableText multiline value={editableAnalysis.verdict?.gapSummary || "根据简历与目标岗位JD的文本向量匹配分析，目前存在核心关键词缺失，建议进行针对性背景提升。"} onChange={(v) => setEditableAnalysis(prev => ({...prev, verdict: {...prev.verdict, gapSummary: v}}))} />
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {(editableAnalysis.gapAnalysis || []).map((item, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-bold text-slate-800 text-lg">
                                <EditableText value={item.skill} onChange={(v) => updateNestedAnalysis('gapAnalysis', idx, 'skill', v)} />
                            </span>
                            <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold flex items-center">
                                <TrendingUp size={12} className="mr-1"/>
                                +{(item.targetScore - item.currentScore)}%
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1 font-semibold">
                           <span>Current</span>
                           <span className="text-highmark-gold">Target</span>
                        </div>
                        <div className="relative h-6 bg-slate-100 rounded-full overflow-hidden mb-4">
                            <div className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10 opacity-50" style={{left: `${item.targetScore}%`}}></div>
                            <div className="absolute top-0 left-0 h-full bg-slate-500" style={{width: `${item.currentScore}%`}}></div>
                            <div className="absolute top-0 h-full bg-gradient-to-r from-yellow-400 to-highmark-gold opacity-80" style={{left: `${item.currentScore}%`, width: `${item.targetScore - item.currentScore}%`}}></div>
                        </div>
                        <div className="flex justify-between text-xs mb-3">
                             <span className="font-bold text-slate-800 text-lg">{item.currentScore}</span>
                             <span className="font-bold text-slate-400 text-lg">{item.targetScore}</span>
                        </div>
                        <p className={`text-xs p-3 rounded-lg flex items-start gap-2 leading-relaxed bg-slate-50 text-slate-600`}>
                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                            <EditableText value={item.description} onChange={(v) => updateNestedAnalysis('gapAnalysis', idx, 'description', v)} />
                        </p>
                    </div>
                ))}
            </div>
          </section>

          {/* 3. ROADMAP */}
          <section className="mb-16">
             <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-blue-600 text-white rounded-lg"><Map size={20} /></div>
                <h3 className="text-2xl font-bold text-slate-900">12个月通关路径 (Roadmap)</h3>
             </div>

             <div className="space-y-6">
                 {displayTimeline.map((phase, idx) => (
                     <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                         <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                             <div>
                                 <h4 className="font-bold text-lg text-slate-900">
                                    <EditableText value={phase.phase} onChange={(v) => updateNestedAnalysis('timeline', idx, 'phase', v)} />
                                 </h4>
                                 <span className="text-sm text-slate-500 font-medium">
                                    <EditableText value={phase.time} onChange={(v) => updateNestedAnalysis('timeline', idx, 'time', v)} />
                                 </span>
                             </div>
                             <div className="hidden md:block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                                STEP {idx + 1}
                             </div>
                         </div>
                         <div className="grid md:grid-cols-2">
                             <div className="p-6 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
                                 <div className="flex items-center gap-2 mb-4 text-slate-500">
                                     <XCircle size={16} />
                                     <span className="text-xs font-bold uppercase tracking-wider">Before Signup (风险点)</span>
                                 </div>
                                 <ul className="space-y-3">
                                     {(phase.diyRisks || []).slice(0,3).map((risk, rIdx) => (
                                         <li key={rIdx} className="flex items-start gap-2 text-sm text-slate-600">
                                             <span className="text-slate-400 mt-1">•</span>
                                             {cleanText(risk)}
                                         </li>
                                     ))}
                                 </ul>
                             </div>
                             <div className="p-6 bg-white relative overflow-hidden">
                                 <div className="flex items-center gap-2 mb-4 text-highmark-gold">
                                     <CheckCircle2 size={16} />
                                     <span className="text-xs font-bold uppercase tracking-wider">After Signup (解决方案)</span>
                                 </div>
                                 <ul className="space-y-3 relative z-10">
                                     {(phase.hmSolutions || []).slice(0,3).map((sol, sIdx) => (
                                         <li key={sIdx} className="flex items-start gap-2 text-sm font-medium text-slate-800">
                                             <Check size={14} className="text-green-500 mt-0.5 shrink-0" />
                                             {cleanText(sol)}
                                         </li>
                                     ))}
                                 </ul>
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
          </section>

          {/* 4. ROI (FIXED LAYOUT) */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-green-600 text-white rounded-lg"><Calculator size={20} /></div>
                <h3 className="text-2xl font-bold text-slate-900">投资回报测算 (ROI)</h3>
             </div>

            {/* Added gap-8 and removed absolute positioning for labels to prevent overlap */}
            <div className="bg-slate-900 text-white rounded-2xl p-8 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 w-full flex justify-around items-end h-56 pt-8">
                    {/* DIY BAR */}
                    <div className="flex flex-col items-center justify-end h-full w-1/3 group">
                        <div className="text-xl font-bold text-slate-400 mb-2">
                             <EditableText value={diySal} onChange={(v) => setEditableAnalysis(prev => ({...prev, financialAnalysis: {...prev.financialAnalysis, diySalaryVal: Number(v)}}))} />w
                        </div>
                        <div className="w-16 bg-slate-600 rounded-t transition-all group-hover:bg-slate-500" style={{height: `${(diySal/30)*100}%`}}></div>
                        <div className="text-slate-400 text-xs uppercase mt-3 font-bold">DIY (起薪)</div>
                    </div>
                    
                    {/* GAP AREA */}
                    <div className="flex flex-col items-center justify-end h-full w-1/3 px-2 pb-8">
                        <div className="text-slate-500 text-[10px] font-bold bg-slate-800 px-2 py-1 rounded mb-2 border border-slate-700 whitespace-nowrap">
                            潜在踏空成本: ¥{((hmSal - diySal) * 1).toFixed(0)}w/年
                        </div>
                        <div className="h-px w-full border-t-2 border-dashed border-slate-600/50"></div>
                    </div>

                    {/* HM BAR */}
                    <div className="flex flex-col items-center justify-end h-full w-1/3">
                        <div className="text-2xl font-bold text-white mb-2">
                            <EditableText value={hmSal} onChange={(v) => setEditableAnalysis(prev => ({...prev, financialAnalysis: {...prev.financialAnalysis, highmarkSalaryVal: Number(v)}}))} />w
                        </div>
                        <div className="w-16 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t shadow-[0_0_20px_rgba(234,179,8,0.3)]" style={{height: `${(hmSal/30)*100}%`}}></div>
                        <div className="text-highmark-gold text-xs uppercase mt-3 font-bold">HM (规划后)</div>
                    </div>
                </div>

                <div className="flex-1 w-full border-l border-slate-700 pl-8">
                    <h4 className="text-lg font-serif font-bold text-white mb-4">数据分析结论</h4>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-slate-400 text-sm">首年年薪增幅</span>
                            <span className="text-green-400 font-bold">+{(hmSal - diySal).toFixed(1)}w / 年</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                             <span className="text-slate-300 text-sm font-bold">3年职业价值累计</span>
                             <span className="text-highmark-gold font-bold text-xl">¥{careerValue}w+</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 italic pt-2">
                            *数据基于海马职加往届学员平均薪资涨幅估算，仅供参考。
                        </p>
                    </div>
                </div>
            </div>
          </section>

          {/* 5. SOLUTION PACKAGE */}
          <section className="bg-slate-50 p-8 md:p-12 rounded-3xl border border-slate-200">
             <div className="text-center mb-10">
                 <h3 className="text-3xl font-serif font-bold text-slate-900 mb-2">HighMark 全案解决方案</h3>
                 <p className="text-slate-500">All-in-One Exclusive Offer</p>
             </div>

             <div className="space-y-4 mb-8">
                 {products.filter(p => !p.isBonus).map((product) => (
                     <div key={product.id} className="bg-white p-6 rounded-xl border-l-4 border-highmark-gold shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                         <div className="flex-1">
                             <div className="flex items-center gap-2 mb-1">
                                <ShoppingBag size={16} className="text-highmark-900" />
                                <h4 className="font-bold text-lg text-slate-900">
                                    <EditableText value={product.name} onChange={(v) => updateProduct(product.id, 'name', v)} />
                                </h4>
                             </div>
                             <p className="text-sm text-slate-500 ml-6">
                                <EditableText value={product.description} onChange={(v) => updateProduct(product.id, 'description', v)} />
                             </p>
                         </div>
                         <div className="font-bold text-xl text-slate-900">
                             ¥<EditableText value={product.price} onChange={(v) => updateProduct(product.id, 'price', Number(v))} />
                         </div>
                     </div>
                 ))}

                 <div className="mt-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Gift size={20} className="text-red-500" />
                        <span className="font-bold text-slate-800 text-lg">今日签约赠送 (Bonus)</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        {products.filter(p => p.isBonus).map((product) => (
                            <div key={product.id} className="bg-white border-2 border-red-50 p-4 rounded-xl flex justify-between items-center shadow-sm relative overflow-hidden group">
                                <div className="relative z-10 w-full">
                                    <div className="font-bold text-slate-800 text-sm mb-1">
                                        <EditableText value={product.name} onChange={(v) => updateProduct(product.id, 'name', v)} />
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        <EditableText value={product.description} onChange={(v) => updateProduct(product.id, 'description', v)} />
                                    </div>
                                </div>
                                <span className="bg-red-500 text-white text-xs font-black px-2 py-1 rounded shadow-md absolute top-2 right-2">
                                    FREE
                                </span>
                            </div>
                        ))}
                    </div>
                 </div>
             </div>

             {/* PRICING & CTA (Final Comprehensive Plan) */}
             <div className="bg-slate-900 text-white rounded-xl p-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-highmark-gold opacity-10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                 
                 <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                     <div className="text-center md:text-left space-y-3 flex-1">
                         <div className="flex items-center justify-center md:justify-start gap-2 text-highmark-gold font-bold text-lg mb-2">
                             <ShieldCheck size={20} />
                             海马职加综合方案
                         </div>
                         
                         <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-300">
                             <div className="flex items-center gap-2"><Check size={14} className="text-green-400"/> 名企大厂导师全程指导</div>
                             <div className="flex items-center gap-2"><Check size={14} className="text-green-400"/> 求职教练全程陪跑</div>
                             <div className="flex items-center gap-2"><Check size={14} className="text-green-400"/> 职业背景提升指导</div>
                             <div className="flex items-center gap-2"><Check size={14} className="text-green-400"/> 独家内推直推资源</div>
                         </div>
                     </div>
                     
                     <div className="flex flex-col items-end">
                         <div className="text-slate-400 text-sm mb-1 line-through">原价: ¥{finalPrice.toLocaleString()}</div>
                         <div className="flex items-end gap-2">
                             <span className="text-2xl font-serif text-slate-500 pb-2">¥</span>
                             <span className="text-7xl font-serif font-black text-highmark-gold leading-none tracking-tight">
                                 {finalPrice.toLocaleString()}
                             </span>
                         </div>
                     </div>
                 </div>
             </div>
          </section>

          {/* Slogan */}
          <div className="text-center py-12 px-4">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-2">
                "让才华各得其所，让未来有迹可循"
            </h2>
            <p className="text-slate-500 text-lg">扶稳留学生，走好职场第一步</p>
          </div>

        </div>

        <div className="bg-slate-50 py-6 text-center text-xs text-slate-400 uppercase tracking-widest border-t border-slate-100">
            HighMark Career · Internal Use Only · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default ReportView;
