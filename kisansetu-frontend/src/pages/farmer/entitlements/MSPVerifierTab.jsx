import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, ShieldAlert, Scale, FileText, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import useAuth from '../../../hooks/useAuth';
import schemeApi from '../../../api/schemeApi';
import useDebounce from '../../../hooks/useDebounce';
import { verifyMSP } from '../../../services/entitlementService';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { CROPS } from '../../../constants/crops';
import Field from '../../../components/common/Field';
import Panel from '../../../components/common/Panel';
import Stamp from '../../../components/common/Stamp';
import Button from '../../../components/common/Button';
import Spinner from '../../../components/common/Spinner';
import TermHint from '../../../components/common/TermHint';
import DataTable from '../../../components/common/DataTable';
import useReducedMotion from '../../../hooks/useReducedMotion';

/**
 * Statutory MSP Procurement Price Verifier with scaleX comparison bars and verdict stamp.
 */
export default function MSPVerifierTab() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const { farmerId } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  const [savedTransactions, setSavedTransactions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

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
      .catch(() => {})
      .finally(() => {
        if (isMounted) setVerifying(false);
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedCrop, debouncedQty, debouncedClaimed]);

  const fetchSavedTransactions = useCallback(async () => {
    if (!farmerId) return;
    try {
      const res = await schemeApi.getMspByFarmer(farmerId);
      if (res?.success) {
        setSavedTransactions(res.data || []);
      }
    } catch {
      // ignore
    }
  }, [farmerId]);

  useEffect(() => {
    fetchSavedTransactions();
  }, [fetchSavedTransactions]);

  const handleSaveMspTransaction = async () => {
    if (!farmerId) return;
    setIsSaving(true);
    setSaveMsg('');
    try {
      const payload = {
        farmerId: farmerId,
        crop: cropType,
        cropVariety: 'Standard Grade-A',
        marketingSeason: 'Kharif 2024',
        procurementYear: '2024',
        acceptedQuantity: Number(quantity) || 1,
        applicableMsp: result?.officialRate || 2300,
        actualPayment: Number(claimedAmount) || 0,
        procurementCenter: 'APMC Krishi Upaj Mandi',
        procurementCenterLocation: 'Raipur / Wardha',
        tokenNumber: `MND-${Date.now().toString().slice(-6)}`,
        transactionDate: new Date().toISOString().slice(0, 10),
      };

      const res = await schemeApi.recordMsp(payload);
      if (res?.success) {
        setSaveMsg(isEn ? 'Procurement transaction recorded in official ledger!' : 'मंडी विक्रय लेनदेन आधिकारिक खाते में सफलतापूर्वक दर्ज हुआ!');
        fetchSavedTransactions();
        setTimeout(() => setSaveMsg(''), 3000);
      }
    } catch (err) {
      setSaveMsg(err?.response?.data?.message || err?.message || (isEn ? 'Failed to save transaction' : 'लेनदेन दर्ज करने में त्रुटि'));
    } finally {
      setIsSaving(false);
    }
  };

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

            {/* Action Bar inside Panel: Record Transaction & Feedback */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-paper-200">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Save className="w-4 h-4" />}
                  onClick={handleSaveMspTransaction}
                  disabled={isSaving}
                >
                  {isSaving ? (isEn ? 'Saving Sale Record...' : 'सहेजा जा रहा है...') : (isEn ? 'Record Mandi Procurement Sale' : 'मंडी विक्रय खाता में दर्ज करें')}
                </Button>
                {saveMsg && (
                  <span className="text-xs font-semibold text-sage-800 animate-slide-down">
                    ✓ {saveMsg}
                  </span>
                )}
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

      {/* Recorded Mandi Transactions History Section */}
      <div className="pt-4 space-y-3">
        <div className="flex items-center justify-between border-b border-paper-200 pb-2">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-clay-600" />
            <h3 className="font-serif font-bold text-base text-indigo-950">
              {isEn ? 'Your Registered Mandi Procurement Ledger' : 'आपकी पंजीकृत मंडी विक्रय एवं भुगतान बही'}
            </h3>
          </div>
          <span className="text-xs text-ink-muted">
            {savedTransactions.length} {isEn ? 'transactions' : 'लेनदेन'}
          </span>
        </div>

        {savedTransactions.length === 0 ? (
          <div className="p-6 bg-paper-100 border border-paper-200 rounded-sm text-center text-xs text-ink-muted">
            {isEn ? 'No Mandi procurement sales recorded yet. Click "Record Mandi Procurement Sale" above to log transactions.' : 'अभी तक कोई मंडी विक्रय दर्ज नहीं है। ऊपर "मंडी विक्रय खाता में दर्ज करें" पर क्लिक करें।'}
          </div>
        ) : (
          <div className="overflow-x-auto border border-indigo-900 rounded-sm bg-paper-50 shadow-hard-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-paper-100 border-b border-indigo-900 text-indigo-950 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Receipt / Token</th>
                  <th className="p-3">Crop & Season</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Mandi Price vs MSP</th>
                  <th className="p-3">Amount Received</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-200">
                {savedTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-paper-100/50">
                    <td className="p-3 font-mono font-bold text-indigo-950">
                      {tx.receiptReference || tx.tokenNumber}
                      <span className="block text-[10px] text-ink-muted font-normal">{tx.procurementCenter}</span>
                    </td>
                    <td className="p-3 font-semibold text-indigo-900">
                      {tx.crop}
                      <span className="block text-[10px] text-ink-muted font-normal">{tx.marketingSeason}</span>
                    </td>
                    <td className="p-3 tabular-nums font-bold text-indigo-950">
                      {tx.acceptedQuantity} qtl
                    </td>
                    <td className="p-3 tabular-nums">
                      ₹{tx.actualRateReceived || tx.applicableMsp} / qtl
                      <span className="block text-[10px] text-ink-muted">MSP: ₹{tx.applicableMsp}</span>
                    </td>
                    <td className="p-3 tabular-nums font-bold text-indigo-950">
                      {formatCurrency(tx.actualPayment, i18n.language)}
                    </td>
                    <td className="p-3">
                      {tx.paymentStatus === 'UNDERPAID' ? (
                        <span className="font-bold text-[10px] px-2 py-0.5 rounded-xs bg-rust-100 text-rust-700 border border-rust-600">
                          ⚠ Underpaid (₹{tx.pendingPayment || 0})
                        </span>
                      ) : (
                        <span className="font-bold text-[10px] px-2 py-0.5 rounded-xs bg-sage-100 text-sage-800 border border-sage-600">
                          ✓ Completed
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {tx.paymentStatus === 'UNDERPAID' && (
                        <Link
                          to={`/farmer/grievances?category=SUBSIDY_DELAY&ref=${tx.receiptReference}&desc=${encodeURIComponent(
                            `MSP shortfall of ₹${tx.pendingPayment} on sale of ${tx.acceptedQuantity} qtl ${tx.crop}`
                          )}`}
                          className="text-clay-600 font-bold hover:underline"
                        >
                          Dispute →
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
