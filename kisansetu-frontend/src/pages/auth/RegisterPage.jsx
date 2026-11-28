import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, UserPlus, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import useToast from '../../hooks/useToast';
import Panel from '../../components/common/Panel';
import Button from '../../components/common/Button';
import Field from '../../components/common/Field';
import Footer from '../../components/common/Footer';
import { maskMobile } from '../../utils/formatters';
import { registerFarmer } from '../../services/authService';
import UniversalFormAssistant from '../../components/common/UniversalFormAssistant';

/**
 * RegisterPage component
 * Farmer profile enrollment page with staggered form fields and feedback toast.
 *
 * @returns {JSX.Element} Registration interface
 */
export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  useDocumentTitle('register.title', 'Farmer Registration');

  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    dob: '',
    gender: 'Male',
    village: '',
    tehsil: 'Arang',
    district: 'Raipur',
    state: 'Chhattisgarh',
    pinCode: '',
    address: '',
    mobile: '',
    alternateMobile: '',
    aadhaarNumber: '',
    category: 'OBC',
    farmerType: 'Individual',
    farmingType: 'Owner',
    primaryCrop: 'Paddy',
    secondaryCrops: '',
    totalLandArea: '3.5',
    irrigationAvailable: true,
    irrigationType: 'Canal',
    soilType: 'Alluvial',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [registeredProfile, setRegisteredProfile] = useState(null);

  const districts = ['Raipur', 'Durg', 'Bilaspur', 'Rajnandgaon', 'Dhamtari', 'Wardha', 'Yavatmal'];
  const categories = ['OBC', 'GENERAL', 'SC', 'ST'];

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = t('register.nameRequired', 'Farmer name is required');
    }
    if (!formData.mobile.trim()) {
      errs.mobile = t('register.mobileRequired', 'Mobile number is required');
    } else if (!/^\d{10}$/.test(formData.mobile.trim())) {
      errs.mobile = t('register.mobileInvalid', 'Please enter a valid 10-digit mobile number');
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        username: formData.mobile.trim(),
        password: formData.password || 'Farmer@123',
      };
      const res = await registerFarmer(payload);
      if (res.success) {
        setRegisteredProfile(res.data);
        showSuccessToast(t('register.toastSuccess', 'Farmer profile created successfully!'));
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || t('errors.generic', 'Registration failed. Please try again.');
      showErrorToast(errMsg);
      setErrors((prev) => ({ ...prev, mobile: errMsg }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper-50 bg-grain">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-paper-50/95 backdrop-blur-md border-b border-indigo-900 px-4 sm:px-8 py-3.5 flex items-center justify-between animate-slide-down">
        <Link
          to="/login"
          className="min-h-[44px] inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-900 hover:text-clay-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400 rounded-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('register.backToLogin', 'Back to Login')}</span>
        </Link>

        <span className="font-serif font-bold text-lg text-indigo-900">
          {t('common.appName', 'KisanSetu')}
        </span>
      </header>

      {/* Main Form or Success Screen */}
      <main className="flex-1 max-w-xl mx-auto px-4 py-8 sm:py-12 w-full flex flex-col justify-center">
        <Panel accent="clay" className="shadow-hard-lg animate-fade-up">
          {registeredProfile ? (
            /* Explicit Success Screen with spring checkmark and scale-in */
            <div className="text-center py-6 space-y-5 animate-scale-in">
              <div className="w-16 h-16 rounded-full bg-sage-100 text-sage-600 border-2 border-sage-600 flex items-center justify-center mx-auto shadow-sm animate-scale-in">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-clay-500 block">
                  {t('register.successBadge', 'Profile Registered')}
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-indigo-900 mt-1">
                  {registeredProfile.name}
                </h1>
                <p className="text-xs text-ink-muted mt-2">
                  {t('register.assignedIdNotice', 'Your synthetic farmer identification has been provisioned:')}
                </p>
                <div className="inline-block font-mono font-bold text-xl text-indigo-900 bg-paper-100 border border-indigo-900 px-4 py-1.5 rounded-sm mt-2 select-all">
                  {registeredProfile.id}
                </div>
              </div>

              <div className="p-4 bg-paper-100 rounded-sm border border-paper-200 text-xs text-left space-y-1.5 animate-fade-up">
                <div className="flex justify-between">
                  <span className="text-ink-muted">{t('farmer.village', 'Village')}:</span>
                  <span className="font-semibold text-indigo-900">{registeredProfile.village}, {registeredProfile.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">{t('farmer.mobile', 'Mobile')}:</span>
                  <span className="font-mono text-indigo-900">{maskMobile(formData.mobile)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-paper-200">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/farmer')}
                  icon={<ArrowRight className="w-4 h-4" />}
                  className="w-full"
                >
                  {t('register.goToDashboardBtn', 'Proceed to Farmer Dashboard')}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4 animate-fade-in">
                <div className="w-10 h-10 rounded-sm bg-clay-100 border border-clay-500 text-clay-500 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold font-serif text-indigo-900">
                    {t('register.title', 'Farmer Profile Enrollment')}
                  </h1>
                  <p className="text-xs text-ink-muted">
                    {t('register.subline', 'Provision a synthetic profile to test land cadastre reconciliation.')}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                {/* AI Universal Smart Form Assistant (Voice + Document) */}
                <UniversalFormAssistant
                  formId="farmer-registration"
                  currentValues={formData}
                  onApplyFields={(updates) => setFormData((prev) => ({ ...prev, ...updates }))}
                />

                {/* 1. Personal & Contact Details */}
                <div className="border-b border-paper-200 pb-1.5">
                  <span className="text-xs font-bold font-serif text-indigo-950 uppercase tracking-wider">
                    {t('register.sec1', '1. Personal & Identification')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-up">
                  <Field
                    id="reg-name"
                    label={t('register.nameLabel', 'Farmer Full Name')}
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={errors.name}
                    placeholder="e.g. Kisan Full Name"
                  />
                  <Field
                    id="reg-father"
                    label={t('register.fatherNameLabel', "Father's / Husband's Name")}
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    placeholder="e.g. Dayaram Kumar"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-up">
                  <Field
                    id="reg-dob"
                    type="date"
                    label={t('register.dobLabel', 'Date of Birth')}
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  />
                  <Field
                    id="reg-gender"
                    type="select"
                    label={t('register.genderLabel', 'Gender')}
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    options={[
                      { value: 'Male', label: 'Male (पुरुष)' },
                      { value: 'Female', label: 'Female (महिला)' },
                      { value: 'Other', label: 'Other (अन्य)' },
                    ]}
                  />
                  <Field
                    id="reg-category"
                    type="select"
                    label={t('register.categoryLabel', 'Social Category')}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    options={categories}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-up">
                  <Field
                    id="reg-mobile"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    label={t('register.mobileLabel', 'Aadhaar-Linked Mobile')}
                    required
                    maxLength={10}
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                    error={errors.mobile}
                    placeholder="9876543210"
                  />
                  <Field
                    id="reg-alt-mob"
                    type="tel"
                    label={t('register.altMobileLabel', 'Alternate Mobile (Optional)')}
                    value={formData.alternateMobile}
                    onChange={(e) => setFormData({ ...formData, alternateMobile: e.target.value.replace(/\D/g, '') })}
                    placeholder="98230XXXXX"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-up">
                  <Field
                    id="reg-aadhaar"
                    label={t('register.aadhaarLabel', 'Aadhaar Number (Masked)')}
                    value={formData.aadhaarNumber}
                    onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                    placeholder="XXXX-XXXX-1234"
                  />
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs uppercase font-bold tracking-wider text-clay-500">
                      {t('register.mobilePreviewLabel', 'Masked Ledger Display')}
                    </span>
                    <div className="bg-paper-100 border border-paper-200 rounded-sm px-3.5 py-2.5 text-sm font-mono text-ink-muted">
                      {formData.mobile ? maskMobile(formData.mobile) : 'XXXXXX----'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 animate-fade-up">
                  <Field
                    id="reg-village"
                    label={t('register.villageLabel', 'Village')}
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    placeholder="e.g. Chandrapur"
                  />
                  <Field
                    id="reg-tehsil"
                    label={t('register.tehsilLabel', 'Tehsil / Block')}
                    value={formData.tehsil}
                    onChange={(e) => setFormData({ ...formData, tehsil: e.target.value })}
                    placeholder="Arang"
                  />
                  <Field
                    id="reg-district"
                    type="select"
                    label={t('register.districtLabel', 'District')}
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    options={districts}
                  />
                  <Field
                    id="reg-state"
                    label={t('register.stateLabel', 'State')}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Chhattisgarh"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-up">
                  <div className="sm:col-span-2">
                    <Field
                      id="reg-address"
                      label={t('register.addressLabel', 'Full Postal Address')}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Ward No. 2, Station Road"
                    />
                  </div>
                  <Field
                    id="reg-pin"
                    label={t('register.pinLabel', 'PIN Code')}
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    placeholder="493441"
                  />
                </div>

                {/* 2. Agricultural Profile */}
                <div className="border-b border-paper-200 pb-1.5 pt-2">
                  <span className="text-xs font-bold font-serif text-indigo-950 uppercase tracking-wider">
                    {t('register.sec2', '2. Agricultural Land & Crops')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-up">
                  <Field
                    id="reg-farmer-type"
                    type="select"
                    label={t('register.scaleLabel', 'Farmer Scale')}
                    value={formData.farmerType}
                    onChange={(e) => setFormData({ ...formData, farmerType: e.target.value })}
                    options={[
                      { value: 'Marginal', label: 'Marginal (< 1 ha)' },
                      { value: 'Small', label: 'Small (1 - 2 ha)' },
                      { value: 'Medium', label: 'Medium / Large' },
                      { value: 'Individual', label: 'Individual Farmer' },
                    ]}
                  />
                  <Field
                    id="reg-farming-type"
                    type="select"
                    label={t('register.tenureLabel', 'Tenure Status')}
                    value={formData.farmingType}
                    onChange={(e) => setFormData({ ...formData, farmingType: e.target.value })}
                    options={[
                      { value: 'Owner', label: 'Land Owner (भू-स्वामी)' },
                      { value: 'Tenant', label: 'Tenant (बटाईदार)' },
                      { value: 'Sharecropper', label: 'Sharecropper' },
                    ]}
                  />
                  <Field
                    id="reg-land-area"
                    type="number"
                    step="0.01"
                    label={t('register.landAreaLabel', 'Total Land (Acres)')}
                    value={formData.totalLandArea}
                    onChange={(e) => setFormData({ ...formData, totalLandArea: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-up">
                  <Field
                    id="reg-primary-crop"
                    label={t('register.cropLabel', 'Primary Crop')}
                    value={formData.primaryCrop}
                    onChange={(e) => setFormData({ ...formData, primaryCrop: e.target.value })}
                    placeholder="Paddy"
                  />
                  <Field
                    id="reg-irrig-type"
                    type="select"
                    label={t('register.irrigLabel', 'Irrigation System')}
                    value={formData.irrigationType}
                    onChange={(e) => setFormData({ ...formData, irrigationType: e.target.value })}
                    options={[
                      { value: 'Canal', label: 'Canal / River' },
                      { value: 'Tube Well', label: 'Tube Well / Bore' },
                      { value: 'Rainfed', label: 'Rainfed (वर्षा)' },
                      { value: 'Drip', label: 'Drip / Micro' },
                    ]}
                  />
                  <Field
                    id="reg-soil"
                    type="select"
                    label={t('register.soilLabel', 'Soil Type')}
                    value={formData.soilType}
                    onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                    options={[
                      { value: 'Alluvial', label: 'Alluvial (जलोढ़)' },
                      { value: 'Black (Regur)', label: 'Black Cotton (काली)' },
                      { value: 'Red & Yellow', label: 'Red & Yellow (लाल-पीली)' },
                      { value: 'Clay Loam', label: 'Clay Loam (दोमट)' },
                    ]}
                  />
                </div>

                {/* 3. Account Password */}
                <div className="border-b border-paper-200 pb-1.5 pt-2">
                  <span className="text-xs font-bold font-serif text-indigo-950 uppercase tracking-wider">
                    {t('register.sec3', '3. Account Security')}
                  </span>
                </div>

                <div className="animate-fade-up">
                  <Field
                    id="reg-password"
                    type="password"
                    label={t('register.passwordLabel', 'Account Password')}
                    placeholder="Default: Farmer@123"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <div className="pt-4 border-t border-paper-200 animate-fade-up" style={{ animationDelay: '250ms' }}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    className="w-full"
                  >
                    {t('register.submitBtn', 'Register Profile')}
                  </Button>
                </div>
              </form>

              <div className="mt-4 flex items-center gap-2 text-xs text-ink-muted animate-fade-in">
                <Shield className="w-3.5 h-3.5 text-clay-500 shrink-0" />
                <span>{t('landing.demoDataNotice', 'Demo Prototype. Synthetic data only.')}</span>
              </div>
            </>
          )}
        </Panel>
      </main>

      <Footer />
    </div>
  );
}
