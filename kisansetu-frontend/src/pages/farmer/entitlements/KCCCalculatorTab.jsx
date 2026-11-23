import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Info, Sliders } from 'lucide-react';
import useDebounce from '../../../hooks/useDebounce';
import { calculateKCC } from '../../../services/entitlementService';
import { formatCurrency } from '../../../utils/formatters';
import { CROPS } from '../../../constants/crops';
import Field from '../../../components/common/Field';
import Panel from '../../../components/common/Panel';
import Spinner from '../../../components/common/Spinner';
import TermHint from '../../../components/common/TermHint';
import CountUp from '../../../components/motion/CountUp';
import useReducedMotion from '../../../hooks/useReducedMotion';

/**
 * KCC Scale of Finance Limit Calculator with live number tweening and breakdown stagger.
 */
export default function KCCCalculatorTab() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const prefersReducedMotion = useReducedMotion();

  // Load from sessionStorage if available
  const [landArea, setLandArea] = useState(() => {
    try {
      return sessionStorage.getItem('ks_kcc_area') || '2.5';
    } catch {
      return '2.5';
    }
  });

  const [cropType, setCropType] = useState(() => {
    try {
      return sessionStorage.getItem('ks_kcc_crop') || 'Soybean';
    } catch {
      return 'Soybean';
    }
  });

  const [season, setSeason] = useState('Kharif');
  const [result, setResult] = useState(null);
  const [calculating, setCalculating] = useState(false);

  const debouncedArea = useDebounce(landArea, 300);
  const debouncedCrop = useDebounce(cropType, 300);
  const debouncedSeason = useDebounce(season, 300);

  const cropOptions = CROPS.map((c) => ({
    value: c.id,
    label: i18n.language === 'hi' ? c.hi : c.en,
  }));

  const seasonOptions = [
    { value: 'Kharif', label: t('entitlements.seasonKharif', 'Kharif (खरीफ)') },
    { value: 'Rabi', label: t('entitlements.seasonRabi', 'Rabi (रबी)') },
  ];

  // Save to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('ks_kcc_area', landArea);
      sessionStorage.setItem('ks_kcc_crop', cropType);
    } catch (e) {
      // ignore in restricted environments
    }
  }, [landArea, cropType]);

  useEffect(() => {
    let isMounted = true;
    setCalculating(true);

    calculateKCC({
      landArea: debouncedArea,
      cropType: debouncedCrop,
      season: debouncedSeason,
    })
      .then((res) => {
        if (isMounted && res.success) {
          setResult(res.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setCalculating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedArea, debouncedCrop, debouncedSeason]);

  return (
    <div className="space-y-6">
      <div className="border-b border-paper-200 pb-3 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-serif text-indigo-900">
              {t('entitlements.kccTitle', 'Kisan Credit Card (KCC) Limit Calculator')}
            </h2>
            <TermHint term="KCC" />
          </div>
          <p className="text-xs text-ink-muted mt-1">
            {t('entitlements.kccDesc', 'Institutional scale of finance breakdown per RBI/NABARD guidelines.')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Land Area with both Input and Slider */}
        <div className="md:col-span-5 space-y-2">
          <Field
            id="kcc-area"
            type="number"
            step="0.1"
            min="0.1"
            max="25"
            label={t('entitlements.landAreaLabel', 'Cultivated Land Area (Hectares)')}
            value={landArea}
            onChange={(e) => setLandArea(e.target.value)}
          />
          <div className="flex items-center gap-3 pt-1">
            <Sliders className="w-4 h-4 text-clay-500 shrink-0" aria-hidden="true" />
            <input
              type="range"
              min="0.5"
              max="15"
              step="0.5"
              value={Number(landArea) || 1}
              onChange={(e) => setLandArea(e.target.value)}
              className="w-full accent-clay-500 cursor-pointer"
              aria-label="Land area slider"
            />
            <span className="text-xs font-mono font-bold text-indigo-900 w-12 text-right">
              {landArea} ha
            </span>
          </div>
        </div>

        <div className="md:col-span-4">
          <Field
            id="kcc-crop"
            type="select"
            label={t('entitlements.cropLabel', 'Select Crop')}
            value={cropType}
            onChange={(e) => setCropType(e.target.value)}
            options={cropOptions}
          />
        </div>

        <div className="md:col-span-3">
          <Field
            id="kcc-season"
            type="select"
            label={t('entitlements.seasonLabel', 'Cropping Season')}
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            options={seasonOptions}
          />
        </div>
      </div>

      {/* Calculated Result Panel */}
      <Panel accent="saffron" className="relative shadow-hard-sm space-y-4">
        <div className="flex items-center justify-between border-b border-paper-200 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-saffron-400" />
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-900">
              {t('entitlements.kccEligibleLimit', 'Estimated Statutory KCC Credit Limit')}
            </span>
          </div>
          {calculating && <Spinner size="sm" className="text-clay-500" />}
        </div>

        <div>
          {/* Live tweening counter for eligible limit (M3.6) */}
          <div className="text-3xl sm:text-4xl font-bold font-serif text-indigo-900 tabular-nums">
            <CountUp
              value={result ? result.eligibleLimit : 0}
              duration={900}
              format={(val) => formatCurrency(val, i18n.language)}
            />
          </div>
          <p className="text-xs text-ink-muted mt-1">
            {t('entitlements.kccNote', {
              rate: result ? formatCurrency(result.benchmarkRate, i18n.language) : '₹48,000',
            })}
          </p>
        </div>

        {/* Formula breakdown as a mini stacked bar */}
        {result && (
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-ink-muted uppercase block">
              {isEn ? 'Statutory Scale of Finance Allocation' : 'सांविधिक फसल वित्त मान (Scale of Finance) आवंटन'}:
            </span>

            {/* Stacked Visual Bar */}
            <div className="h-4 w-full bg-paper-200 rounded-sm flex overflow-hidden shadow-inner" aria-hidden="true">
              <div
                className="bg-clay-500 h-full"
                style={{ width: '70%' }}
                title={isEn ? 'Crop Base Cost (70%)' : 'फसल आधार लागत (70%)'}
              />
              <div
                className="bg-saffron-400 h-full"
                style={{ width: '10%' }}
                title={isEn ? 'Household Consumption (10%)' : 'घरेलू उपभोग सहायता (10%)'}
              />
              <div
                className="bg-sage-600 h-full"
                style={{ width: '20%' }}
                title={isEn ? 'Maintenance & Insurance (20%)' : 'कृषि रखरखाव व बीमा (20%)'}
              />
            </div>

            {/* Breakdown rows with 60ms stagger (M3.6) */}
            <div className="bg-paper-100 p-3.5 rounded-sm border border-paper-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div
                style={{ animationDelay: '0ms' }}
                className={prefersReducedMotion ? '' : 'animate-fade-up'}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-2.5 h-2.5 bg-clay-500 rounded-sm" />
                  <span className="text-ink-muted uppercase text-[10px] font-bold">
                    {isEn ? 'Crop Base Cost (70%)' : 'फसल आधार लागत (70%)'}
                  </span>
                </div>
                <span className="font-bold text-indigo-900 tabular-nums text-sm block">
                  <CountUp
                    value={result.baseCropCost}
                    duration={900}
                    format={(val) => formatCurrency(val, i18n.language)}
                  />
                </span>
              </div>

              <div
                style={{ animationDelay: '60ms' }}
                className={prefersReducedMotion ? '' : 'animate-fade-up'}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-2.5 h-2.5 bg-saffron-400 rounded-sm" />
                  <span className="text-ink-muted uppercase text-[10px] font-bold">
                    {isEn ? 'Household Support (+10%)' : 'घरेलू उपभोग सहायता (+10%)'}
                  </span>
                </div>
                <span className="font-bold text-indigo-900 tabular-nums text-sm block">
                  <CountUp
                    value={result.householdProvision}
                    duration={900}
                    format={(val) => formatCurrency(val, i18n.language)}
                  />
                </span>
              </div>

              <div
                style={{ animationDelay: '120ms' }}
                className={prefersReducedMotion ? '' : 'animate-fade-up'}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-2.5 h-2.5 bg-sage-600 rounded-sm" />
                  <span className="text-ink-muted uppercase text-[10px] font-bold">
                    {isEn ? 'Farm Maintenance (+20%)' : 'कृषि रखरखाव व बीमा (+20%)'}
                  </span>
                </div>
                <span className="font-bold text-indigo-900 tabular-nums text-sm block">
                  <CountUp
                    value={result.maintenanceProvision}
                    duration={900}
                    format={(val) => formatCurrency(val, i18n.language)}
                  />
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 pt-2 text-[11px] text-ink-muted border-t border-paper-200">
          <Info className="w-4 h-4 text-indigo-900 shrink-0 mt-0.5" />
          <span>{t('entitlements.kccFormulaHint', 'Under NABARD rules, eligible limit is 100% of Scale of Finance + 10% Household Consumption + 20% Farm Maintenance.')}</span>
        </div>
      </Panel>
    </div>
  );
}
