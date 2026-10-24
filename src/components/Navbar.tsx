import React from 'react';
import { ShopSettings } from '../types';
import { Sparkles, FileText, Settings, Plus, Menu, X } from 'lucide-react';

interface NavbarProps {
  activeTab: 'new_report' | 'history';
  onSelectTab: (tab: 'new_report' | 'history') => void;
  settings: ShopSettings;
  reportsCount: number;
  onOpenSettings: () => void;
  onQuickNewReport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  settings,
  reportsCount,
  onOpenSettings,
  onQuickNewReport,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="no-print bg-[#2c1a0e] text-white border-b border-amber-800/40 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('new_report')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-amber-400 to-amber-700 flex items-center justify-center text-[#2c1a0e] shadow-xs">
                <Sparkles className="w-5 h-5 fill-amber-300" />
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-white whitespace-nowrap group-hover:text-amber-300 transition-colors">
                  {settings.businessName}
                </span>
                <span className="hidden sm:block text-[10px] text-amber-400 font-semibold tracking-wider uppercase">
                  {settings.tagline} · Vadodara
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onSelectTab('new_report')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'new_report'
                  ? 'bg-amber-600/30 text-amber-300 border border-amber-600/40'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              New Valuation
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('history')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-amber-600/30 text-amber-300 border border-amber-600/40'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Reports Archive</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded font-mono">
                {reportsCount}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className="px-3 py-1.5 rounded-lg text-neutral-300 hover:text-white transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-neutral-400" />
              <span>Shop Settings</span>
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onQuickNewReport}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#2c1a0e] bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs hover:shadow transition-all whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Report</span>
            </button>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-amber-900/60 space-y-2">
            <button
              type="button"
              onClick={() => {
                onSelectTab('new_report');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-bold rounded-lg hover:bg-white/10 text-neutral-200"
            >
              New Valuation
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectTab('history');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-bold rounded-lg hover:bg-white/10 text-neutral-200 flex items-center justify-between"
            >
              <span>Reports Archive</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                {reportsCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenSettings();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-bold rounded-lg hover:bg-white/10 text-neutral-200"
            >
              Shop Settings
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
