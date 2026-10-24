import React from 'react';
import { User, Sparkles, ShieldCheck, FileCheck } from 'lucide-react';

interface StepProgressBarProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  completedSteps: number[];
}

const STEPS = [
  { step: 1, title: 'Customer Details', subtitle: 'Name, mobile, address', icon: User },
  { step: 2, title: 'Jewellery Details', subtitle: 'Ornaments, weights, rates', icon: Sparkles },
  { step: 3, title: 'Terms & Conditions', subtitle: 'Short English disclaimer', icon: ShieldCheck },
  { step: 4, title: 'Preview & Generate', subtitle: 'A4 print & PDF export', icon: FileCheck },
];

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  currentStep,
  onSelectStep,
  completedSteps,
}) => {
  return (
    <div className="w-full bg-white border border-neutral-200/80 rounded-xl p-3 md:p-4 shadow-xs">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.step;
          const isCompleted = completedSteps.includes(s.step);
          const isClickable = isCompleted || s.step <= currentStep;

          return (
            <button
              key={s.step}
              type="button"
              disabled={!isClickable}
              onClick={() => onSelectStep(s.step)}
              className={`flex items-center gap-3 p-2.5 rounded-lg text-left transition-all relative ${
                isActive
                  ? 'bg-amber-50/80 border border-amber-300 text-amber-950 shadow-xs'
                  : isCompleted
                  ? 'hover:bg-neutral-50 text-neutral-800 cursor-pointer'
                  : 'opacity-60 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs transition-colors ${
                  isActive
                    ? 'bg-[#2c1a0e] text-amber-400 shadow-xs'
                    : isCompleted
                    ? 'bg-amber-600 text-white'
                    : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                {isCompleted && !isActive ? '✓' : s.step}
              </div>

              <div className="min-w-0">
                <div className="text-xs font-bold leading-tight truncate">
                  {s.title}
                </div>
                <div className="text-[11px] text-neutral-500 truncate hidden sm:block">
                  {s.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
