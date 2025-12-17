
import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { Upload, ArrowRight, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { parseResume } from '../services/geminiService';

interface InputFormProps {
  apiKey: string;
  onSubmit: (profile: StudentProfile) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ apiKey, onSubmit, isLoading }) => {
  const [isParsing, setIsParsing] = useState(false);
  const [parseSuccess, setParseSuccess] = useState(false);
  
  const [formData, setFormData] = useState<StudentProfile>({
    name: '',
    university: '',
    major: '',
    graduationYear: '',
    targetCity: '上海/北京',
    targetIndustry: '',
    targetRole: '',
    targetTier: '',
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
    setParseSuccess(false);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const base64Content = base64Data.split(',')[1];
        
        const extractedData = await parseResume(apiKey, base64Content, file.type);
        
        // Helper to safely extract string values from AI response which might be arrays or non-strings
        const safeStr = (val: any) => {
          if (!val) return '';
          if (Array.isArray(val)) return val.join(' + ');
          return String(val);
        };

        setFormData(prev => ({
          ...prev,
          name: safeStr(extractedData.name) || prev.name,
          university: safeStr(extractedData.university) || prev.university,
          major: safeStr(extractedData.major) || prev.major,
          graduationYear: safeStr(extractedData.graduationYear) || prev.graduationYear,
          resumeText: safeStr(extractedData.resumeText) || prev.resumeText,
        }));
        setIsParsing(false);
        setParseSuccess(true);
      };
    } catch (error) {
      setIsParsing(false);
      alert("简历解析失败，请手动填写或检查 API Key。");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl bg-white p-12 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center text-center">
        <Loader2 className="w-16 h-16 text-highmark-gold animate-spin mb-6" />
        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">
            正在生成全案报告...
        </h2>
        <p className="text-slate-500">AI 正在进行差距分析与薪资测算</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-slate-900 p-8 text-white relative">
        <div className="flex justify-between items-start relative z-10">
            <div>
                <h2 className="text-2xl font-serif font-bold mb-2">开启 AI 职业战略咨询</h2>
                <p className="text-slate-300 text-sm">基于2026校招大数据系统</p>
            </div>
            <Sparkles className="text-highmark-gold" size={32} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8">
        <div className="mb-10">
           <label className="block text-sm font-bold text-slate-800 mb-3">第一步：上传学员简历</label>
           <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all overflow-hidden ${parseSuccess ? 'border-green-500 bg-green-50/30' : 'border-slate-300 hover:border-highmark-500 hover:bg-slate-50'}`}>
              <input 
                type="file" 
                accept="application/pdf,image/*"
                onChange={handleFileUpload} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={isParsing}
              />
              
              {isParsing ? (
                  <div className="flex flex-col items-center">
                      <span className="font-medium text-highmark-500">正在快速解析...</span>
                  </div>
              ) : parseSuccess ? (
                  <div className="flex flex-col items-center text-green-700">
                      <CheckCircle2 className="mb-2" size={32} />
                      <span className="font-bold text-lg">解析完成</span>
                  </div>
              ) : (
                  <div className="flex flex-col items-center text-slate-500">
                      <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mb-3">
                          <Upload size={20} />
                      </div>
                      <span className="font-medium text-slate-700">点击上传 PDF / 图片</span>
                  </div>
              )}
           </div>
        </div>

        <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-800 mb-4 border-l-4 border-highmark-gold pl-3">学员核心背景</h3>
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">姓名</label>
                <input required name="name" value={formData.name} onChange={handleChange} className="form-input" placeholder="自动提取..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">毕业年份</label>
                <input required name="graduationYear" value={formData.graduationYear} onChange={handleChange} className="form-input" placeholder="例如：2025" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">毕业院校</label>
                <input required name="university" value={formData.university} onChange={handleChange} className="form-input" placeholder="自动提取..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">所学专业</label>
                <input required name="major" value={formData.major} onChange={handleChange} className="form-input" placeholder="自动提取..." />
              </div>
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
            disabled={isParsing || !formData.resumeText}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
                !formData.resumeText ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-highmark-500 hover:bg-highmark-600 text-white hover:shadow-2xl'
            }`}
        >
            {isParsing ? '解析中...' : '生成职业规划报告'} <ArrowRight size={20} />
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