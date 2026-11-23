import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Calculator,
  Scale,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Coins,
  ChevronRight,
  PhoneCall,
} from 'lucide-react';
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

      {/* =========================================================================
          CENTRAL & STATE AGRICULTURAL WELFARE SCHEMES DIRECTORY
          Fills remaining vertical space with statutory welfare framework
          ========================================================================= */}
      <div className="space-y-4 pt-4 border-t-2 border-paper-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-clay-700 font-mono block">
              संबद्ध केंद्रीय एवं राज्य कृषि कल्याण योजनाएं
            </span>
            <h3 className="font-serif font-bold text-lg text-indigo-950">
              प्रत्यक्ष लाभ हस्तांतरण (DBT) व अनुदान अधिकार नियमावली
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-sage-800 bg-sage-50 px-2.5 py-1 border border-sage-600 rounded-xs">
            <Sparkles className="w-3.5 h-3.5 text-saffron-500 shrink-0" />
            <span>100% आधार सीडेड सीधी सब्सिडी</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-4 shadow-hard flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-clay-100 text-clay-700 border border-clay-600 rounded-xs">
                केंद्र सरकार
              </span>
              <h4 className="font-bold text-sm text-indigo-950">PM-KISAN सम्मान निधि</h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                ₹6,000 वार्षिक वित्तीय सहायता तीन बराबर किस्तों (₹2,000 प्रत्येक) में सीधे बैंक खाते में DBT।
              </p>
            </div>
            <div className="mt-3 pt-2 text-[11px] font-bold text-sage-800 border-t border-paper-200">
              ✓ 19वीं किस्त जारी
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-4 shadow-hard flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-saffron-100 text-saffron-800 border border-saffron-600 rounded-xs">
                महाराष्ट्र शासन
              </span>
              <h4 className="font-bold text-sm text-indigo-950">नमो शेतकरी महा-सम्मान</h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                राज्य सरकार द्वारा अतिरिक्त ₹6,000 प्रति वर्ष (PM-KISAN के साथ कुल ₹12,000 वार्षिक सहायता)।
              </p>
            </div>
            <div className="mt-3 pt-2 text-[11px] font-bold text-sage-800 border-t border-paper-200">
              ✓ स्वचालित राज्य मिलान
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-4 shadow-hard flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-sage-100 text-sage-800 border border-sage-600 rounded-xs">
                फसल सुरक्षा
              </span>
              <h4 className="font-bold text-sm text-indigo-950">PMFBY फसल बीमा</h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                खरीफ में 2% एवं रबी में 1.5% नाममात्र प्रीमियम पर प्राकृतिक आपदाओं से संपूर्ण आर्थिक सुरक्षा।
              </p>
            </div>
            <div className="mt-3 pt-2 text-[11px] font-bold text-indigo-900 border-t border-paper-200">
              ✓ 72 घंटे में क्षति सर्वे
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-4 shadow-hard flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-rust-100 text-rust-800 border border-rust-600 rounded-xs">
                सिंचाई अनुदान
              </span>
              <h4 className="font-bold text-sm text-indigo-950">PM कृषि सिंचाई (PMKSY)</h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                ड्रिप एवं स्प्रिंकलर सूक्ष्म-सिंचाई यंत्रों की स्थापना पर लघु व सीमांत किसानों को 55% सीधी सब्सिडी।
              </p>
            </div>
            <div className="mt-3 pt-2 text-[11px] font-bold text-clay-700 border-t border-paper-200">
              ✓ महाडीबीटी पोर्टल लिंक
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          NATIONAL AGRICULTURE MARKET (e-NAM) & APMC MANDI LIVE RATES
          ========================================================================= */}
      <div className="bg-paper-50 border-2 border-indigo-900 rounded-sm p-5 shadow-hard-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-paper-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-clay-700 block font-mono">
              राष्ट्रीय कृषि बाजार (e-NAM) मंडी बोर्ड
            </span>
            <h3 className="font-serif font-bold text-lg text-indigo-950">
              कृषि उपज मंडी समिति (APMC) वर्धा — दैनिक फसल व्यापार दरें
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-950 bg-paper-100 px-3 py-1.5 border border-indigo-900 rounded-xs">
            <PhoneCall className="w-3.5 h-3.5 text-clay-600 shrink-0" />
            <span>मंडी सचिव कार्यालय: 07152-242099</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-paper-100 rounded-sm border border-paper-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-950 text-sm">सोयाबीन (पीला)</span>
              <span className="font-bold text-sage-700 font-mono">₹4,892 / क्विंटल</span>
            </div>
            <div className="text-[11px] text-ink-muted">सरकारी MSP: ₹4,892/qtl • आज की आवक: 1,420 क्विंटल</div>
            <div className="text-[11px] text-sage-800 font-semibold pt-1">
              ✓ MSP वैधानिक न्यूनतम मूल्य पर पूर्ण खरीद
            </div>
          </div>

          <div className="p-3.5 bg-paper-100 rounded-sm border border-paper-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-950 text-sm">कपास (मध्यम रेशा BT)</span>
              <span className="font-bold text-sage-700 font-mono">₹7,121 / क्विंटल</span>
            </div>
            <div className="text-[11px] text-ink-muted">सरकारी MSP: ₹7,121/qtl • आज की आवक: 2,150 क्विंटल</div>
            <div className="text-[11px] text-sage-800 font-semibold pt-1">
              ✓ CCI (Cotton Corp of India) खरीद केंद्र सक्रिय
            </div>
          </div>

          <div className="p-3.5 bg-paper-100 rounded-sm border border-paper-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-950 text-sm">चना / देसी चना</span>
              <span className="font-bold text-sage-700 font-mono">₹5,440 / क्विंटल</span>
            </div>
            <div className="text-[11px] text-ink-muted">सरकारी MSP: ₹5,440/qtl • आज की आवक: 820 क्विंटल</div>
            <div className="text-[11px] text-sage-800 font-semibold pt-1">
              ✓ NAFED खरीद पंजीयन काउंटर खुला
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
