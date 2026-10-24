import React, { useState } from 'react';
import { CustomerDetails } from '../types';
import { validateIndianMobile, formatMobileDisplay } from '../utils/calculations';
import { User, Phone, MapPin, Calendar, ArrowRight, CheckCircle2, History } from 'lucide-react';
import { getSavedReports } from '../utils/storage';

interface Step1CustomerProps {
  customer: CustomerDetails;
  onUpdate: (customer: CustomerDetails) => void;
  onContinue: () => void;
}

export const Step1Customer: React.FC<Step1CustomerProps> = ({
  customer,
  onUpdate,
  onContinue,
}) => {
  const [touched, setTouched] = useState({
    name: false,
    address: false,
    mobile: false,
    valuationDate: false,
  });

  const recentReports = getSavedReports();
  // Unique recent customers
  const recentCustomers = Array.from(
    new Map(
      recentReports
        .filter((r) => r.customer?.name && r.customer?.mobile)
        .map((r) => [r.customer.mobile, r.customer])
    ).values()
  ).slice(0, 4);

  const mobileValidation = validateIndianMobile(customer.mobile);

  const isNameValid = customer.name.trim().length >= 2;
  const isAddressValid = customer.address.trim().length >= 5;
  const isMobileValid = mobileValidation.isValid;
  const isDateValid = Boolean(customer.valuationDate);

  const canContinue = isNameValid && isAddressValid && isMobileValid && isDateValid;

  const handleSetToday = () => {
    const today = new Date().toISOString().split('T')[0];
    onUpdate({ ...customer, valuationDate: today });
  };

  const handlePrefill = (recent: CustomerDetails) => {
    onUpdate({
      ...customer,
      name: recent.name,
      address: recent.address,
      mobile: recent.mobile,
    });
    setTouched({
      name: true,
      address: true,
      mobile: true,
      valuationDate: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      name: true,
      address: true,
      mobile: true,
      valuationDate: true,
    });

    if (canContinue) {
      onContinue();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-6 md:p-8 max-w-3xl mx-auto">
      <div className="border-b border-neutral-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#2c1a0e] tracking-tight">
            Step 1 — Customer Details
          </h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            Enter the customer's personal details for the official valuation record.
          </p>
        </div>

        {recentCustomers.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <History className="w-3.5 h-3.5 text-amber-600" />
            <span>Recent:</span>
            <div className="flex flex-wrap gap-1">
              {recentCustomers.map((c) => (
                <button
                  key={c.mobile}
                  type="button"
                  onClick={() => handlePrefill(c)}
                  className="px-2 py-0.5 bg-neutral-100 hover:bg-amber-100 hover:text-amber-900 border border-neutral-200 rounded text-xs transition-colors"
                >
                  {c.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Full Name */}
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-amber-700" />
              Customer Name <span className="text-red-500">*</span>
            </span>
            {touched.name && isNameValid && (
              <span className="text-xs text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Valid
              </span>
            )}
          </label>
          <input
            type="text"
            value={customer.name}
            onChange={(e) => onUpdate({ ...customer, name: e.target.value })}
            onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
            placeholder="e.g. Rajeshbhai M. Patel"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-all outline-none ${
              touched.name && !isNameValid
                ? 'border-red-300 bg-red-50/40 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : 'border-neutral-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20'
            }`}
            required
          />
          {touched.name && !isNameValid && (
            <p className="text-xs text-red-600 mt-1">Please enter the customer's full name (at least 2 letters).</p>
          )}
        </div>

        {/* Mobile Number & Valuation Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-amber-700" />
                Mobile Number <span className="text-red-500">*</span>
              </span>
              {customer.mobile && isMobileValid && (
                <span className="text-xs text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {formatMobileDisplay(customer.mobile)}
                </span>
              )}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 text-xs font-semibold">
                +91
              </span>
              <input
                type="tel"
                value={customer.mobile}
                onChange={(e) => onUpdate({ ...customer, mobile: e.target.value })}
                onBlur={() => setTouched((prev) => ({ ...prev, mobile: true }))}
                placeholder="98982 94948"
                maxLength={15}
                className={`w-full pl-12 pr-4 py-2.5 rounded-xl border text-sm font-medium tabular-nums transition-all outline-none ${
                  touched.mobile && !isMobileValid
                    ? 'border-red-300 bg-red-50/40 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-neutral-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20'
                }`}
                required
              />
            </div>
            {touched.mobile && !isMobileValid && (
              <p className="text-xs text-red-600 mt-1">
                {mobileValidation.error || 'Enter a valid 10-digit Indian mobile number.'}
              </p>
            )}
            <p className="text-[11px] text-neutral-500 mt-1">
              Standard 10-digit mobile number for report reference & SMS sharing.
            </p>
          </div>

          {/* Valuation Date */}
          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-700" />
                Valuation Date <span className="text-red-500">*</span>
              </span>
              <button
                type="button"
                onClick={handleSetToday}
                className="text-xs text-amber-700 hover:text-amber-900 font-semibold underline decoration-dotted"
              >
                Set Today
              </button>
            </label>
            <input
              type="date"
              value={customer.valuationDate}
              onChange={(e) => onUpdate({ ...customer, valuationDate: e.target.value })}
              onBlur={() => setTouched((prev) => ({ ...prev, valuationDate: true }))}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-all outline-none ${
                touched.valuationDate && !isDateValid
                  ? 'border-red-300 bg-red-50/40 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-neutral-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20'
              }`}
              required
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Date on which the gold rates and physical ornament inspection are applicable.
            </p>
          </div>
        </div>

        {/* Full Residential / Business Address */}
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-700" />
              Full Address <span className="text-red-500">*</span>
            </span>
            {touched.address && isAddressValid && (
              <span className="text-xs text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Valid
              </span>
            )}
          </label>
          <textarea
            rows={3}
            value={customer.address}
            onChange={(e) => onUpdate({ ...customer, address: e.target.value })}
            onBlur={() => setTouched((prev) => ({ ...prev, address: true }))}
            placeholder="Flat / House No., Society / Apartment, Area, City, Pin code (e.g. 14, Shreenathji Residency, Alkapuri, Vadodara – 390007)"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-all outline-none resize-none ${
              touched.address && !isAddressValid
                ? 'border-red-300 bg-red-50/40 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : 'border-neutral-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20'
            }`}
            required
          />
          {touched.address && !isAddressValid && (
            <p className="text-xs text-red-600 mt-1">Please enter full address details for legal valuation verification.</p>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            All fields marked with <span className="text-red-500 font-bold">*</span> are required
          </span>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-[#2c1a0e] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#3d2314] hover:shadow-lg transition-all cursor-pointer"
          >
            <span>Save & Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
