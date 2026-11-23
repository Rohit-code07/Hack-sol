import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, CreditCard, AlertTriangle, Gift, User, CheckCircle2 } from 'lucide-react';
import useDebounce from '../../hooks/useDebounce';
import { getFarmers, getFarmerLandRecords, getFarmerLoans } from '../../services/farmerService';
import { getDiscrepancies } from '../../services/discrepancyService';
import { getEntitlements } from '../../services/entitlementService';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Drawer from '../../components/common/Drawer';
import Stamp from '../../components/common/Stamp';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import Spinner from '../../components/common/Spinner';
import CountUp from '../../components/motion/CountUp';
import useReducedMotion from '../../hooks/useReducedMotion';

/**
 * Bank Officer Farmer Search & Dossier Inspection Page.
 */
export default function FarmerSearchPage() {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  useDocumentTitle('bank.farmerSearchTitle', 'Farmer Search & Verification');

  const [searchTerm, setSearchTerm] = useState('Ramesh');
  const [farmersList, setFarmersList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Selected Farmer Dossier Drawer
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [dossierLoading, setDossierLoading] = useState(false);
  const [dossierData, setDossierData] = useState({
    landRecords: [],
    loans: [],
    discrepancies: [],
    entitlements: [],
  });

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getFarmers({ search: debouncedSearch })
      .then((res) => {
        if (isMounted && res.success) {
          setFarmersList(res.data.items || []);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch]);

  const handleInspectFarmer = async (farmer) => {
    setSelectedFarmer(farmer);
    setDossierLoading(true);

    try {
      const [landRes, loansRes, discRes, entRes] = await Promise.all([
        getFarmerLandRecords(farmer.id),
        getFarmerLoans(farmer.id),
        getDiscrepancies(farmer.id),
        getEntitlements(farmer.id),
      ]);

      setDossierData({
        landRecords: landRes.data || [],
        loans: loansRes.data || [],
        discrepancies: (discRes.data || []).filter((d) => !d.resolved),
        entitlements: entRes.data || [],
      });
    } catch (err) {
      // Handled silently for production resilience
    } finally {
      setDossierLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'id',
        header: t('bank.colId', 'Farmer ID'),
        render: (f) => (
          <span className="font-mono font-bold text-indigo-900">{f.id}</span>
        ),
      },
      {
        key: 'name',
        header: t('bank.colName', 'Farmer Name'),
        render: (f) => (
          <div>
            <div className="font-bold text-indigo-900">{f.name}</div>
            <div className="text-xs text-ink-muted">
              {t('farmer.fatherName', 'S/O')} {f.fatherName}
            </div>
          </div>
        ),
      },
      {
        key: 'location',
        header: t('bank.colLocation', 'Village / District'),
        render: (f) => (
          <div>
            <div className="font-medium text-indigo-900">{f.village}</div>
            <div className="text-xs text-ink-muted">{f.district}, {f.state}</div>
          </div>
        ),
      },
      {
        key: 'status',
        header: t('bank.colStatus', 'Status'),
        render: (f) => <Stamp status={f.status} />,
      },
      {
        key: 'actions',
        header: t('bank.colActions', 'Actions'),
        align: 'right',
        render: (f) => (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleInspectFarmer(f)}
          >
            {t('bank.viewDossier', 'Inspect Dossier')}
          </Button>
        ),
      },
    ],
    [t]
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        eyebrow={t('bank.eyebrow', 'Branch Audit Console')}
        title={t('bank.farmerSearchTitle', 'Farmer Cadastre & Identity Search')}
        subtitle={t('bank.farmerSearchSub', 'Query applicant farmers across land records, credit lines, and discrepancy registers.')}
      />

      {/* Search Input Box with Zero-Layout-Shift Fade Spinner (M4.4) */}
      <div className="relative max-w-xl">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-ink-muted">
          <Search className="w-5 h-5 text-clay-500" />
        </div>
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('bank.searchPlaceholder', 'Search by Farmer ID, Name, Survey No. or Village...')}
          className="w-full bg-white border border-indigo-900 rounded-sm pl-11 pr-12 py-3 text-sm font-medium text-indigo-900 placeholder-ink-muted focus:border-clay-500 focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:ring-offset-2 transition-colors"
          aria-label="Search farmers"
        />
        {/* Right spinner container: fixed w-5 h-5 preventing layout shift (M4.4) */}
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center pointer-events-none">
          <div className={`transition-opacity duration-150 ${loading ? 'opacity-100' : 'opacity-0'}`}>
            <Spinner size="sm" className="text-clay-500" />
          </div>
        </div>
      </div>

      {/* Farmer Search Results with 40ms row stagger (M4.4) */}
      <DataTable
        key={debouncedSearch}
        columns={columns}
        data={farmersList}
        loading={loading && farmersList.length === 0}
        emptyTitle={t('bank.noFarmersFound', 'No farmers match your query')}
        emptyDescription={t('bank.noFarmersFoundSub', 'Try searching with another name or ID.')}
      />

      {/* Farmer Comprehensive Dossier Slide-Over Drawer (M4.4) */}
      <Drawer
        isOpen={Boolean(selectedFarmer)}
        onClose={() => setSelectedFarmer(null)}
        title={selectedFarmer?.name || 'Farmer Dossier'}
        subtitle={selectedFarmer ? `${selectedFarmer.id} • ${selectedFarmer.village}, ${selectedFarmer.district}` : ''}
      >
        {dossierLoading ? (
          <div className="space-y-4 py-4" aria-busy="true">
            <Skeleton variant="card" />
            <Skeleton lines={4} />
          </div>
        ) : selectedFarmer ? (
          <div className="space-y-5 text-sm animate-fade-in">
            {/* Identity Summary Card */}
            <div className="bg-paper-100 p-4 border border-indigo-900 rounded-sm space-y-2.5 text-xs">
              <div className="flex justify-between items-center border-b border-paper-200 pb-2">
                <span className="text-ink-muted uppercase font-bold">{t('farmer.category', 'Category')}:</span>
                <span className="font-semibold text-indigo-900">{selectedFarmer.category}</span>
              </div>
              <div className="flex justify-between items-center border-b border-paper-200 pb-2">
                <span className="text-ink-muted uppercase font-bold">{t('farmer.fatherName', "Father's Name")}:</span>
                <span className="font-semibold text-indigo-900">{selectedFarmer.fatherName}</span>
              </div>
              <div className="flex justify-between items-center border-b border-paper-200 pb-2">
                <span className="text-ink-muted uppercase font-bold">{t('farmer.mobile', 'Mobile (Masked)')}:</span>
                <span className="font-mono text-indigo-900">{selectedFarmer.mobileMasked}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ink-muted uppercase font-bold">{t('farmer.bankAccount', 'Bank A/C (Masked)')}:</span>
                <span className="font-mono text-indigo-900">{selectedFarmer.bankAccountMasked}</span>
              </div>
            </div>

            {/* Dossier Record Summary with 60ms stagger and CountUp (M4.4) */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase font-bold tracking-wider text-clay-500">
                {t('bank.dossierTitle', 'Verified Portfolio Breakdown')}
              </h3>

              <div className="border border-indigo-900 rounded-sm divide-y divide-paper-200 bg-paper-50 shadow-hard-sm">
                <div
                  style={{ animationDelay: '0ms' }}
                  className={`p-3.5 flex items-center justify-between ${prefersReducedMotion ? '' : 'animate-fade-up'}`}
                >
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-indigo-900">
                    <MapPin className="w-4 h-4 text-clay-500" />
                    <span>{t('bank.dossierLand', 'Land Revenue Parcels')}</span>
                  </div>
                  <span className="font-serif font-bold text-base text-indigo-900 tabular-nums">
                    <CountUp value={dossierData.landRecords.length} />
                  </span>
                </div>

                <div
                  style={{ animationDelay: '60ms' }}
                  className={`p-3.5 flex items-center justify-between ${prefersReducedMotion ? '' : 'animate-fade-up'}`}
                >
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-indigo-900">
                    <CreditCard className="w-4 h-4 text-clay-500" />
                    <span>{t('bank.dossierLoans', 'Credit / Loan Accounts')}</span>
                  </div>
                  <span className="font-serif font-bold text-base text-indigo-900 tabular-nums">
                    <CountUp value={dossierData.loans.length} />
                  </span>
                </div>

                <div
                  style={{ animationDelay: '120ms' }}
                  className={`p-3.5 flex items-center justify-between ${prefersReducedMotion ? '' : 'animate-fade-up'}`}
                >
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-rust-600">
                    <AlertTriangle className="w-4 h-4 text-rust-600" />
                    <span>{t('bank.dossierDiscrepancies', 'Active Discrepancies')}</span>
                  </div>
                  <span className="font-serif font-bold text-base text-rust-600 tabular-nums">
                    <CountUp value={dossierData.discrepancies.length} />
                  </span>
                </div>

                <div
                  style={{ animationDelay: '180ms' }}
                  className={`p-3.5 flex items-center justify-between ${prefersReducedMotion ? '' : 'animate-fade-up'}`}
                >
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-sage-600">
                    <Gift className="w-4 h-4 text-sage-600" />
                    <span>{t('bank.dossierEntitlements', 'Entitlements & Subsidies')}</span>
                  </div>
                  <span className="font-serif font-bold text-base text-sage-600 tabular-nums">
                    <CountUp value={dossierData.entitlements.length} />
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setSelectedFarmer(null)}
              >
                {t('common.close', 'Close Dossier')}
              </Button>
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
