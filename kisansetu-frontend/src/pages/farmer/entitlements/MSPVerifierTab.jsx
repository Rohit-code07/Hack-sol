import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, ShieldAlert, Scale, FileText } from 'lucide-react';
import useDebounce from '../../../hooks/useDebounce';
import { verifyMSP } from '../../../services/entitlementService';
import { formatCurrency } from '../../../utils/formatters';
import { CROPS } from '../../../constants/crops';
import Field from '../../../components/common/Field';
import Panel from '../../../components/common/Panel';
import Stamp from '../../../components/common/Stamp';
import Button from '../../../components/common/Button';
import Spinner from '../../../components/common/Spinner';
import TermHint from '../../../components/common/TermHint';
import useReducedMotion from '../../../hooks/useReducedMotion';

/**
 * Statutory MSP Procurement Price Verifier with scaleX comparison bars and verdict stamp.
 */
export default function MSPVerifierTab() {
  const { t, i18n } = useTranslation();
  const prefersReducedMotion = useReducedMotion();

  const [cropType, setCropType] = useState(() => {
    try {
      return sessionStorage.getItem('ks_msp_crop') || 'Soybean';
    } catch {
      return 'Soybean';
    }
  });

  const [quantity, setQuantity] = useState(() => {
    try {
      return sessionStorage.getItem('ks_msp_qty') || '20';
    } catch {
      return '20';
    }
  });

  const [claimedAmount, setClaimedAmount] = useState(() => {
    try {
      return sessionStorage.getItem('ks_msp_claimed') || '82000';
    } catch {
      return '82000';
    }
  });

  const [result, setResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const debouncedCrop = useDebounce(cropType, 300);
  const debouncedQty = useDebounce(quantity, 300);
  const debouncedClaimed = useDebounce(claimedAmount, 300);

  // Dynamic Crop Options from CROPS benchmark constants
  const cropOptions = CROPS.map((c) => ({
    value: c.id,
    label: `${i18n.language === 'hi' ? c.hi : c.en} — ₹${c.mspPerQuintal.toLocaleString('en-IN')}/qtl`,
  }));

  // Save to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('ks_msp_crop', cropType);
      sessionStorage.setItem('ks_msp_qty', quantity);
      sessionStorage.setItem('ks_msp_claimed', claimedAmount);
    } catch (e) {
      // ignore
    }
  }, [cropType, quantity, claimedAmount]);

  useEffect(() => {
    let isMounted = true;
    setVerifying(true);

    verifyMSP({
      cropType: debouncedCrop,
      quantity: debouncedQty,
      claimedAmount: debouncedClaimed,
    })
      .then((res) => {
        if (isMounted && res.success) {
          setResult(res.data);
        }
      })
      .finally(() => {
        if (isMounted) setVerifying(false);
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedCrop, debouncedQty, debouncedClaimed]);

  const claimedNum = Number(claimedAmount) || 0;
  const expectedNum = result ? result.expectedMSP : 0;
  const maxBarValue = Math.max(claimedNum, expectedNum, 1);
  const claimedPercent = Math.min(100, Math.round((claimedNum / maxBarValue) * 100));
  const expectedPercent = Math.min(100, Math.round((expectedNum / maxBarValue) * 100));

  return (
    <div className="space-y-6">
      <div className="border-b border-paper-200 pb-3 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-serif text-indigo-900">
              {t('entitlements.mspTitle', 'Minimum Support Price (MSP) Verifier')}
            </h2>
            <TermHint term="MSP" />
          </div>
          <p className="text-xs text-ink-muted mt-1">
            {t('entitlements.mspDesc', 'Statutory MSP procurement rate benchmark verification to detect Mandi trade shortfalls.')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-4">
          <Field
            id="msp-crop"
            type="select"
            label={t('entitlements.cropLabel', 'Notified MSP Crop')}
            value={cropType}
            onChange={(e) => setCropType(e.target.value)}
            options={cropOptions}
          />
        </div>

        <div className="md:col-span-4">
          <Field
            id="msp-qty"
            type="number"
            min="0.5"
            step="0.5"
            label={t('entitlements.quantityLabel', 'Harvest Quantity Sold (Quintals)')}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <div className="md:col-span-4">
          <Field
            id="msp-claimed"
            type="number"
            min="0"
            step="100"
            label={t('entitlements.paymentReceivedLabel', 'Total Remittance Received (₹)')}
            value={claimedAmount}
            onChange={(e) => setClaimedAmount(e.target.value)}
          />
        </div>
      </div>

      {/* Verification Result Panel */}
      <Panel
        accent={result ? (result.isFair ? 'sage' : 'rust') : 'ochre'}
        className="relative shadow-hard-sm space-y-4"
      >
        <div className="flex items-center justify-between border-b border-paper-200 pb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-900" />
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-900">
              {t('entitlements.mspFinding', 'Procurement Price Audit Result')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {verifying && <Spinner size="sm" className="text-clay-500" />}
            {result && (
              <Stamp
                status={result.status}
                label={result.isFair ? t('entitlements.mspFair', 'MSP Verified (Fair)') : t('entitlements.mspShortfall', 'Underpaid (Shortfall)')}
                rotate
                animate
                size="md"
              />
            )}
          </div>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-paper-100 p-3.5 rounded-sm border border-paper-200">
                <span className="text-[10px] uppercase font-bold text-ink-muted block">
                  {t('entitlements.mspBenchmarkRate', 'Statutory MSP Rate')}
                </span>
                <span className="text-lg font-bold font-serif text-indigo-900 tabular-nums">
                  {formatCurrency(result.officialRate, i18n.language)} / qtl
                </span>
              </div>

              <div className="bg-paper-100 p-3.5 rounded-sm border border-paper-200">
                <span className="text-[10px] uppercase font-bold text-indigo-900 block">
                  {t('entitlements.mspExpectedTotal', 'Mandatory Minimum Due')}
                </span>
                <span className="text-lg font-bold font-serif text-indigo-900 tabular-nums">
                  {formatCurrency(result.expectedMSP, i18n.language)}
                </span>
              </div>

              <div className={`p-3.5 rounded-sm border ${result.isFair ? 'bg-sage-100/50 border-sage-600' : 'bg-rust-100/50 border-rust-600'}`}>
                <span className="text-[10px] uppercase font-bold text-ink-muted block">
                  {t('entitlements.mspDiffLabel', 'Variance / Shortfall')}
                </span>
                <span className={`text-xl font-bold font-serif tabular-nums ${result.isFair ? 'text-sage-600' : 'text-rust-600'}`}>
                  {result.difference >= 0 ? '+' : ''}
                  {formatCurrency(result.difference, i18n.language)}
                </span>
              </div>
            </div>

            {/* Comparison Visual Bar: scaleX transform instead of width style (M3.6) */}
            <div className="space-y-2 pt-2 border-t border-paper-200">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-indigo-900">
                  <span>{t('entitlements.claimedAmount', 'Amount Received')}: {formatCurrency(claimedNum, i18n.language)}</span>
                  <span className="tabular-nums">{claimedPercent}%</span>
                </div>
                <div className="h-3 bg-paper-200 rounded-sm overflow-hidden" aria-hidden="true">
                  <div
                    className={`h-full w-full origin-left ${result.isFair ? 'bg-sage-600' : 'bg-rust-600'} ${
                      prefersReducedMotion ? '' : 'transition-transform duration-700 ease-out-expo'
                    }`}
                    style={{ transform: `scaleX(${claimedPercent / 100})` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-indigo-900">
                  <span>{t('entitlements.mandatoryMSP', 'Mandatory Statutory Due')}: {formatCurrency(expectedNum, i18n.language)}</span>
                  <span className="tabular-nums">{expectedPercent}%</span>
                </div>
                <div className="h-3 bg-paper-200 rounded-sm overflow-hidden" aria-hidden="true">
                  <div
                    className={`h-full w-full bg-indigo-900 origin-left ${
                      prefersReducedMotion ? '' : 'transition-transform duration-700 ease-out-expo [transition-delay:150ms]'
                    }`}
                    style={{ transform: `scaleX(${expectedPercent / 100})` }}
                  />
                </div>
              </div>
            </div>

            {/* Verdict Callout with Action if Shortfall Detected */}
            {!result.isFair ? (
              <div className="p-4 bg-rust-100/60 border border-rust-600 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-hard-sm animate-slide-down">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-rust-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-rust-600 text-sm">
                      {t('entitlements.mspShortfallAlert', {
                        amount: formatCurrency(Math.abs(result.difference), i18n.language),
                      })}
                    </h3>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {t('entitlements.mspRecourse', 'Under Mandi Board regulations, you are entitled to file for price deficiency recovery.')}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/farmer/grievances?category=SUBSIDY_DELAY&ref=MSP_SHORTFALL&desc=${encodeURIComponent(
                    `MSP Shortfall of ${formatCurrency(Math.abs(result.difference), 'en')} detected for ${quantity} quintals of ${cropType}.`
                  )}`}
                  className="shrink-0"
                >
                  <Button variant="danger" size="sm" icon={<FileText className="w-4 h-4" />}>
                    {t('entitlements.mspClaimDeficiency', 'Recover Price Gap')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="p-3 bg-sage-100/60 border border-sage-600 rounded-sm flex items-center gap-2 text-xs text-sage-600 font-semibold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{t('entitlements.mspCompliantNotice', 'Procurement price meets or exceeds central government mandated statutory minimum.')}</span>
              </div>
            )}
          </div>
        )}
      </Panel>
    </div>
  );
}
