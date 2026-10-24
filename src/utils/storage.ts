import { ShopSettings, ValuationReport } from '../types';

export const DEFAULT_TERMS: string[] = [
  'This valuation is an estimate for the stated date only and is not proof of ownership, insurance cover, or a loan guarantee.',
  'Value may change if weight or purity differs from the details recorded. Later gold-price changes are not the shop\'s responsibility.',
  'Please verify the recorded details before accepting this report.',
];

const LEGACY_TERMS_START =
  'This valuation is an estimate based on the gold rate and market conditions applicable on the valuation date.';

/** Use the short default when saved terms are still the old six-clause set. */
export function resolveTerms(terms?: string[] | null): string[] {
  if (!terms || terms.length === 0) return DEFAULT_TERMS;
  if (terms.length >= 6 && terms[0].startsWith(LEGACY_TERMS_START)) {
    return DEFAULT_TERMS;
  }
  if (terms.some((term) => term.includes('\u2019'))) {
    return DEFAULT_TERMS;
  }
  return terms;
}

export const DEFAULT_SETTINGS: ShopSettings = {
  businessName: 'Shivam Jewellers & Finance',
  tagline: 'GOLD & SILVER ORNAMENTS',
  proprietor: 'Sanjay B. Soni',
  mobile: '98982 94948',
  address: 'Shop No. 3, Shree Ram Appt., Near Ranchhodji Mandir, Lakdipool, Dandia Bazar, Vadodara – 390001.',
  email: '',
  gstNumber: '',
  letterheadImageUrl: '/assets/aistudio/file_000000002c388246a9e9ff7ee7740dce_6c627e21.png',
  defaultGoldRate: 7450,
  defaultRateBasis: 'per_purity',
  reportPrefix: 'SJF/VAL/',
  nextReportSeq: 101,
  defaultTerms: DEFAULT_TERMS,
  signatureTitle: 'Proprietor / Authorized Signatory',
  defaultPrintMode: 'full',
};

const SETTINGS_KEY = 'sjf_shop_settings_v1';
const REPORTS_KEY = 'sjf_saved_reports_v1';
const DRAFT_KEY = 'sjf_active_draft_v1';

export function getShopSettings(): ShopSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        defaultTerms: resolveTerms(parsed.defaultTerms),
      };
    }
  } catch (err) {
    console.warn('Failed to parse settings from storage:', err);
  }
  return DEFAULT_SETTINGS;
}

export function saveShopSettings(settings: ShopSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function getSavedReports(): ValuationReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        return list;
      }
    }
  } catch (err) {
    console.warn('Failed to parse saved reports:', err);
  }
  return [];
}

export function saveReportToHistory(report: ValuationReport): void {
  try {
    const current = getSavedReports();
    const existingIndex = current.findIndex((r) => r.id === report.id);
    let updated: ValuationReport[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...report, updatedAt: new Date().toISOString() };
    } else {
      updated = [{ ...report, updatedAt: new Date().toISOString() }, ...current];
    }
    localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));

    // Increment next report sequence if matching current prefix
    const settings = getShopSettings();
    if (report.reportNumber.startsWith(settings.reportPrefix)) {
      const seqStr = report.reportNumber.slice(settings.reportPrefix.length);
      const seqNum = parseInt(seqStr, 10);
      if (!isNaN(seqNum) && seqNum >= settings.nextReportSeq) {
        saveShopSettings({
          ...settings,
          nextReportSeq: seqNum + 1,
        });
      }
    }
  } catch (err) {
    console.error('Failed to save report to history:', err);
  }
}

export function deleteReportFromHistory(id: string): void {
  try {
    const current = getSavedReports();
    const filtered = current.filter((r) => r.id !== id);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete report:', err);
  }
}

export function getActiveDraft(): ValuationReport | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to read draft:', err);
  }
  return null;
}

export function saveActiveDraft(draft: ValuationReport): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, updatedAt: new Date().toISOString() }));
  } catch (err) {
    console.error('Failed to save draft:', err);
  }
}

export function clearActiveDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (err) {
    console.error('Failed to clear draft:', err);
  }
}

/**
 * Generate a new sequential report number
 */
export function getNextReportNumber(settings: ShopSettings): string {
  const year = new Date().getFullYear();
  const seq = String(settings.nextReportSeq || 101).padStart(4, '0');
  return `${settings.reportPrefix}${year}/${seq}`;
}

/**
 * Export all local data as a JSON file backup
 */
export function exportDataBackup(): void {
  const data = {
    appName: 'Shivam Jewellers & Finance Valuation System',
    exportDate: new Date().toISOString(),
    settings: getShopSettings(),
    reports: getSavedReports(),
    draft: getActiveDraft(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Shivam_Jewellers_Valuation_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import data from a backup JSON file
 */
export function importDataBackup(jsonString: string): { success: boolean; count: number; message: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, count: 0, message: 'Invalid JSON file format.' };
    }
    if (parsed.settings) {
      saveShopSettings(parsed.settings);
    }
    if (Array.isArray(parsed.reports)) {
      localStorage.setItem(REPORTS_KEY, JSON.stringify(parsed.reports));
      return {
        success: true,
        count: parsed.reports.length,
        message: `Successfully imported ${parsed.reports.length} valuation reports and updated settings.`,
      };
    }
    return { success: false, count: 0, message: 'No valid report records found in file.' };
  } catch (err: any) {
    return { success: false, count: 0, message: err.message || 'Error parsing backup file.' };
  }
}
