import React, { useState } from 'react';
import { JewelleryItem, RateBasis, ReportTotals } from '../types';
import {
  calculateItemValue,
  calculateReportTotals,
  formatIndianCurrency,
  formatWeight,
  numberToIndianWords,
} from '../utils/calculations';
import { ItemModal } from './ItemModal';
import {
  Plus,
  Copy,
  Trash2,
  Edit2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Info,
  Scale,
  RefreshCw,
} from 'lucide-react';

interface Step2JewelleryProps {
  items: JewelleryItem[];
  rateBasis: RateBasis;
  goldRateDefault: number;
  remarks: string;
  totals: ReportTotals;
  onUpdateItems: (items: JewelleryItem[], totals: ReportTotals) => void;
  onUpdateRateBasis: (rateBasis: RateBasis) => void;
  onUpdateGoldRateDefault: (rate: number) => void;
  onUpdateRemarks: (remarks: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const Step2Jewellery: React.FC<Step2JewelleryProps> = ({
  items,
  rateBasis,
  goldRateDefault,
  remarks,
  totals,
  onUpdateItems,
  onUpdateRateBasis,
  onUpdateGoldRateDefault,
  onUpdateRemarks,
  onContinue,
  onBack,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<JewelleryItem | null>(null);
  const [rateApplyInput, setRateApplyInput] = useState<number>(goldRateDefault);
  const [showRateUpdateAlert, setShowRateUpdateAlert] = useState(false);

  // Re-index serial numbers
  const reindex = (list: JewelleryItem[]): JewelleryItem[] => {
    return list.map((item, idx) => ({ ...item, srNo: idx + 1 }));
  };

  const handleSaveItem = (item: JewelleryItem) => {
    let updated: JewelleryItem[];
    const existingIndex = items.findIndex((i) => i.id === item.id);
    if (existingIndex >= 0) {
      updated = [...items];
      updated[existingIndex] = item;
    } else {
      updated = [...items, item];
    }
    const finalItems = reindex(updated);
    const newTotals = calculateReportTotals(finalItems);
    onUpdateItems(finalItems, newTotals);
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    const finalItems = reindex(updated);
    const newTotals = calculateReportTotals(finalItems);
    onUpdateItems(finalItems, newTotals);
  };

  const handleDuplicateItem = (item: JewelleryItem) => {
    const duplicated: JewelleryItem = {
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      srNo: items.length + 1,
      description: `${item.description} (Copy)`,
    };
    const finalItems = reindex([...items, duplicated]);
    const newTotals = calculateReportTotals(finalItems);
    onUpdateItems(finalItems, newTotals);
  };

  const handleRateBasisChange = (newBasis: RateBasis) => {
    onUpdateRateBasis(newBasis);
    // Recalculate all items with new rate basis
    const recalculated = items.map((item) => ({
      ...item,
      ornamentValue: calculateItemValue(item.netWeight, item.purityCarat, item.goldRate, newBasis),
    }));
    const newTotals = calculateReportTotals(recalculated);
    onUpdateItems(recalculated, newTotals);
  };

  const handleApplyRateToAll = () => {
    if (rateApplyInput <= 0) return;
    onUpdateGoldRateDefault(rateApplyInput);
    const updated = items.map((item) => {
      const val = calculateItemValue(item.netWeight, item.purityCarat, rateApplyInput, rateBasis);
      return {
        ...item,
        goldRate: rateApplyInput,
        ornamentValue: val,
      };
    });
    const newTotals = calculateReportTotals(updated);
    onUpdateItems(updated, newTotals);
    setShowRateUpdateAlert(true);
    setTimeout(() => setShowRateUpdateAlert(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Rate Basis & Market Rate Control Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-700" />
              <h3 className="font-bold text-[#2c1a0e] text-base">
                Gold Valuation Rate Calculation Basis
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mt-1 max-w-2xl">
              Choose how ornament values are calculated from the gold rate. Shivam Jewellers supports both rate basis modes without duplicate purity adjustments.
            </p>
          </div>

          {/* Rate Basis Segmented Control */}
          <div className="inline-flex p-1 bg-neutral-100 rounded-xl border border-neutral-200 self-start lg:self-center">
            <button
              type="button"
              onClick={() => handleRateBasisChange('per_purity')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                rateBasis === 'per_purity'
                  ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200/60'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Rate per Stated Purity
            </button>
            <button
              type="button"
              onClick={() => handleRateBasisChange('24k_reference')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                rateBasis === '24k_reference'
                  ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200/60'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              24-Carat Reference Rate
            </button>
          </div>
        </div>

        {/* Explanation Note & Bulk Rate Update */}
        <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-neutral-600">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {rateBasis === 'per_purity'
                ? 'Formula: Value = Net Weight (g) × Gold Rate of that specific carat'
                : 'Formula: Value = Net Weight (g) × (Purity Carats / 24) × 24K Benchmark Gold Rate'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium text-neutral-700 whitespace-nowrap">Daily Gold Rate:</span>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">₹</span>
              <input
                type="number"
                value={rateApplyInput}
                onChange={(e) => setRateApplyInput(parseFloat(e.target.value) || 0)}
                className="w-24 pl-6 pr-2 py-1 text-xs border border-neutral-300 rounded-md tabular-nums font-bold"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyRateToAll}
              className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md font-semibold text-xs transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Apply to All Items
            </button>
          </div>
        </div>

        {showRateUpdateAlert && (
          <div className="mt-2 text-xs text-emerald-700 font-medium">
            ✓ Applied ₹{rateApplyInput}/g rate to all {items.length} items and recalculated values.
          </div>
        )}
      </div>

      {/* Jewellery Items Table Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#2c1a0e] tracking-tight">
              Gold Ornaments & Valuation Table
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Accurately weigh gross ornaments, deduct stones or impurities, and check purity.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#2c1a0e] text-white hover:bg-[#3d2314] rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add Jewellery Item</span>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-amber-700 border border-amber-200">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-neutral-800">No Jewellery Items Added Yet</h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1 mb-5">
              Click the button below to add your first gold ornament item (such as bangles, necklace, chain, or rings) with gross weight and stone deduction.
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setModalOpen(true);
              }}
              className="px-5 py-2.5 bg-[#2c1a0e] text-white rounded-xl text-xs font-bold hover:bg-[#3d2314] transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              Add First Ornament
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#2c1a0e] text-white font-semibold">
                <tr>
                  <th className="py-3 px-3 text-center w-12">Sr.</th>
                  <th className="py-3 px-3">Description of Gold Ornaments</th>
                  <th className="py-3 px-3 text-center">Articles</th>
                  <th className="py-3 px-3 text-right">Gross Wt (g)</th>
                  <th className="py-3 px-3 text-right">Impurity Wt (g)</th>
                  <th className="py-3 px-3 text-right">Net Wt (g)</th>
                  <th className="py-3 px-3 text-center">Purity</th>
                  <th className="py-3 px-3 text-right">Rate (₹/g)</th>
                  <th className="py-3 px-3 text-right">Value (₹)</th>
                  <th className="py-3 px-3 text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-3 px-3 text-center text-neutral-500 font-medium">
                      {item.srNo || index + 1}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-neutral-900">{item.description}</div>
                      {item.notes && (
                        <div className="text-[11px] text-neutral-500 italic mt-0.5">
                          {item.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center tabular-nums font-semibold">
                      {item.articlesCount}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-neutral-700">
                      {formatWeight(item.grossWeight)}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-red-600">
                      {item.impurityWeight > 0 ? `-${formatWeight(item.impurityWeight)}` : '0.000 g'}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums font-bold text-amber-950 bg-amber-50/50">
                      {formatWeight(item.netWeight)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-semibold text-neutral-800">
                        {item.purityCarat}K
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-neutral-700">
                      ₹{new Intl.NumberFormat('en-IN').format(item.goldRate)}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums font-extrabold text-[#2c1a0e] text-sm">
                      {formatIndianCurrency(item.ornamentValue, true)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          title="Edit Item"
                          onClick={() => {
                            setEditingItem(item);
                            setModalOpen(true);
                          }}
                          className="p-1 text-neutral-500 hover:text-amber-800 hover:bg-neutral-100 rounded transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Duplicate Item"
                          onClick={() => handleDuplicateItem(item)}
                          className="p-1 text-neutral-500 hover:text-blue-800 hover:bg-neutral-100 rounded transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Delete Item"
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 text-neutral-500 hover:text-red-700 hover:bg-neutral-100 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Table Footer / Summary Row */}
              <tfoot className="bg-neutral-100 border-t-2 border-neutral-300 font-bold text-neutral-900">
                <tr>
                  <td colSpan={2} className="py-3 px-3 uppercase tracking-wider text-xs">
                    Total Summary
                  </td>
                  <td className="py-3 px-3 text-center tabular-nums text-sm">
                    {totals.articlesCount} pcs
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">
                    {formatWeight(totals.grossWeight)}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-red-600">
                    {formatWeight(totals.impurityWeight)}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-amber-950 font-extrabold bg-amber-100/60 text-sm">
                    {formatWeight(totals.netWeight)}
                  </td>
                  <td colSpan={2} className="py-3 px-3 text-right text-xs uppercase text-neutral-600">
                    Grand Valuation:
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums font-black text-[#2c1a0e] text-base">
                    {formatIndianCurrency(totals.totalValue, true)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Summary KPI Cards & Amount in Words */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <div className="text-[11px] font-semibold text-neutral-500 uppercase">Total Articles</div>
          <div className="text-xl font-bold text-neutral-900 tabular-nums mt-0.5">
            {totals.articlesCount} <span className="text-xs text-neutral-500 font-normal">items</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <div className="text-[11px] font-semibold text-neutral-500 uppercase">Gross Weight</div>
          <div className="text-xl font-bold text-neutral-900 tabular-nums mt-0.5">
            {formatWeight(totals.grossWeight)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <div className="text-[11px] font-semibold text-neutral-500 uppercase">Net Gold Weight</div>
          <div className="text-xl font-bold text-amber-800 tabular-nums mt-0.5">
            {formatWeight(totals.netWeight)}
          </div>
        </div>

        <div className="bg-[#2c1a0e] p-4 rounded-xl text-white">
          <div className="text-[11px] font-semibold text-amber-400 uppercase">Total Estimated Value</div>
          <div className="text-xl font-black tabular-nums mt-0.5 text-white">
            {formatIndianCurrency(totals.totalValue, false)}
          </div>
        </div>
      </div>

      {totals.totalValue > 0 && (
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950 font-medium">
          <span className="font-bold text-amber-900">Total Value in Words: </span>
          {numberToIndianWords(totals.totalValue)}
        </div>
      )}

      {/* Optional Remarks Field */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs">
        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
          Valuation Remarks / Special Observations (Optional)
        </label>
        <textarea
          rows={2}
          value={remarks}
          onChange={(e) => onUpdateRemarks(e.target.value)}
          placeholder="e.g. Ornaments tested on electronic touchstone; customer states jewellery is for domestic appraisal purposes."
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none text-xs"
        />
        <p className="text-[11px] text-neutral-500 mt-1">
          Any remarks entered here will be printed in the dedicated remarks section of the valuation report.
        </p>
      </div>

      {/* Step Navigation Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 border border-neutral-300 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customer</span>
        </button>

        <button
          type="button"
          disabled={items.length === 0}
          onClick={onContinue}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all ${
            items.length === 0
              ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
              : 'bg-[#2c1a0e] text-white hover:bg-[#3d2314] hover:shadow-lg cursor-pointer'
          }`}
        >
          <span>Continue to Terms & Conditions</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Add / Edit Item Modal */}
      <ItemModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        initialItem={editingItem}
        rateBasis={rateBasis}
        defaultGoldRate={goldRateDefault}
        existingCount={items.length}
      />
    </div>
  );
};
