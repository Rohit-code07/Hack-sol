import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import useAuth from '../../../hooks/useAuth';
import { reconcileInsurance } from '../../../services/entitlementService';
import { formatCurrency } from '../../../utils/formatters';
import Field from '../../../components/common/Field';
import Panel from '../../../components/common/Panel';
import Stamp from '../../../components/common/Stamp';
import Button from '../../../components/common/Button';
import TermHint from '../../../components/common/TermHint';
import useReducedMotion from '../../../hooks/useReducedMotion';

/**
 * PMFBY Crop Insurance Reconciler with dynamic policy verification and scale-in report.
 */
export default function InsuranceReconcilerTab() {
  const { t, i18n } = useTranslation();
  const { farmerId } = useAuth();
  const prefersReducedMotion = useReducedMotion();

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
    } finally {
      setLoading(false);
    }
  };

  const isVerified = result?.status === 'PAID' || result?.status === 'VERIFIED' || result?.status === 'ACTIVE';
  const isMismatch = result?.status === 'MISMATCH' || result?.status === 'NOT_ELIGIBLE';
  const panelAccent = isMismatch ? 'rust' : isVerified ? 'sage' : 'ochre';

  return (
    <div className="space-y-6">
      <div className="border-b border-paper-200 pb-3 flex items-start justify-between gap-4">
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
    </div>
  );
}
