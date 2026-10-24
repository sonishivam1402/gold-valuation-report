import React, { useState } from 'react';
import { ShopSettings, RateBasis } from '../types';
import { DEFAULT_SETTINGS, DEFAULT_TERMS } from '../utils/storage';
import {
  Building,
  Phone,
  MapPin,
  Image as ImageIcon,
  DollarSign,
  FileText,
  RotateCcw,
  Check,
  Upload,
  Printer,
  X,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ShopSettings;
  onSave: (updated: ShopSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [formData, setFormData] = useState<ShopSettings>(settings);
  const [termsText, setTermsText] = useState(settings.defaultTerms.join('\n\n'));
  const [savedNotification, setSavedNotification] = useState(false);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormData((prev) => ({ ...prev, letterheadImageUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleResetLetterhead = () => {
    setFormData((prev) => ({
      ...prev,
      letterheadImageUrl: DEFAULT_SETTINGS.letterheadImageUrl,
    }));
  };

  const handleResetTerms = () => {
    setFormData((prev) => ({
      ...prev,
      defaultTerms: DEFAULT_TERMS,
    }));
    setTermsText(DEFAULT_TERMS.join('\n\n'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Split terms text into array of non-empty paragraphs
    const parsedTerms = termsText
      .split('\n')
      .map((t) => t.trim().replace(/^\d+[\.\)]\s*/, '')) // strip leading numbers like "1. " if typed
      .filter((t) => t.length > 5);

    const updated: ShopSettings = {
      ...formData,
      defaultTerms: parsedTerms.length > 0 ? parsedTerms : DEFAULT_TERMS,
    };

    onSave(updated);
    setSavedNotification(true);
    setTimeout(() => {
      setSavedNotification(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#2c1a0e] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold tracking-tight">Shop Administration & Report Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs">
          {savedNotification && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl flex items-center gap-2 font-bold text-sm">
              <Check className="w-4 h-4" />
              <span>Shop settings saved successfully!</span>
            </div>
          )}

          {/* Business Information Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 border-b border-neutral-200 pb-1.5 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-amber-700" />
              Business Letterhead Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Proprietor / Contact Person <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.proprietor}
                  onChange={(e) => setFormData({ ...formData, proprietor: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none tabular-nums"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Shop Address <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none resize-none"
                required
              />
            </div>
          </div>

          {/* Letterhead Banner / Logo */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 border-b border-neutral-200 pb-1.5 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-amber-700" />
              Letterhead Banner / Official Logo
            </h3>

            {formData.letterheadImageUrl && (
              <div className="border border-neutral-200 rounded-xl p-2 bg-neutral-50 overflow-hidden">
                <div className="text-[10px] text-neutral-500 mb-1 font-semibold">Active Letterhead Preview:</div>
                <img
                  src={formData.letterheadImageUrl}
                  alt="Letterhead Preview"
                  className="w-full h-28 object-contain object-top rounded bg-white border border-neutral-200"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <label className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors">
                <Upload className="w-3.5 h-3.5 text-neutral-600" />
                <span>Upload Custom Letterhead / Banner</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleResetLetterhead}
                className="px-3 py-2 border border-neutral-300 rounded-lg font-bold text-xs text-neutral-700 hover:bg-neutral-50 transition-colors inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-neutral-600" />
                <span>Restore Shivam Jewellers Default Banner</span>
              </button>
            </div>
          </div>

          {/* Gold Rate & Numbering Configuration */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 border-b border-neutral-200 pb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-700" />
              Valuation Calculation & Report Defaults
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Default Daily Gold Rate (₹/g)
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.defaultGoldRate}
                  onChange={(e) => setFormData({ ...formData, defaultGoldRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none tabular-nums"
                />
                <p className="text-[10px] text-neutral-500 mt-0.5">Can be adjusted per report.</p>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Default Rate Basis
                </label>
                <select
                  value={formData.defaultRateBasis}
                  onChange={(e) => setFormData({ ...formData, defaultRateBasis: e.target.value as RateBasis })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
                >
                  <option value="per_purity">Rate per stated purity</option>
                  <option value="24k_reference">24-Carat Reference Rate</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Default Printing Mode
                </label>
                <select
                  value={formData.defaultPrintMode}
                  onChange={(e) => setFormData({ ...formData, defaultPrintMode: e.target.value as 'full' | 'content_only' })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
                >
                  <option value="full">Full Letterhead (Included in PDF)</option>
                  <option value="content_only">Content Only (For Pre-printed Stationery)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Report Number Prefix
                </label>
                <input
                  type="text"
                  value={formData.reportPrefix}
                  onChange={(e) => setFormData({ ...formData, reportPrefix: e.target.value })}
                  placeholder="SJF/VAL/"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Next Report Sequence No.
                </label>
                <input
                  type="number"
                  value={formData.nextReportSeq}
                  onChange={(e) => setFormData({ ...formData, nextReportSeq: parseInt(e.target.value) || 101 })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none tabular-nums"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Authorized Signatory Title
                </label>
                <input
                  type="text"
                  value={formData.signatureTitle}
                  onChange={(e) => setFormData({ ...formData, signatureTitle: e.target.value })}
                  placeholder="Proprietor / Authorized Signatory"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Default Terms & Conditions Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-700" />
                Default English Terms & Conditions Clauses
              </h3>

              <button
                type="button"
                onClick={handleResetTerms}
                className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset to Standard Terms
              </button>
            </div>

            <textarea
              rows={8}
              value={termsText}
              onChange={(e) => setTermsText(e.target.value)}
              className="w-full p-3 border border-neutral-300 rounded-lg text-xs font-mono leading-relaxed focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
            />
            <p className="text-[10px] text-neutral-500">
              Separate each clause with a blank line. These clauses appear in English on every valuation report.
            </p>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#2c1a0e] text-white hover:bg-[#3d2314] rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
