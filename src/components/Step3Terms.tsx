import React from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck, CheckSquare, Square, FileText } from 'lucide-react';

interface Step3TermsProps {
  termsList: string[];
  termsAccepted: boolean;
  onToggleAccepted: (accepted: boolean) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const Step3Terms: React.FC<Step3TermsProps> = ({
  termsList,
  termsAccepted,
  onToggleAccepted,
  onContinue,
  onBack,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="border-b border-neutral-100 pb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-700" />
          <h2 className="text-xl font-bold text-[#2c1a0e] tracking-tight">
            Step 3 — Disclaimer & Terms and Conditions
          </h2>
        </div>
        <p className="text-sm text-neutral-500 mt-1">
          These standardized legal clauses protect both the customer and Shivam Jewellers & Finance. All terms will be printed clearly in English on the final valuation certificate.
        </p>
      </div>

      {/* Terms Box */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
          <div className="text-xs font-bold text-[#2c1a0e] uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-700" />
            DISCLAIMER & TERMS AND CONDITIONS (ENGLISH)
          </div>
          <span className="text-xs text-neutral-500">Standard terms</span>
        </div>

        <ol className="space-y-3 text-xs text-neutral-700 leading-relaxed list-none">
          {termsList.map((term, index) => (
            <li key={index} className="flex gap-2.5">
              <span className="font-bold text-[#2c1a0e] shrink-0 w-5">
                {index + 1}.
              </span>
              <span>{term}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Confirmation & Inclusion Checkboxes */}
      <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-xl space-y-3">
        <label
          onClick={() => onToggleAccepted(!termsAccepted)}
          className="flex items-start gap-3 cursor-pointer select-none group"
        >
          <div className="mt-0.5 text-amber-800">
            {termsAccepted ? (
              <CheckSquare className="w-5 h-5 text-amber-800 fill-amber-100" />
            ) : (
              <Square className="w-5 h-5 text-neutral-400 group-hover:text-amber-700" />
            )}
          </div>
          <div>
            <div className="text-sm font-bold text-neutral-900">
              I confirm that the valuation details have been reviewed and agree that the terms and conditions above will appear on the final document.
            </div>
            <div className="text-xs text-neutral-600 mt-0.5">
              Required before generating the final signed valuation report for the customer.
            </div>
          </div>
        </label>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 border border-neutral-300 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Jewellery Details</span>
        </button>

        <button
          type="button"
          disabled={!termsAccepted}
          onClick={onContinue}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all ${
            !termsAccepted
              ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
              : 'bg-[#2c1a0e] text-white hover:bg-[#3d2314] hover:shadow-lg cursor-pointer'
          }`}
        >
          <span>Proceed to Preview & Generate</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
