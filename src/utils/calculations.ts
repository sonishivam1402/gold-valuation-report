import { JewelleryItem, RateBasis, ReportTotals } from '../types';

/**
 * Calculates net weight: Gross Weight - Impurity/Stone Weight
 * Ensures result is never negative and rounded to 3 decimal places (jewellery standard).
 */
export function calculateNetWeight(grossWeight: number, impurityWeight: number): number {
  const gross = Math.max(0, Number(grossWeight) || 0);
  const impurity = Math.max(0, Number(impurityWeight) || 0);
  const net = Math.max(0, gross - impurity);
  return Number(net.toFixed(3));
}

/**
 * Calculates item valuation based on rate basis
 * Rule:
 * 1. If rate basis is 'per_purity' (rate for stated purity):
 *    Value = Net Weight × Gold Rate
 * 2. If rate basis is '24k_reference' (rate is 24K benchmark):
 *    Value = Net Weight × (Purity / 24) × 24K Gold Rate
 */
export function calculateItemValue(
  netWeight: number,
  purityCarat: number,
  goldRate: number,
  rateBasis: RateBasis
): number {
  const net = Math.max(0, Number(netWeight) || 0);
  const purity = Math.min(24, Math.max(0, Number(purityCarat) || 0));
  const rate = Math.max(0, Number(goldRate) || 0);

  let rawValue = 0;
  if (rateBasis === 'per_purity') {
    rawValue = net * rate;
  } else {
    // 24-carat benchmark rate
    rawValue = net * (purity / 24) * rate;
  }

  // Rounded to 2 decimal places for currency
  return Math.round(rawValue * 100) / 100;
}

/**
 * Recalculates all totals for a list of items
 */
export function calculateReportTotals(items: JewelleryItem[]): ReportTotals {
  let articlesCount = 0;
  let grossWeight = 0;
  let impurityWeight = 0;
  let netWeight = 0;
  let totalValue = 0;

  for (const item of items) {
    articlesCount += Number(item.articlesCount) || 0;
    grossWeight += Number(item.grossWeight) || 0;
    impurityWeight += Number(item.impurityWeight) || 0;
    netWeight += Number(item.netWeight) || 0;
    totalValue += Number(item.ornamentValue) || 0;
  }

  return {
    articlesCount,
    grossWeight: Number(grossWeight.toFixed(3)),
    impurityWeight: Number(impurityWeight.toFixed(3)),
    netWeight: Number(netWeight.toFixed(3)),
    totalValue: Math.round(totalValue * 100) / 100,
  };
}

/**
 * Format currency in Indian standard numbering (Lakhs and Crores)
 * e.g. ₹ 1,45,200.00
 */
export function formatIndianCurrency(amount: number, includeDecimals = true): string {
  const val = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(val);
}

/**
 * Format currency specifically for PDF generators using standard Latin-1 'Rs.' prefix.
 * Default PDF fonts (Helvetica) do not support the unicode Indian Rupee symbol (₹ / U+20B9)
 * and corrupt it into '¹' (superscript 1).
 */
export function formatCurrencyForPDF(amount: number, includeDecimals = true): string {
  const val = Number(amount) || 0;
  const numStr = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(val);
  return `Rs. ${numStr}`;
}

/**
 * Format weights in grams with 3 decimal precision
 */
export function formatWeight(weight: number): string {
  const val = Number(weight) || 0;
  return val.toFixed(3) + ' g';
}

/**
 * Validate Indian Mobile Number
 * Returns true if valid 10-digit number optionally prefixed with +91 or 0
 */
export function validateIndianMobile(mobile: string): { isValid: boolean; cleaned: string; error?: string } {
  if (!mobile || !mobile.trim()) {
    return { isValid: false, cleaned: '', error: 'Mobile number is required' };
  }

  // Remove spaces, hyphens, parentheses
  const cleaned = mobile.replace(/[\s\-\(\)]/g, '');

  // Extract the 10 digits
  let tenDigits = cleaned;
  if (cleaned.startsWith('+91')) {
    tenDigits = cleaned.slice(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    tenDigits = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    tenDigits = cleaned.slice(1);
  }

  // Check if exactly 10 digits and starts with 6, 7, 8, or 9
  const indianMobileRegex = /^[6-9]\d{9}$/;
  if (!indianMobileRegex.test(tenDigits)) {
    return {
      isValid: false,
      cleaned: tenDigits,
      error: 'Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9)',
    };
  }

  return { isValid: true, cleaned: tenDigits };
}

/**
 * Format an Indian mobile number for display: 98982 94948
 */
export function formatMobileDisplay(mobile: string): string {
  const { cleaned } = validateIndianMobile(mobile);
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return mobile;
}

/**
 * Format date to standard Indian display: DD/MM/YYYY
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-');
    if (year && month && day) {
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Convert number to words in Indian Rupees (e.g. for official valuation totals)
 */
export function numberToIndianWords(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded === 0) return 'Zero Rupees Only';

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n: number): string {
    if (n === 0) return '';
    if (n < 10) return units[n];
    if (n >= 10 && n < 20) return teens[n - 10];
    const unitPart = n % 10 !== 0 ? ' ' + units[n % 10] : '';
    return tens[Math.floor(n / 10)] + unitPart;
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let res = '';
    if (hundred > 0) {
      res += units[hundred] + ' Hundred';
      if (rest > 0) res += ' and ';
    }
    if (rest > 0) {
      res += convertTwoDigits(rest);
    }
    return res;
  }

  let num = rounded;
  let result = '';

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundred = num;

  if (crore > 0) {
    result += convertTwoDigits(crore) + ' Crore ';
  }
  if (lakh > 0) {
    result += convertTwoDigits(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    result += convertTwoDigits(thousand) + ' Thousand ';
  }
  if (hundred > 0) {
    result += convertThreeDigits(hundred) + ' ';
  }

  return 'Rupees ' + result.trim() + ' Only';
}
