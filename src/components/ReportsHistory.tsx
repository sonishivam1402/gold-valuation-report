import React, { useState } from 'react';
import { ShopSettings, ValuationReport } from '../types';
import {
  formatDateDisplay,
  formatIndianCurrency,
  formatMobileDisplay,
  formatWeight,
} from '../utils/calculations';
import {
  exportDataBackup,
  importDataBackup,
} from '../utils/storage';
import { generateValuationPDF } from '../utils/pdfGenerator';
import {
  Search,
  Download,
  Trash2,
  Copy,
  Edit,
  Eye,
  AlertTriangle,
  Upload,
  Database,
  Calendar,
  X,
  FileCheck,
} from 'lucide-react';

interface ReportsHistoryProps {
  reports: ValuationReport[];
  settings: ShopSettings;
  onViewReport: (report: ValuationReport) => void;
  onEditReport: (report: ValuationReport) => void;
  onDuplicateReport: (report: ValuationReport) => void;
  onDeleteReport: (id: string) => void;
  onRefreshReports: () => void;
}

export const ReportsHistory: React.FC<ReportsHistoryProps> = ({
  reports,
  settings,
  onViewReport,
  onEditReport,
  onDuplicateReport,
  onDeleteReport,
  onRefreshReports,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [reportToDelete, setReportToDelete] = useState<ValuationReport | null>(null);
  const [importMessage, setImportMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Filter reports
  const filteredReports = reports.filter((r) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      r.reportNumber.toLowerCase().includes(term) ||
      r.customer.name.toLowerCase().includes(term) ||
      r.customer.mobile.includes(term) ||
      (r.customer.address && r.customer.address.toLowerCase().includes(term));

    const matchesDate = !dateFilter || r.customer.valuationDate === dateFilter;

    return matchesSearch && matchesDate;
  });

  // Calculate totals across reports
  const totalValuationAll = reports.reduce((sum, r) => sum + (r.totals?.totalValue || 0), 0);
  const totalNetGoldWeight = reports.reduce((sum, r) => sum + (r.totals?.netWeight || 0), 0);

  const handleDownload = async (report: ValuationReport, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await generateValuationPDF(report, settings, 'download');
    } catch (err: any) {
      console.error('Failed to download report PDF:', err);
      setImportMessage({ text: 'Error generating PDF: ' + (err?.message || 'Unknown error'), isError: true });
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importDataBackup(content);
      if (res.success) {
        setImportMessage({ text: res.message, isError: false });
        onRefreshReports();
      } else {
        setImportMessage({ text: res.message, isError: true });
      }
      setTimeout(() => setImportMessage(null), 5000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const confirmDelete = () => {
    if (reportToDelete) {
      onDeleteReport(reportToDelete.id);
      setReportToDelete(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner & KPI cards */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          <div>
            <h1 className="text-xl font-bold text-[#2c1a0e] tracking-tight">
              Valuation Reports Archive
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Access, reprint, duplicate, and manage all previously issued gold jewellery valuation certificates.
            </p>
          </div>

          {/* Backup / Export Tools */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={exportDataBackup}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              title="Download full JSON backup of all valuation records to your PC"
            >
              <Download className="w-3.5 h-3.5 text-neutral-600" />
              <span>Export Backup</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-neutral-600" />
              <span>Import Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {importMessage && (
          <div
            className={`mt-4 p-3 rounded-lg text-xs flex items-center justify-between ${
              importMessage.isError
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            <span>{importMessage.text}</span>
            <button
              onClick={() => setImportMessage(null)}
              className="text-neutral-500 hover:text-neutral-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Local Storage Advisory Banner */}
        <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-3">
          <Database className="w-4 h-4 text-amber-800 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">Shop Data Storage Notice: </span>
            Valuation reports and shop drafts are stored locally inside this web browser. Browser-local data may be lost if website cache/history is cleared. Use the "Export Backup" button periodically to save an offline copy to your computer.
          </div>
        </div>

        {/* Summary Metric Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <div className="text-[11px] font-semibold uppercase text-neutral-500">Total Reports Issued</div>
            <div className="text-2xl font-black text-[#2c1a0e] tabular-nums mt-1">
              {reports.length} <span className="text-xs font-medium text-neutral-500">records</span>
            </div>
          </div>

          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <div className="text-[11px] font-semibold uppercase text-neutral-500">Total Net Gold Valued</div>
            <div className="text-2xl font-black text-amber-800 tabular-nums mt-1">
              {formatWeight(totalNetGoldWeight)}
            </div>
          </div>

          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <div className="text-[11px] font-semibold uppercase text-neutral-500">Cumulative Valuation</div>
            <div className="text-2xl font-black text-emerald-800 tabular-nums mt-1">
              {formatIndianCurrency(totalValuationAll, false)}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, mobile number, or report number (e.g. SJF/VAL/)..."
            className="w-full pl-9 pr-4 py-2 border border-neutral-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-8 pr-3 py-2 border border-neutral-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
            />
          </div>

          {(searchTerm || dateFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setDateFilter('');
              }}
              className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Reports Table Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center">
            <FileCheck className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-neutral-700">No Valuation Reports Found</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              {reports.length === 0
                ? 'You have not finalized any valuation reports yet. Click "New Valuation" to create one.'
                : 'No reports match your current search query or date filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#2c1a0e] text-white font-semibold">
                <tr>
                  <th className="py-3 px-4">Report No.</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Items</th>
                  <th className="py-3 px-4 text-right">Net Wt</th>
                  <th className="py-3 px-4 text-right">Total Valuation</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    onClick={() => onViewReport(report)}
                    className="hover:bg-amber-50/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-[#2c1a0e] tabular-nums whitespace-nowrap">
                      {report.reportNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-900">
                      <div>{report.customer.name}</div>
                      <div className="text-[10px] text-neutral-500 truncate max-w-xs font-normal">
                        {report.customer.address}
                      </div>
                    </td>
                    <td className="py-3 px-4 tabular-nums text-neutral-700 whitespace-nowrap">
                      {formatMobileDisplay(report.customer.mobile)}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 tabular-nums whitespace-nowrap">
                      {formatDateDisplay(report.customer.valuationDate)}
                    </td>
                    <td className="py-3 px-4 text-center tabular-nums">
                      {report.items.length} pcs
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-neutral-700 font-medium">
                      {formatWeight(report.totals?.netWeight || 0)}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-extrabold text-[#2c1a0e] text-sm whitespace-nowrap">
                      {formatIndianCurrency(report.totals?.totalValue || 0, true)}
                    </td>
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          title="View / Print Preview"
                          onClick={() => onViewReport(report)}
                          className="p-1.5 text-neutral-600 hover:text-amber-800 hover:bg-neutral-100 rounded transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          title="Edit Report"
                          onClick={() => onEditReport(report)}
                          className="p-1.5 text-neutral-600 hover:text-blue-800 hover:bg-neutral-100 rounded transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          title="Duplicate as New Report"
                          onClick={() => onDuplicateReport(report)}
                          className="p-1.5 text-neutral-600 hover:text-purple-800 hover:bg-neutral-100 rounded transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          title="Download PDF"
                          onClick={(e) => handleDownload(report, e)}
                          className="p-1.5 text-neutral-600 hover:text-emerald-800 hover:bg-neutral-100 rounded transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          title="Delete Report"
                          onClick={() => setReportToDelete(report)}
                          className="p-1.5 text-neutral-600 hover:text-red-700 hover:bg-neutral-100 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Deletion */}
      {reportToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2 bg-red-100 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">
                Confirm Delete Valuation Report
              </h3>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Are you sure you want to permanently delete valuation report{' '}
              <span className="font-bold text-neutral-900">#{reportToDelete.reportNumber}</span>{' '}
              for <span className="font-bold text-neutral-900">{reportToDelete.customer.name}</span>?
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setReportToDelete(null)}
                className="px-4 py-2 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
              >
                Delete Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
