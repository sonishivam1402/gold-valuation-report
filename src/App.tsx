import React, { useState, useEffect } from 'react';
import { CustomerDetails, JewelleryItem, RateBasis, ReportTotals, ShopSettings, ValuationReport } from './types';
import {
  calculateReportTotals,
  calculateItemValue,
} from './utils/calculations';
import {
  clearActiveDraft,
  DEFAULT_SETTINGS,
  DEFAULT_TERMS,
  deleteReportFromHistory,
  getActiveDraft,
  getNextReportNumber,
  getSavedReports,
  getShopSettings,
  resolveTerms,
  saveActiveDraft,
  saveReportToHistory,
  saveShopSettings,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { StepProgressBar } from './components/StepProgressBar';
import { Step1Customer } from './components/Step1Customer';
import { Step2Jewellery } from './components/Step2Jewellery';
import { Step3Terms } from './components/Step3Terms';
import { Step4Preview } from './components/Step4Preview';
import { ReportsHistory } from './components/ReportsHistory';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [settings, setSettings] = useState<ShopSettings>(() => getShopSettings());
  const [reports, setReports] = useState<ValuationReport[]>(() => {
    const list = getSavedReports();
    if (list.length === 0) {
      // Seed initial sample report for demonstration
      const initialReport: ValuationReport = {
        id: 'sample_report_01',
        reportNumber: 'SJF/VAL/2026/0101',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        customer: {
          name: 'Hareshbhai V. Soni',
          address: '42, Laxmi Vilas Society, Near Khanderao Market, Dandia Bazar, Vadodara – 390001',
          mobile: '98251 45678',
          valuationDate: new Date().toISOString().split('T')[0],
        },
        items: [
          {
            id: 'item_sample_1',
            srNo: 1,
            description: '22K Hallmarked Gold Bangles (Pair)',
            articlesCount: 2,
            grossWeight: 34.55,
            impurityWeight: 0.85,
            netWeight: 33.7,
            purityCarat: 22,
            goldRate: 7450,
            ornamentValue: 251065,
            notes: 'BIS Hallmark 916 with HUID mark',
          },
          {
            id: 'item_sample_2',
            srNo: 2,
            description: '22K Designer Gold Chain',
            articlesCount: 1,
            grossWeight: 18.2,
            impurityWeight: 0.0,
            netWeight: 18.2,
            purityCarat: 22,
            goldRate: 7450,
            ornamentValue: 135590,
            notes: 'Solid casting, excellent condition',
          },
        ],
        rateBasis: 'per_purity',
        goldRateDefault: 7450,
        totals: {
          articlesCount: 3,
          grossWeight: 52.75,
          impurityWeight: 0.85,
          netWeight: 51.9,
          totalValue: 386655,
        },
        remarks: 'Physical gold ornaments tested and verified on digital electronic scale.',
        termsAccepted: true,
        termsList: DEFAULT_TERMS,
        isDraft: false,
        letterheadMode: 'full',
      };
      saveReportToHistory(initialReport);
      return [initialReport];
    }
    return list;
  });

  const [activeTab, setActiveTab] = useState<'new_report' | 'history'>('new_report');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);

  // Current working report state
  const [activeReport, setActiveReport] = useState<ValuationReport>(() => {
    const savedDraft = getActiveDraft();
    if (savedDraft) {
      return {
        ...savedDraft,
        termsList: resolveTerms(savedDraft.termsList),
      };
    }
    const today = new Date().toISOString().split('T')[0];
    const initialSettings = getShopSettings();
    return {
      id: `report_${Date.now()}`,
      reportNumber: getNextReportNumber(initialSettings),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: {
        name: '',
        address: '',
        mobile: '',
        valuationDate: today,
      },
      items: [],
      rateBasis: initialSettings.defaultRateBasis || 'per_purity',
      goldRateDefault: initialSettings.defaultGoldRate || 7450,
      totals: {
        articlesCount: 0,
        grossWeight: 0,
        impurityWeight: 0,
        netWeight: 0,
        totalValue: 0,
      },
      remarks: '',
      termsAccepted: true,
      termsList: resolveTerms(initialSettings.defaultTerms),
      isDraft: true,
      letterheadMode: initialSettings.defaultPrintMode || 'full',
    };
  });

  // Keep active draft stored automatically
  useEffect(() => {
    if (activeReport) {
      saveActiveDraft(activeReport);
    }
  }, [activeReport]);

  const handleUpdateCustomer = (customer: CustomerDetails) => {
    setActiveReport((prev) => ({
      ...prev,
      customer,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleUpdateItems = (items: JewelleryItem[], totals: ReportTotals) => {
    setActiveReport((prev) => ({
      ...prev,
      items,
      totals,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleUpdateRateBasis = (rateBasis: RateBasis) => {
    setActiveReport((prev) => ({
      ...prev,
      rateBasis,
    }));
  };

  const handleUpdateGoldRateDefault = (rate: number) => {
    setActiveReport((prev) => ({
      ...prev,
      goldRateDefault: rate,
    }));
  };

  const handleUpdateRemarks = (remarks: string) => {
    setActiveReport((prev) => ({
      ...prev,
      remarks,
    }));
  };

  const handleToggleTermsAccepted = (accepted: boolean) => {
    setActiveReport((prev) => ({
      ...prev,
      termsAccepted: accepted,
    }));
  };

  const handleUpdateLetterheadMode = (mode: 'full' | 'content_only') => {
    setActiveReport((prev) => ({
      ...prev,
      letterheadMode: mode,
    }));
  };

  const handleStep1Continue = () => {
    if (!completedSteps.includes(1)) {
      setCompletedSteps((prev) => [...prev, 1]);
    }
    setCurrentStep(2);
  };

  const handleStep2Continue = () => {
    if (!completedSteps.includes(2)) {
      setCompletedSteps((prev) => [...prev, 2]);
    }
    setCurrentStep(3);
  };

  const handleStep3Continue = () => {
    if (!completedSteps.includes(3)) {
      setCompletedSteps((prev) => [...prev, 3]);
    }
    setCurrentStep(4);
  };

  const handleSaveToHistory = () => {
    const finalReport: ValuationReport = {
      ...activeReport,
      isDraft: false,
      updatedAt: new Date().toISOString(),
    };
    saveReportToHistory(finalReport);
    setReports(getSavedReports());
    clearActiveDraft();
  };

  const handleSaveDraft = () => {
    saveActiveDraft({
      ...activeReport,
      isDraft: true,
    });
  };

  const handleCreateNewReport = () => {
    const today = new Date().toISOString().split('T')[0];
    const newReport: ValuationReport = {
      id: `report_${Date.now()}`,
      reportNumber: getNextReportNumber(settings),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: {
        name: '',
        address: '',
        mobile: '',
        valuationDate: today,
      },
      items: [],
      rateBasis: settings.defaultRateBasis || 'per_purity',
      goldRateDefault: settings.defaultGoldRate || 7450,
      totals: {
        articlesCount: 0,
        grossWeight: 0,
        impurityWeight: 0,
        netWeight: 0,
        totalValue: 0,
      },
      remarks: '',
      termsAccepted: true,
      termsList: resolveTerms(settings.defaultTerms),
      isDraft: true,
      letterheadMode: settings.defaultPrintMode || 'full',
    };
    setActiveReport(newReport);
    saveActiveDraft(newReport);
    setCurrentStep(1);
    setCompletedSteps([1]);
    setActiveTab('new_report');
  };

  const handleViewReportFromHistory = (report: ValuationReport) => {
    setActiveReport(report);
    setCurrentStep(4);
    setActiveTab('new_report');
  };

  const handleEditReportFromHistory = (report: ValuationReport) => {
    setActiveReport(report);
    setCurrentStep(2);
    setCompletedSteps([1, 2, 3]);
    setActiveTab('new_report');
  };

  const handleDuplicateReportFromHistory = (report: ValuationReport) => {
    const today = new Date().toISOString().split('T')[0];
    const duplicated: ValuationReport = {
      ...report,
      id: `report_${Date.now()}`,
      reportNumber: getNextReportNumber(settings),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: {
        ...report.customer,
        valuationDate: today,
      },
      isDraft: true,
    };
    setActiveReport(duplicated);
    setCurrentStep(2);
    setCompletedSteps([1, 2]);
    setActiveTab('new_report');
  };

  const handleDeleteReport = (id: string) => {
    deleteReportFromHistory(id);
    setReports(getSavedReports());
  };

  const handleSaveSettings = (updated: ShopSettings) => {
    saveShopSettings(updated);
    setSettings(updated);
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col text-neutral-900">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        settings={settings}
        reportsCount={reports.length}
        onOpenSettings={() => setSettingsOpen(true)}
        onQuickNewReport={handleCreateNewReport}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {activeTab === 'new_report' ? (
          <div className="space-y-6">
            {/* Step Progress Navigation (Hidden in print) */}
            <div className="no-print">
              <StepProgressBar
                currentStep={currentStep}
                onSelectStep={setCurrentStep}
                completedSteps={completedSteps}
              />
            </div>

            {/* Step 1: Customer Details */}
            {currentStep === 1 && (
              <Step1Customer
                customer={activeReport.customer}
                onUpdate={handleUpdateCustomer}
                onContinue={handleStep1Continue}
              />
            )}

            {/* Step 2: Jewellery Details */}
            {currentStep === 2 && (
              <Step2Jewellery
                items={activeReport.items}
                rateBasis={activeReport.rateBasis}
                goldRateDefault={activeReport.goldRateDefault}
                remarks={activeReport.remarks}
                totals={activeReport.totals}
                onUpdateItems={handleUpdateItems}
                onUpdateRateBasis={handleUpdateRateBasis}
                onUpdateGoldRateDefault={handleUpdateGoldRateDefault}
                onUpdateRemarks={handleUpdateRemarks}
                onContinue={handleStep2Continue}
                onBack={() => setCurrentStep(1)}
              />
            )}

            {/* Step 3: Terms & Conditions */}
            {currentStep === 3 && (
              <Step3Terms
                termsList={activeReport.termsList}
                termsAccepted={activeReport.termsAccepted}
                onToggleAccepted={handleToggleTermsAccepted}
                onContinue={handleStep3Continue}
                onBack={() => setCurrentStep(2)}
              />
            )}

            {/* Step 4: Preview & Finalize */}
            {currentStep === 4 && (
              <Step4Preview
                report={activeReport}
                settings={settings}
                onEdit={(step) => setCurrentStep(step || 2)}
                onSaveToHistory={handleSaveToHistory}
                onSaveDraft={handleSaveDraft}
                onNewReport={handleCreateNewReport}
                onUpdateLetterheadMode={handleUpdateLetterheadMode}
              />
            )}
          </div>
        ) : (
          /* Reports Archive View */
          <ReportsHistory
            reports={reports}
            settings={settings}
            onViewReport={handleViewReportFromHistory}
            onEditReport={handleEditReportFromHistory}
            onDuplicateReport={handleDuplicateReportFromHistory}
            onDeleteReport={handleDeleteReport}
            onRefreshReports={() => setReports(getSavedReports())}
          />
        )}
      </main>

      {/* Shop Settings Dialog */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
