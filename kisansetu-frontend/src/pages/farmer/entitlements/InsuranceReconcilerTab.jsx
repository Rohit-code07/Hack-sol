import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, FileText, PlusCircle, Check, AlertOctagon } from 'lucide-react';
import useAuth from '../../../hooks/useAuth';
import schemeApi from '../../../api/schemeApi';
import { reconcileInsurance } from '../../../services/entitlementService';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import Field from '../../../components/common/Field';
import Panel from '../../../components/common/Panel';
import Stamp from '../../../components/common/Stamp';
import Button from '../../../components/common/Button';
import TermHint from '../../../components/common/TermHint';
import Modal from '../../../components/common/Modal';
import useReducedMotion from '../../../hooks/useReducedMotion';

/**
 * PMFBY Crop Insurance Reconciler with dynamic policy verification and scale-in report.
 */
export default function InsuranceReconcilerTab() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const { farmerId } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  const [policiesList, setPoliciesList] = useState([]);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState({ text: '', type: '' });

  const [policyForm, setPolicyForm] = useState({
    crop: 'Paddy',
    season: 'Kharif 2024',
    khasraNumber: '',
    insurancePolicyNumber: '',
    applicationNumber: '',
    insuredArea: '3.5',
    sumInsured: '120000',
    premiumPaid: '2400',
    insuranceCompany: 'Agriculture Insurance Company of India',
  });

  const [claimForm, setClaimForm] = useState({
    insurancePolicyNumber: '',
    claimType: 'INUNDATION',
    damageDate: new Date().toISOString().slice(0, 10),
    damageType: 'Excessive Rainfall & Flooding',
    damageDescription: '',
    estimatedDamagePercentage: '40',
    estimatedLoss: '48000',
    claimAmount: '48000',
  });

  const fetchPolicies = useCallback(async () => {
    if (!farmerId) return;
    try {
      const res = await schemeApi.getInsuranceByFarmer(farmerId);
      if (res?.success) {
        setPoliciesList(res.data || []);
      }
    } catch {
      // ignore
    }
  }, [farmerId]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const handleEnrollPolicy = async (e) => {
    e.preventDefault();
    if (!policyForm.insurancePolicyNumber.trim() || !policyForm.khasraNumber.trim()) {
      setFormMsg({ text: isEn ? 'Please fill all required policy fields.' : 'कृपया सभी आवश्यक फ़ील्ड भरें।', type: 'error' });
      return;
    }
    setIsSubmitting(true);
    setFormMsg({ text: '', type: '' });
    try {
      const payload = {
        farmerId: farmerId,
        schemeName: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        crop: policyForm.crop,
        season: policyForm.season,
        khasraNumber: policyForm.khasraNumber.trim(),
        insurancePolicyNumber: policyForm.insurancePolicyNumber.trim(),
        applicationNumber: policyForm.applicationNumber.trim() || `APP-${Date.now().toString().slice(-6)}`,
        insuredArea: Number(policyForm.insuredArea) || 1,
        sumInsured: Number(policyForm.sumInsured) || 50000,
        premiumPaid: Number(policyForm.premiumPaid) || 1000,
        insuranceCompany: policyForm.insuranceCompany,
      };

      const res = await schemeApi.registerPolicy(payload);
      if (res?.success) {
        setFormMsg({ text: isEn ? 'PMFBY Policy registered successfully!' : 'PMFBY बीमा पॉलिसी सफलतापूर्वक पंजीकृत!', type: 'success' });
        setTimeout(() => {
          setIsEnrollModalOpen(false);
          setFormMsg({ text: '', type: '' });
          fetchPolicies();
        }, 1200);
      }
    } catch (err) {
      setFormMsg({ text: err?.response?.data?.message || err?.message || 'Error registering policy', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!claimForm.insurancePolicyNumber.trim()) {
      setFormMsg({ text: isEn ? 'Please select policy number.' : 'कृपया पॉलिसी क्रमांक चुनें।', type: 'error' });
      return;
    }
    setIsSubmitting(true);
    setFormMsg({ text: '', type: '' });
    try {
      const payload = {
        insurancePolicyNumber: claimForm.insurancePolicyNumber.trim(),
        claimType: claimForm.claimType,
        damageDate: claimForm.damageDate,
        damageType: claimForm.damageType,
        damageDescription: claimForm.damageDescription,
        estimatedDamagePercentage: Number(claimForm.estimatedDamagePercentage) || 0,
        estimatedLoss: Number(claimForm.estimatedLoss) || 0,
        claimAmount: Number(claimForm.claimAmount) || 0,
      };

      const res = await schemeApi.submitClaim(payload);
      if (res?.success) {
        setFormMsg({ text: isEn ? 'Crop damage claim submitted for surveyor audit!' : 'फसल क्षति दावा सर्वेक्षण हेतु दर्ज!', type: 'success' });
        setTimeout(() => {
          setIsClaimModalOpen(false);
          setFormMsg({ text: '', type: '' });
          fetchPolicies();
        }, 1200);
      }
    } catch (err) {
      setFormMsg({ text: err?.response?.data?.message || err?.message || 'Error submitting claim', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [policyId, setPolicyId] = useState(() => {
    try {
      return sessionStorage.getItem('ks_ins_policy') || 'POL-PMFBY-2026-9901';
    } catch {
      return 'POL-PMFBY-2026-9901';
    }
  });

  const [paidAmount, setPaidAmount] = useState(() => {
    try {
      return sessionStorage.getItem('ks_ins_amt') || '2400';
    } catch {
      return '2400';
    }
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.setItem('ks_ins_policy', policyId);
      sessionStorage.setItem('ks_ins_amt', paidAmount);
    } catch (e) {
      // ignore
    }
  }, [policyId, paidAmount]);

  const handleReconcile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await reconcileInsurance({
        farmerId: farmerId || 'FRM-0003',
        policyId: policyId.trim(),
        paidAmount: paidAmount.trim(),
      });
      if (res.success) {
        setResult(res.data);
      }
    } catch (err) {
      // Handled gracefully without crashing
    } finally {
      setLoading(false);
    }
  };

  const isVerified = result?.status === 'PAID' || result?.status === 'VERIFIED' || result?.status === 'ACTIVE';
  const isMismatch = result?.status === 'MISMATCH' || result?.status === 'NOT_ELIGIBLE';
  const panelAccent = isMismatch ? 'rust' : isVerified ? 'sage' : 'ochre';

  return (
    <div className="space-y-6">
      <div className="border-b border-paper-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-serif text-indigo-900">
              {t('entitlements.insuranceTitle', 'PMFBY Crop Insurance Reconciler')}
            </h2>
            <TermHint term="PMFBY" />
          </div>
          <p className="text-xs text-ink-muted mt-1">
            {t('entitlements.insuranceDesc', 'Cross-match farmer premium remittance against state subsidy ledger and policy enrollment.')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<PlusCircle className="w-4 h-4" />}
            onClick={() => setIsEnrollModalOpen(true)}
          >
            {isEn ? 'Enroll Policy' : 'पॉलिसी दर्ज करें'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<FileText className="w-4 h-4" />}
            onClick={() => setIsClaimModalOpen(true)}
          >
            {isEn ? 'File Damage Claim' : 'क्षति दावा करें'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleReconcile} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-5">
          <Field
            id="ins-policy"
            label={t('entitlements.policyLabel', 'PMFBY Policy Identification Number')}
            value={policyId}
            onChange={(e) => setPolicyId(e.target.value)}
            placeholder="e.g. POL-PMFBY-2026-9901"
            required
          />
        </div>

        <div className="md:col-span-4">
          <Field
            id="ins-amt"
            type="number"
            label={t('entitlements.premiumPaidLabel', 'Farmer Premium Share Paid (₹)')}
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            required
          />
        </div>

        <div className="md:col-span-3">
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full"
          >
            {t('entitlements.reconcileBtn', 'Reconcile Policy')}
          </Button>
        </div>
      </form>

      {/* Dynamic Reconciliation Report Panel with 220ms scale-in (M3.6) */}
      {result && (
        <Panel
          accent={panelAccent}
          className={`shadow-hard-sm space-y-4 ${
            prefersReducedMotion ? '' : 'animate-scale-in [animation-duration:220ms]'
          }`}
        >
          <div className="flex items-center justify-between border-b border-paper-200 pb-3">
            <div className="flex items-center gap-2">
              {isMismatch ? (
                <ShieldAlert className="w-5 h-5 text-rust-600" />
              ) : (
                <ShieldCheck className={`w-5 h-5 text-sage-600 ${prefersReducedMotion ? '' : 'animate-scale-in'}`} />
              )}
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-900">
                {t('entitlements.reconcileStatus', 'Policy Status Audit')}
              </span>
            </div>
            <Stamp status={result.status} animate />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-paper-100 p-3.5 rounded-sm border border-paper-200">
              <span className="text-[10px] uppercase font-bold text-ink-muted block">
                {t('entitlements.policyRef', 'Policy Ref')}
              </span>
              <span className="font-mono font-bold text-sm text-indigo-900">
                {result.policyId}
              </span>
            </div>

            <div className="bg-paper-100 p-3.5 rounded-sm border border-paper-200">
              <span className="text-[10px] uppercase font-bold text-ink-muted block">
                {t('entitlements.farmerPremium', 'Farmer Premium Remitted')}
              </span>
              <span className="font-bold text-sm text-indigo-900 tabular-nums">
                {formatCurrency(result.paidAmount, i18n.language)}
              </span>
            </div>

            <div className="bg-paper-100 p-3.5 rounded-sm border border-paper-200">
              <span className="text-[10px] uppercase font-bold text-ink-muted block">
                {t('entitlements.portalRef', 'State Subsidy Portal Match')}
              </span>
              <span className="font-mono font-bold text-sm text-indigo-900">
                {result.statePortalRef || 'N/A'}
              </span>
            </div>
          </div>

          {/* Dynamic Status Callout */}
          {isMismatch ? (
            <div className="bg-rust-100 p-4 rounded-sm border border-rust-600 text-xs text-rust-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-hard-sm animate-slide-down">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">
                    {t('entitlements.insuranceMismatchTitle', 'Premium Remittance Discrepancy Flagged')}
                  </p>
                  <p className="mt-0.5 text-ink-muted">
                    {t('entitlements.insuranceMismatchDesc', 'The remitted amount does not match state portal records. You may face delays during crop damage assessment.')}
                  </p>
                </div>
              </div>
              <Link to="/farmer/grievances?category=SUBSIDY_DELAY&ref=INSURANCE_MISMATCH" className="shrink-0">
                <Button variant="danger" size="sm" icon={<FileText className="w-4 h-4" />}>
                  {t('entitlements.fileInsuranceGrievance', 'File Insurance Grievance')}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="bg-sage-100 p-3.5 rounded-sm border border-sage-600 text-xs text-sage-600 flex items-start gap-2 animate-slide-down">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  {t('entitlements.insuranceActiveTitle', 'Verification Status: Fully Reconciled & Active')}
                </p>
                <p className="mt-0.5 text-ink-muted">
                  {t('entitlements.reconcileNext', 'Policy active for current season. Coverage confirmed in central PMFBY portal.')}
                </p>
              </div>
            </div>
          )}
        </Panel>
      )}

      {/* Registered PMFBY Policies & Claim Redressal Ledger */}
      <div className="pt-4 space-y-3">
        <div className="flex items-center justify-between border-b border-paper-200 pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-clay-600" />
            <h3 className="font-serif font-bold text-base text-indigo-950">
              {isEn ? 'Your Registered PMFBY Policies & Damage Claims' : 'आपकी पंजीकृत PMFBY फसल बीमा पॉलिसी एवं दावा विवरण'}
            </h3>
          </div>
          <span className="text-xs text-ink-muted">
            {policiesList.length} {isEn ? 'records' : 'अभिलेख'}
          </span>
        </div>

        {policiesList.length === 0 ? (
          <div className="p-6 bg-paper-100 border border-paper-200 rounded-sm text-center text-xs text-ink-muted">
            {isEn ? 'No PMFBY crop insurance policies registered. Click "Enroll Policy" above to add your policy certificate.' : 'कोई बीमा पॉलिसी पंजीकृत नहीं है। ऊपर "पॉलिसी दर्ज करें" पर क्लिक करें।'}
          </div>
        ) : (
          <div className="overflow-x-auto border border-indigo-900 rounded-sm bg-paper-50 shadow-hard-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-paper-100 border-b border-indigo-900 text-indigo-950 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Policy Number</th>
                  <th className="p-3">Crop / Season</th>
                  <th className="p-3">Khasra</th>
                  <th className="p-3">Sum Insured</th>
                  <th className="p-3">Premium Paid</th>
                  <th className="p-3">Claim Number / Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-200">
                {policiesList.map((pol) => (
                  <tr key={pol.id} className="hover:bg-paper-100/50">
                    <td className="p-3 font-mono font-bold text-indigo-950">
                      {pol.insurancePolicyNumber}
                      <span className="block text-[10px] text-ink-muted font-normal">{pol.insuranceCompany}</span>
                    </td>
                    <td className="p-3 font-semibold text-indigo-900">
                      {pol.crop}
                      <span className="block text-[10px] text-ink-muted font-normal">{pol.season}</span>
                    </td>
                    <td className="p-3 font-mono font-semibold text-indigo-950">
                      {pol.khasraNumber}
                    </td>
                    <td className="p-3 tabular-nums font-bold text-indigo-950">
                      {formatCurrency(pol.sumInsured, i18n.language)}
                    </td>
                    <td className="p-3 tabular-nums text-sage-800 font-semibold">
                      {formatCurrency(pol.premiumPaid, i18n.language)}
                    </td>
                    <td className="p-3">
                      {pol.claimNumber ? (
                        <div>
                          <span className="font-mono font-bold text-[10px] text-clay-700 block">{pol.claimNumber}</span>
                          <span className="font-bold text-[10px] px-2 py-0.5 rounded-xs bg-ochre-100 text-ochre-800 border border-ochre-600">
                            {pol.claimStatus || 'UNDER_REVIEW'}
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold text-[10px] px-2 py-0.5 rounded-xs bg-sage-100 text-sage-800 border border-sage-600">
                          Active Policy
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {!pol.claimNumber && (
                        <button
                          type="button"
                          onClick={() => {
                            setClaimForm({ ...claimForm, insurancePolicyNumber: pol.insurancePolicyNumber });
                            setIsClaimModalOpen(true);
                          }}
                          className="text-clay-600 font-bold hover:underline"
                        >
                          Claim Damage →
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enroll Policy Modal */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title={isEn ? 'Enroll PMFBY Insurance Policy' : 'PMFBY फसल बीमा पॉलिसी दर्ज करें'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleEnrollPolicy} className="space-y-4">
          {formMsg.text && (
            <div className={`p-3 rounded-sm text-xs font-bold flex items-center gap-2 animate-slide-down ${formMsg.type === 'error' ? 'bg-rust-100 text-rust-700 border border-rust-600' : 'bg-sage-100 text-sage-800 border border-sage-600'}`}>
              {formMsg.type === 'error' ? <AlertOctagon className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
              <span>{formMsg.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              id="ins-num"
              label={isEn ? 'Insurance Policy Number' : 'पॉलिसी क्रमांक'}
              value={policyForm.insurancePolicyNumber}
              onChange={(e) => setPolicyForm({ ...policyForm, insurancePolicyNumber: e.target.value })}
              placeholder="e.g. POL-PMFBY-2024-8819"
              required
            />
            <Field
              id="ins-khasra"
              label={isEn ? 'Insured Khasra Number' : 'बीमित खसरा क्रमांक'}
              value={policyForm.khasraNumber}
              onChange={(e) => setPolicyForm({ ...policyForm, khasraNumber: e.target.value })}
              placeholder="e.g. 142/1"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field
              id="ins-crop"
              label={isEn ? 'Insured Crop' : 'बीमित फसल'}
              value={policyForm.crop}
              onChange={(e) => setPolicyForm({ ...policyForm, crop: e.target.value })}
              placeholder="Paddy"
              required
            />
            <Field
              id="ins-season"
              label={isEn ? 'Season' : 'मौसम'}
              value={policyForm.season}
              onChange={(e) => setPolicyForm({ ...policyForm, season: e.target.value })}
              placeholder="Kharif 2024"
            />
            <Field
              id="ins-area"
              type="number"
              step="0.01"
              label={isEn ? 'Insured Area (Acres)' : 'बीमित रकबा (एकड़)'}
              value={policyForm.insuredArea}
              onChange={(e) => setPolicyForm({ ...policyForm, insuredArea: e.target.value })}
              placeholder="3.5"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              id="ins-sum"
              type="number"
              label={isEn ? 'Sum Insured (₹)' : 'बीमित राशि (Sum Insured ₹)'}
              value={policyForm.sumInsured}
              onChange={(e) => setPolicyForm({ ...policyForm, sumInsured: e.target.value })}
              placeholder="120000"
              required
            />
            <Field
              id="ins-prem"
              type="number"
              label={isEn ? 'Farmer Premium Share Paid (₹)' : 'किसान अंशदान प्रीमियम (₹)'}
              value={policyForm.premiumPaid}
              onChange={(e) => setPolicyForm({ ...policyForm, premiumPaid: e.target.value })}
              placeholder="2400"
              required
            />
          </div>

          <Field
            id="ins-company"
            label={isEn ? 'Underwriting Insurance Company' : 'बीमा कंपनी'}
            value={policyForm.insuranceCompany}
            onChange={(e) => setPolicyForm({ ...policyForm, insuranceCompany: e.target.value })}
            placeholder="Agriculture Insurance Company of India"
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-paper-200">
            <Button type="button" variant="outline" onClick={() => setIsEnrollModalOpen(false)}>
              {isEn ? 'Cancel' : 'रद्द करें'}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? (isEn ? 'Registering...' : 'पंजीकृत किया जा रहा है...') : (isEn ? 'Save Insurance Policy' : 'पॉलिसी सहेजें')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* File Damage Claim Modal */}
      <Modal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        title={isEn ? 'Submit PMFBY Crop Damage Claim' : 'PMFBY फसल क्षति दावा प्रस्तुत करें'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitClaim} className="space-y-4">
          {formMsg.text && (
            <div className={`p-3 rounded-sm text-xs font-bold flex items-center gap-2 animate-slide-down ${formMsg.type === 'error' ? 'bg-rust-100 text-rust-700 border border-rust-600' : 'bg-sage-100 text-sage-800 border border-sage-600'}`}>
              {formMsg.type === 'error' ? <AlertOctagon className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
              <span>{formMsg.text}</span>
            </div>
          )}

          <Field
            id="clm-policy"
            label={isEn ? 'Target Policy Number' : 'बीमा पॉलिसी क्रमांक'}
            value={claimForm.insurancePolicyNumber}
            onChange={(e) => setClaimForm({ ...claimForm, insurancePolicyNumber: e.target.value })}
            placeholder="e.g. POL-PMFBY-2024-8819"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              id="clm-date"
              type="date"
              label={isEn ? 'Date of Calamity / Damage' : 'क्षति / आपदा की तिथि'}
              value={claimForm.damageDate}
              onChange={(e) => setClaimForm({ ...claimForm, damageDate: e.target.value })}
              required
            />
            <Field
              id="clm-type"
              type="select"
              label={isEn ? 'Peril / Cause of Damage' : 'आपदा का कारण'}
              value={claimForm.claimType}
              onChange={(e) => setClaimForm({ ...claimForm, claimType: e.target.value })}
              options={[
                { value: 'INUNDATION', label: isEn ? 'Inundation / Flooding (जलभराव)' : 'अत्यधिक वर्षा / जलभराव' },
                { value: 'DROUGHT', label: isEn ? 'Severe Drought / Dry Spell (सूखा)' : 'अनावृष्टि / सूखा' },
                { value: 'PEST_ATTACK', label: isEn ? 'Pest Attack / Disease (कीट प्रकोप)' : 'कीट प्रकोप / व्याधि' },
                { value: 'HAILSTORM', label: isEn ? 'Hailstorm (ओलावृष्टि)' : 'ओलावृष्टि' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              id="clm-pct"
              type="number"
              min="1"
              max="100"
              label={isEn ? 'Estimated Damage Percentage (%)' : 'अनुमानित क्षति प्रतिशत (%)'}
              value={claimForm.estimatedDamagePercentage}
              onChange={(e) => setClaimForm({ ...claimForm, estimatedDamagePercentage: e.target.value })}
              placeholder="40"
              required
            />
            <Field
              id="clm-amt"
              type="number"
              label={isEn ? 'Claim Payout Demanded (₹)' : 'दावा राशि (₹)'}
              value={claimForm.claimAmount}
              onChange={(e) => setClaimForm({ ...claimForm, claimAmount: e.target.value })}
              placeholder="48000"
              required
            />
          </div>

          <Field
            id="clm-desc"
            type="textarea"
            rows={3}
            label={isEn ? 'Damage Circumstances & Field Notes' : 'फसल क्षति का विस्तृत विवरण'}
            value={claimForm.damageDescription}
            onChange={(e) => setClaimForm({ ...claimForm, damageDescription: e.target.value })}
            placeholder={isEn ? 'Describe field water-logging or crop standing condition...' : 'खेत में पानी भरने अथवा फसल की वर्तमान स्थिति का विवरण...'}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-paper-200">
            <Button type="button" variant="outline" onClick={() => setIsClaimModalOpen(false)}>
              {isEn ? 'Cancel' : 'रद्द करें'}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? (isEn ? 'Submitting Claim...' : 'दावा दर्ज किया जा रहा है...') : (isEn ? 'Submit Claim for Survey' : 'सर्वेक्षण हेतु दावा दर्ज करें')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
