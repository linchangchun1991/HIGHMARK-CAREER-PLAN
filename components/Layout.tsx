import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 no-print shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-4">
          <div className="flex items-center">
             {/* Text Only Logo */}
             <div className="flex items-center gap-4 select-none">
                <span className="font-black text-2xl text-slate-900 tracking-tighter">HMG</span>
                <div className="h-4 w-px bg-slate-300"></div>
                <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-900 text-base tracking-wide">
                        海马中际
                    </span>
                    <div className="h-4 w-px bg-slate-300"></div>
                    <span className="font-bold text-slate-900 text-base tracking-wide">
                        海马职加
                    </span>
                </div>
             </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-200 px-2 py-1 rounded">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            System V2.0 Online
          </div>
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center w-full py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto no-print">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-xs">
             © {new Date().getFullYear()} HighMark Career | Internal Use Only | Confidential
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
