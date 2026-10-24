import React, { useEffect, useState } from 'react';
import { ShopSettings, ValuationReport } from '../types';
import {
  formatDateDisplay,
  formatIndianCurrency,
  formatMobileDisplay,
  formatWeight,
  numberToIndianWords,
} from '../utils/calculations';
import { generateValuationPDF } from '../utils/pdfGenerator';
import {
  Printer,
  Download,
  Save,
  Edit3,
  FilePlus,
  FileCheck,
  Check,
  Building2,
  FileText,
} from 'lucide-react';

interface Step4PreviewProps {
  report: ValuationReport;
  settings: ShopSettings;
  onEdit: (stepNumber?: number) => void;
  onSaveToHistory: () => void;
  onSaveDraft: () => void;
  onNewReport: () => void;
  onUpdateLetterheadMode: (mode: 'full' | 'content_only') => void;
}

export const Step4Preview: React.FC<Step4PreviewProps> = ({
  report,
  settings,
  onEdit,
  onSaveToHistory,
  onSaveDraft,
  onNewReport,
  onUpdateLetterheadMode,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [letterheadFrame, setLetterheadFrame] = useState<{ width: number; height: number } | null>(null);

  const applyLetterheadFrame = (img: HTMLImageElement) => {
    const ratio = img.naturalHeight / img.naturalWidth;
    if (ratio > 1.1) {
      // Full-page sheet: stop the header at the address so no blank band sits under it.
      setLetterheadFrame({
        width: img.naturalWidth,
        height: Math.ceil(img.naturalHeight * 0.208),
      });
    } else {
      setLetterheadFrame({ width: img.naturalWidth, height: img.naturalHeight });
    }
  };

  const handleLetterheadLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    applyLetterheadFrame(e.currentTarget);
  };

  useEffect(() => {
    const img = document.querySelector(
      'img[alt="Shivam Jewellers Letterhead Banner"]'
    ) as HTMLImageElement | null;
    if (img && img.complete && img.naturalWidth > 0) {
      applyLetterheadFrame(img);
    }
  }, [settings.letterheadImageUrl]);

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      setDownloadError(null);
      await generateValuationPDF(report, settings, 'download');
    } catch (err: any) {
      console.error('PDF generation error:', err);
      setDownloadError(err?.message || 'Failed to generate PDF. You can also use the Print button to print or Save as PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    onSaveToHistory();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Control Actions Bar (Hidden when printing via .no-print) */}
      <div className="no-print bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-amber-700" />
              <h2 className="text-base font-bold text-[#2c1a0e]">
                Valuation Report Preview & Finalization
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Review the valuation for {report.customer.name || 'the customer'}. Ready for customer delivery.
            </p>
          </div>

          {/* Letterhead Mode Switcher */}
          <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
            <button
              type="button"
              onClick={() => onUpdateLetterheadMode('full')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                report.letterheadMode === 'full'
                  ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200/60'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Full Letterhead (Included)
            </button>
            <button
              type="button"
              onClick={() => onUpdateLetterheadMode('content_only')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                report.letterheadMode === 'content_only'
                  ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200/60'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              For Pre-printed Stationery
            </button>
          </div>
        </div>

        {downloadError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between">
            <span>{downloadError}</span>
            <button
              type="button"
              onClick={() => setDownloadError(null)}
              className="text-red-500 hover:text-red-800 font-bold ml-2 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Action Buttons Toolbar */}
        <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(2)}
              className="flex items-center gap-1.5 px-3 py-2 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-neutral-600" />
              <span>Edit Details</span>
            </button>

            <button
              type="button"
              onClick={onSaveDraft}
              className="flex items-center gap-1.5 px-3 py-2 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-neutral-600" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={onNewReport}
              className="flex items-center gap-1.5 px-3 py-2 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <FilePlus className="w-3.5 h-3.5 text-neutral-600" />
              <span>Create New</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 shadow-xs transition-colors"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Report Saved!</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Save to History</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 border border-neutral-400 bg-white text-neutral-900 rounded-lg text-xs font-bold hover:bg-neutral-50 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4 text-neutral-700" />
              <span>Print (Chrome / Edge)</span>
            </button>

            <button
              type="button"
              disabled={downloading}
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-5 py-2 bg-[#2c1a0e] text-white hover:bg-[#3d2314] rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>{downloading ? 'Preparing PDF...' : 'Download A4 PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* A4 Sheet Container */}
      <div className="a4-print-container bg-white border border-neutral-300 shadow-xl rounded-lg mx-auto w-full max-w-[210mm] text-neutral-900 overflow-hidden font-sans">
        {/* Full Letterhead Top Section */}
        {report.letterheadMode === 'full' ? (
          <div>
            {/* If letterhead image is set (Shivam official letterhead banner) */}
            {settings.letterheadImageUrl ? (
              <div
                className="relative w-full overflow-hidden bg-[#fbf8f2] border-b border-amber-700/20"
                style={{
                  aspectRatio: letterheadFrame
                    ? `${letterheadFrame.width} / ${letterheadFrame.height}`
                    : '1102 / 297',
                }}
              >
                <img
                  src={settings.letterheadImageUrl}
                  alt="Shivam Jewellers Letterhead Banner"
                  className="absolute top-0 left-0 w-full h-auto max-w-none"
                  onLoad={handleLetterheadLoad}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="bg-[#2c1a0e] text-white p-6 border-b-4 border-amber-600">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-black tracking-tight">{settings.businessName}</h1>
                    <div className="text-xs text-amber-400 font-semibold tracking-wider mt-0.5">
                      {settings.tagline}
                    </div>
                    <div className="text-[11px] text-neutral-300 mt-2 max-w-md">
                      {settings.address}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{settings.proprietor}</div>
                    <div className="text-xs text-amber-400 mt-0.5">
                      Mob: {formatMobileDisplay(settings.mobile)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Content-only mode for pre-printed letterhead stationary */
          <div className="no-print h-36 border-b-2 border-dashed border-amber-300 bg-amber-50/40 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-amber-700" />
                Pre-printed Letterhead Area Reserved
              </div>
              <p className="text-[11px] text-amber-800 mt-1 max-w-md">
                Top margin space is left blank for feeding pre-printed letterhead paper into your shop printer.
              </p>
            </div>
          </div>
        )}

        {/* Report Content Body */}
        <div className="px-6 pt-4 pb-6 md:px-8 md:pb-8 space-y-4">
          {/* Customer details and date sit above the report heading */}
          <div className="flex items-start justify-between gap-4 border border-neutral-300 rounded-lg p-3 text-xs bg-neutral-50/30">
            <div className="space-y-1 min-w-0">
              <div className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                Customer Details
              </div>
              <div className="font-bold text-sm text-neutral-900">
                {report.customer.name || 'N/A'}
              </div>
              <div className="text-neutral-600">
                <span className="font-semibold text-neutral-800">Mobile: </span>
                {formatMobileDisplay(report.customer.mobile) || 'N/A'}
              </div>
              <div className="text-neutral-600 leading-snug">
                <span className="font-semibold text-neutral-800">Address: </span>
                {report.customer.address || 'N/A'}
              </div>
            </div>

            <div className="shrink-0 whitespace-nowrap text-right text-[11px] font-bold leading-none text-[#2c1a0e] tabular-nums pt-1 pr-1">
              <span className="font-bold uppercase text-amber-900">Date: </span>
              {formatDateDisplay(report.customer.valuationDate)}
            </div>
          </div>

          <div className="text-center border-y border-amber-700/30 py-2 bg-amber-50/50">
            <h2 className="text-base md:text-lg font-black tracking-wider text-[#2c1a0e] uppercase">
              Gold Jewellery Valuation Report
            </h2>
          </div>

          {/* Jewellery Valuation Table */}
          <div className="border border-neutral-300 rounded-lg overflow-hidden">
            <table className="w-full text-left text-[10px]">
              <thead className="bg-[#2c1a0e] text-white font-bold text-[9px]">
                <tr>
                  <th className="py-2 px-1 text-center align-bottom leading-tight w-10">Sr. No.</th>
                  <th className="py-2 px-1.5 align-bottom leading-tight">Description of Gold Ornaments</th>
                  <th className="py-2 px-1 text-center align-bottom leading-tight">Number of Articles</th>
                  <th className="py-2 px-1 text-center align-bottom leading-tight">Gross Weight (In grams)</th>
                  <th className="py-2 px-1 text-center align-bottom leading-tight">Impurity Weight/ Stone Weight etc</th>
                  <th className="py-2 px-1 text-center align-bottom leading-tight">Net Weight (In grams)</th>
                  <th className="py-2 px-1 text-center align-bottom leading-tight">Purity (in terms of carat)</th>
                  <th className="py-2 px-1 text-center align-bottom leading-tight">Gold Rate</th>
                  <th className="py-2 px-1 text-center align-bottom leading-tight">Value of Ornaments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {report.items.map((item, index) => (
                  <tr key={item.id} className="even:bg-neutral-50/50">
                    <td className="py-2 px-2 text-center text-neutral-500 font-medium">
                      {item.srNo || index + 1}
                    </td>
                    <td className="py-2 px-2 font-semibold text-neutral-900">
                      <div>{item.description}</div>
                      {item.notes && (
                        <div className="text-[10px] text-neutral-500 font-normal italic">
                          {item.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-1 text-center tabular-nums">
                      {item.articlesCount}
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums text-neutral-700">
                      {formatWeight(item.grossWeight)}
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums text-neutral-600">
                      {item.impurityWeight > 0 ? formatWeight(item.impurityWeight) : '-'}
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums font-bold text-amber-950">
                      {formatWeight(item.netWeight)}
                    </td>
                    <td className="py-2 px-1 text-center font-semibold">
                      {item.purityCarat}K
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums text-neutral-700">
                      ₹{new Intl.NumberFormat('en-IN').format(item.goldRate)}
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums font-extrabold text-[#2c1a0e]">
                      {formatIndianCurrency(item.ornamentValue, true)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-amber-100/70 border-t-2 border-neutral-400 font-bold text-neutral-900">
                <tr>
                  <td colSpan={2} className="py-2.5 px-2 uppercase tracking-wider text-[10px]">
                    Total Summary
                  </td>
                  <td className="py-2.5 px-1 text-center tabular-nums font-extrabold">
                    {report.totals.articlesCount}
                  </td>
                  <td className="py-2.5 px-2 text-right tabular-nums">
                    {formatWeight(report.totals.grossWeight)}
                  </td>
                  <td className="py-2.5 px-2 text-right tabular-nums text-neutral-700">
                    {formatWeight(report.totals.impurityWeight)}
                  </td>
                  <td className="py-2.5 px-2 text-right tabular-nums text-amber-950 font-black">
                    {formatWeight(report.totals.netWeight)}
                  </td>
                  <td className="py-2.5 px-1 text-center text-neutral-500">-</td>
                  <td className="py-2.5 px-2"></td>
                  <td className="py-2.5 px-2 text-right tabular-nums font-black text-[#2c1a0e] text-xs">
                    {formatIndianCurrency(report.totals.totalValue, true)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Amount in words summary banner */}
          <div className="p-2.5 bg-neutral-100/80 border border-neutral-300 rounded text-xs">
            <span className="font-bold text-[#2c1a0e]">Amount in Words: </span>
            <span className="italic font-medium text-neutral-800">
              {numberToIndianWords(report.totals.totalValue)}
            </span>
          </div>

          {/* Remarks (if entered) */}
          {report.remarks && (
            <div className="p-2.5 border border-neutral-300 rounded text-xs bg-white">
              <span className="font-bold text-[#2c1a0e]">Remarks / Notes: </span>
              <span className="text-neutral-700">{report.remarks}</span>
            </div>
          )}

          {/* English Disclaimer & Terms and Conditions */}
          {report.termsAccepted && (
            <div className="border border-neutral-300 rounded p-3 text-[9.5px] leading-relaxed text-neutral-700 bg-neutral-50/50 print-avoid-break">
              <div className="font-bold text-[#2c1a0e] uppercase tracking-wider mb-1.5 text-[10px]">
                Disclaimer & Terms and Conditions
              </div>
              <ol className="space-y-1 list-none">
                {report.termsList.map((term, idx) => (
                  <li key={idx} className="flex gap-1.5">
                    <span className="font-bold shrink-0">{idx + 1}.</span>
                    <span>{term}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Authorized signatory */}
          <div className="flex justify-end pt-4 border-t border-neutral-300 print-avoid-break text-xs">
            <div className="flex flex-col justify-between h-28 w-full max-w-xs border border-neutral-200 rounded p-3 bg-neutral-50/30">
              <div className="text-right">
                <div className="font-bold text-[#2c1a0e] text-[11px]">
                  FOR {settings.businessName.toUpperCase()}
                </div>
              </div>
              <div className="border-t border-neutral-400 pt-1 flex justify-between items-center text-[11px]">
                <span className="font-bold text-neutral-900">{settings.proprietor}</span>
                <span className="text-[10px] text-neutral-600 font-medium">
                  {settings.signatureTitle}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer (Full Letterhead mode) */}
        {report.letterheadMode === 'full' && (
          <div className="bg-[#2c1a0e] text-neutral-300 py-2 px-6 text-[10px] flex justify-between items-center border-t-2 border-amber-600">
            <div>
              {settings.businessName} · {settings.address}
            </div>
            <div>
              Mobile: {formatMobileDisplay(settings.mobile)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
