
import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { Upload, ArrowRight, Sparkles, CheckCircle2, Loader2, FileText, AlertCircle } from 'lucide-react';
import { parseResume } from '../services/geminiService';

interface InputFormProps {
  apiKey: string;
  onSubmit: (profile: StudentProfile) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ apiKey, onSubmit, isLoading }) => {
  const [isParsing, setIsParsing] = useState(false);
  const [parseStatus, setParseStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [formData, setFormData] = useState<StudentProfile>({
    name: '',
    university: '',
    major: '',
    graduationYear: '',
    targetCity: '上海/北京',
    targetIndustry: '',
    targetRole: '',
    targetTier: 'Tier 1',
    resumeText: '',
    additionalNotes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setParseStatus('idle');

    try {
      const extractedData = await parseResume(apiKey, file);
      
      const safeStr = (val: any) => {
        if (!val) return '';
        if (Array.isArray(val)) return val.join(' + ');
        return String(val);
      };

      if (!extractedData.name && !extractedData.resumeText) {
          throw new Error("No data extracted");
      }

      setFormData(prev => ({
        ...prev,
        name: safeStr(extractedData.name) || prev.name,
        university: safeStr(extractedData.university) || prev.university,
        major: safeStr(extractedData.major) || prev.major,
        graduationYear: safeStr(extractedData.graduationYear) || prev.graduationYear,
        resumeText: safeStr(extractedData.resumeText) || prev.resumeText,
      }));
      setParseStatus('success');
    } catch (error) {
      console.error(error);
      setParseStatus('error');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl bg-white p-12 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
        <div className="relative mb-6">
            <div className="absolute inset-0 bg-highmark-gold opacity-20 rounded-full animate-ping"></div>
            <Loader2 className="w-16 h-16 text-highmark-gold animate-spin relative z-10" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">
            正在生成全案报告...
        </h2>
        <p className="text-slate-500">AI 正在进行 ATS 简历诊断与职业差距分析</p>
        <div className="mt-4 flex gap-2 text-xs text-slate-400">
            <span>数据计算</span>
            <span>•</span>
            <span>岗位匹配</span>
            <span>•</span>
            <span>薪资测算</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-slate-900 p-8 text-white relative">
        <div className="flex justify-between items-start relative z-10">
            <div>
                <h2 className="text-2xl font-serif font-bold mb-2">开启 AI 职业战略咨询</h2>
                <p className="text-slate-300 text-sm">基于2026校招大数据系统 (支持 PDF/图片)</p>
            </div>
            <Sparkles className="text-highmark-gold" size={32} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8">
        <div className="mb-10">
           <label className="block text-sm font-bold text-slate-800 mb-3">第一步：上传学员简历</label>
           <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all overflow-hidden group 
                ${parseStatus === 'success' ? 'border-green-500 bg-green-50/30' : 
                  parseStatus === 'error' ? 'border-red-300 bg-red-50/30' :
                  'border-slate-300 hover:border-highmark-500 hover:bg-slate-50'}`}>
              
              <input 
                type="file" 
                accept="application/pdf,image/*"
                onChange={handleFileUpload} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={isParsing}
              />
              
              {isParsing ? (
                  <div className="flex flex-col items-center">
                      <Loader2 className="animate-spin text-highmark-500 mb-2" size={32} />
                      <span className="font-medium text-highmark-500">正在智能提取 (PDF/OCR)...</span>
                  </div>
              ) : parseStatus === 'success' ? (
                  <div className="flex flex-col items-center text-green-700">
                      <CheckCircle2 className="mb-2" size={32} />
                      <span className="font-bold text-lg">解析完成</span>
                      <p className="text-xs text-green-600 mt-1">关键信息已自动填充，请核对下方内容</p>
                  </div>
              ) : parseStatus === 'error' ? (
                  <div className="flex flex-col items-center text-red-600">
                      <AlertCircle className="mb-2" size={32} />
                      <span className="font-bold text-lg">自动解析未成功</span>
                      <p className="text-xs text-red-500 mt-1">请尝试重新上传，或直接在下方手动填写</p>
                  </div>
              ) : (
                  <div className="flex flex-col items-center text-slate-500 group-hover:text-highmark-600 transition-colors">
                      <div className="w-12 h-12 bg-slate-100 group-hover:bg-highmark-50 text-slate-600 group-hover:text-highmark-500 rounded-full flex items-center justify-center mb-3 transition-colors">
                          <Upload size={20} />
                      </div>
                      <span className="font-medium text-slate-700">点击上传 PDF 或 图片</span>
                      <p className="text-xs text-slate-400 mt-2">支持 PDF, JPG, PNG (最大 10MB)</p>
                  </div>
              )}
           </div>
        </div>

        <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-800 mb-4 border-l-4 border-highmark-gold pl-3">学员核心背景</h3>
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">姓名 <span className="text-red-500">*</span></label>
                <input required name="name" value={formData.name} onChange={handleChange} className="form-input" placeholder="请输入姓名" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">毕业年份 <span className="text-red-500">*</span></label>
                <input required name="graduationYear" value={formData.graduationYear} onChange={handleChange} className="form-input" placeholder="例如：2025" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">毕业院校 <span className="text-red-500">*</span></label>
                <input required name="university" value={formData.university} onChange={handleChange} className="form-input" placeholder="请输入院校" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">所学专业 <span className="text-red-500">*</span></label>
                <input required name="major" value={formData.major} onChange={handleChange} className="form-input" placeholder="请输入专业" />
              </div>
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">简历详情 / 经历摘要 <span className="text-red-500">*</span></label>
                <textarea 
                    required 
                    name="resumeText" 
                    value={formData.resumeText} 
                    onChange={handleChange} 
                    className="form-input min-h-[100px]" 
                    placeholder="若解析失败，请在此处粘贴简历内容..." 
                />
            </div>
        </div>

        <div className="mb-8">
             <h3 className="text-sm font-bold text-slate-800 mb-4 border-l-4 border-highmark-gold pl-3">求职战略目标</h3>
             
             <div className="grid grid-cols-2 gap-6 mb-4">
                 <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">目标城市</label>
                    <input name="targetCity" value={formData.targetCity} onChange={handleChange} className="form-input" />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">期望梯队</label>
                    <select name="targetTier" value={formData.targetTier} onChange={handleChange} className="form-input">
                        <option value="Tier 1">Tier 1 - 顶尖互联网/金融/咨询/国央企</option>
                        <option value="Tier 2">Tier 2 - 上市公司/地方国央企/大厂</option>
                        <option value="Tier 3">Tier 3 - 独角兽或高估值公司</option>
                    </select>
                 </div>
             </div>

             <div className="grid grid-cols-2 gap-6">
                 <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">主攻赛道</label>
                    <input name="targetIndustry" value={formData.targetIndustry} onChange={handleChange} className="form-input" placeholder="例如：互联网/金融" />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">目标岗位</label>
                    <input name="targetRole" value={formData.targetRole} onChange={handleChange} className="form-input" placeholder="例如：算法工程师/商分" />
                 </div>
             </div>
        </div>

        <button
            type="submit"
            disabled={isParsing || !formData.name || !formData.resumeText}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] ${
                (!formData.name || !formData.resumeText) 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-highmark-500 hover:bg-highmark-600 text-white hover:shadow-2xl'
            }`}
        >
            {isParsing ? '请等待解析完成...' : '生成职业规划报告'} <ArrowRight size={20} />
        </button>
      </form>
      <style jsx>{`
        .form-input {
            @apply w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-highmark-500 focus:border-transparent outline-none transition-all text-sm text-slate-900 font-medium;
        }
      `}</style>
    </div>
  );
};

export default InputForm;