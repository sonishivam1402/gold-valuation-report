import React, { useState, useEffect } from 'react';
import { JewelleryItem, RateBasis } from '../types';
import { calculateItemValue, calculateNetWeight, formatIndianCurrency, formatWeight } from '../utils/calculations';
import { Sparkles, X, AlertCircle } from 'lucide-react';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: JewelleryItem) => void;
  initialItem?: JewelleryItem | null;
  rateBasis: RateBasis;
  defaultGoldRate: number;
  existingCount: number;
}

const COMMON_ORNAMENTS = [
  'Gold Chain',
  'Gold Necklace',
  '22K Bangles (Pair)',
  'Gold Bangles',
  'Gent\'s Ring',
  'Lady\'s Ring',
  'Mangalsutra with Chain',
  'Gold Earrings / Jhumki',
  'Gold Kada',
  'Gold Pendant',
  'Gold Bracelet',
  'Gold Coin (999 Purity)',
  'Antique Gold Set',
];

const PURITY_PRESETS = [
  { label: '24K (99.9% Fine)', carat: 24 },
  { label: '22K (91.6% Hallmark)', carat: 22 },
  { label: '20K (83.3%)', carat: 20 },
  { label: '18K (75.0%)', carat: 18 },
  { label: '14K (58.5%)', carat: 14 },
];

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
  rateBasis,
  defaultGoldRate,
  existingCount,
}) => {
  const [description, setDescription] = useState('');
  const [articlesCount, setArticlesCount] = useState<number>(1);
  const [grossWeight, setGrossWeight] = useState<string>('0.000');
  const [impurityWeight, setImpurityWeight] = useState<string>('0.000');
  const [purityCarat, setPurityCarat] = useState<number>(22);
  const [goldRate, setGoldRate] = useState<number>(defaultGoldRate);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialItem) {
      setDescription(initialItem.description);
      setArticlesCount(initialItem.articlesCount);
      setGrossWeight(initialItem.grossWeight.toString());
      setImpurityWeight(initialItem.impurityWeight.toString());
      setPurityCarat(initialItem.purityCarat);
      setGoldRate(initialItem.goldRate);
      setNotes(initialItem.notes || '');
    } else {
      setDescription('');
      setArticlesCount(1);
      setGrossWeight('');
      setImpurityWeight('0');
      setPurityCarat(22);
      setGoldRate(defaultGoldRate);
      setNotes('');
    }
    setError(null);
  }, [initialItem, isOpen, defaultGoldRate]);

  if (!isOpen) return null;

  const numGross = parseFloat(grossWeight) || 0;
  const numImpurity = parseFloat(impurityWeight) || 0;
  const computedNet = calculateNetWeight(numGross, numImpurity);
  const computedValue = calculateItemValue(computedNet, purityCarat, goldRate, rateBasis);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please enter or select a description for the ornament');
      return;
    }
    if (articlesCount < 1) {
      setError('Number of articles must be at least 1');
      return;
    }
    if (numGross <= 0) {
      setError('Gross weight must be greater than 0 grams');
      return;
    }
    if (numImpurity < 0) {
      setError('Impurity/stone weight cannot be negative');
      return;
    }
    if (numImpurity >= numGross) {
      setError('Impurity weight cannot be greater than or equal to Gross weight');
      return;
    }
    if (purityCarat <= 0 || purityCarat > 24) {
      setError('Purity must be between 0 and 24 carats');
      return;
    }
    if (goldRate <= 0) {
      setError('Gold rate must be greater than 0');
      return;
    }

    const item: JewelleryItem = {
      id: initialItem ? initialItem.id : `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      srNo: initialItem ? initialItem.srNo : existingCount + 1,
      description: description.trim(),
      articlesCount: Math.round(articlesCount),
      grossWeight: Number(numGross.toFixed(3)),
      impurityWeight: Number(numImpurity.toFixed(3)),
      netWeight: computedNet,
      purityCarat: Number(purityCarat),
      goldRate: Number(goldRate),
      ornamentValue: computedValue,
      notes: notes.trim(),
    };

    onSave(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#2c1a0e] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold tracking-tight">
              {initialItem ? 'Edit Jewellery Item' : 'Add Jewellery Ornament'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Preset Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
              Quick Presets
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_ORNAMENTS.slice(0, 8).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDescription(preset)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                    description === preset
                      ? 'bg-amber-100 text-amber-900 border-amber-400 font-semibold'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Description & Articles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Description of Gold Ornaments <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 22K Designer Gold Necklace"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none text-sm font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                No. of Articles (Pcs) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={articlesCount}
                onChange={(e) => setArticlesCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none text-sm font-medium tabular-nums"
                required
              />
            </div>
          </div>

          {/* Weight Calculations: Gross, Stone/Impurity, Net */}
          <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3">
            <div className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Weight Details (In Grams)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Gross Weight (g) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(e.target.value)}
                  placeholder="0.000"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none text-sm font-medium tabular-nums"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Stone / Impurity Wt (g)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={impurityWeight}
                  onChange={(e) => setImpurityWeight(e.target.value)}
                  placeholder="0.000"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none text-sm font-medium tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Net Gold Weight (g)
                </label>
                <div className="w-full px-3 py-2 bg-amber-100/70 border border-amber-300 rounded-lg text-sm font-bold text-amber-950 tabular-nums">
                  {formatWeight(computedNet)}
                </div>
              </div>
            </div>
          </div>

          {/* Purity & Gold Rate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Purity (Carat) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-5 gap-1.5 mb-2">
                {PURITY_PRESETS.map((p) => (
                  <button
                    key={p.carat}
                    type="button"
                    onClick={() => setPurityCarat(p.carat)}
                    className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      purityCarat === p.carat
                        ? 'bg-[#2c1a0e] text-white border-[#2c1a0e]'
                        : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200'
                    }`}
                  >
                    {p.carat}K
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">Custom Carat:</span>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="24"
                  value={purityCarat}
                  onChange={(e) => setPurityCarat(parseFloat(e.target.value) || 22)}
                  className="w-24 px-2 py-1 border border-neutral-300 rounded text-xs tabular-nums text-center font-bold"
                />
                <span className="text-xs text-neutral-500">
                  {purityCarat === 22
                    ? '(91.6% Hallmark)'
                    : purityCarat === 24
                    ? '(99.9% Pure)'
                    : purityCarat === 18
                    ? '(75.0% Fine)'
                    : `${((purityCarat / 24) * 100).toFixed(1)}% pure`}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-neutral-700">
                  Gold Rate (₹ per gram) <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-neutral-500">
                  {rateBasis === 'per_purity' ? 'Rate for stated purity' : '24K benchmark rate'}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-bold text-sm">₹</span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={goldRate}
                  onChange={(e) => setGoldRate(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 7450"
                  className="w-full pl-8 pr-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none text-sm font-medium tabular-nums"
                  required
                />
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                {rateBasis === 'per_purity'
                  ? `Value = ${computedNet.toFixed(3)}g × ₹${goldRate}`
                  : `Value = ${computedNet.toFixed(3)}g × (${purityCarat}/24) × ₹${goldRate}`}
              </p>
            </div>
          </div>

          {/* Live Valuation Box */}
          <div className="p-4 bg-linear-to-r from-amber-500/10 to-amber-700/10 border border-amber-300 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Calculated Ornament Value
              </div>
              <div className="text-xs text-neutral-600">
                Based on {computedNet.toFixed(3)}g Net Weight at {purityCarat}K
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-[#2c1a0e] tabular-nums">
                {formatIndianCurrency(computedValue, true)}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Item Notes / Hallmarking Marks (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. BIS HUID hallmarked, enamel work, minor polish wear"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#2c1a0e] text-white hover:bg-[#3d2314] rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all"
            >
              {initialItem ? 'Update Item' : 'Add Item to Valuation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
