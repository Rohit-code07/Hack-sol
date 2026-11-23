import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calculator, Scale, ShieldCheck } from 'lucide-react';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import PageHeader from '../../../components/common/PageHeader';
import Tabs from '../../../components/common/Tabs';
import KCCCalculatorTab from './KCCCalculatorTab';
import MSPVerifierTab from './MSPVerifierTab';
import InsuranceReconcilerTab from './InsuranceReconcilerTab';

/**
 * Farmer Entitlement Center hosting KCC Calculator, MSP Verifier, and Insurance Reconciler.
 * Tab changes trigger a clean 250ms fade-up (M3.6).
 */
export default function EntitlementCenter() {
  const { t } = useTranslation();
  useDocumentTitle('entitlements.title', 'Farmer Entitlement Center');
  const [searchParams, setSearchParams] = useSearchParams();

  const currentTab = searchParams.get('tab') || 'kcc';

  const setTab = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  const tabs = [
    { id: 'kcc', label: t('entitlements.tabKCC', 'KCC Calculator'), icon: <Calculator className="w-4 h-4" /> },
    { id: 'msp', label: t('entitlements.tabMSP', 'MSP Verifier'), icon: <Scale className="w-4 h-4" /> },
    { id: 'insurance', label: t('entitlements.tabInsurance', 'Crop Insurance Reconciler'), icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        eyebrow={t('entitlements.eyebrow', 'Welfare & Subsidy Entitlements')}
        title={t('entitlements.title', 'Farmer Entitlement Center')}
        subtitle={t('entitlements.subtitle', 'Live statutory calculators for KCC credit limits, minimum support price, and insurance reconciliation.')}
      />

      {/* Accessible Shared Tabs with sliding underline (M1.3, M3.6) */}
      <Tabs
        tabs={tabs}
        activeTab={currentTab}
        onChange={(tabId) => setTab(tabId)}
      />

      {/* Tab Panels with 250ms fade-up on tab change (M3.6) */}
      <div
        key={currentTab}
        role="tabpanel"
        id={`panel-${currentTab}`}
        aria-labelledby={`tab-${currentTab}`}
        tabIndex={0}
        className="focus:outline-none pt-2 animate-fade-up [animation-duration:250ms]"
      >
        {currentTab === 'kcc' && <KCCCalculatorTab />}
        {currentTab === 'msp' && <MSPVerifierTab />}
        {currentTab === 'insurance' && <InsuranceReconcilerTab />}
      </div>
    </div>
  );
}
