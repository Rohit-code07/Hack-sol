import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import {
  ArrowRight,
  Globe,
  Shield,
  ShieldCheck,
  ChevronRight,
  Sprout,
  Landmark,
  CheckCircle2,
  AlertTriangle,
  Search,
  FileText,
  PhoneCall,
  ExternalLink,
  Layers,
  Scale,
  Award,
  Check,
} from 'lucide-react';
import { LanguageContext } from '../../context/LanguageContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import Footer from '../../components/common/Footer';
import Button from '../../components/common/Button';
import CountUp from '../../components/motion/CountUp';
import Reveal from '../../components/motion/Reveal';
import useGsap from '../../hooks/useGsap';
import useReducedMotion from '../../hooks/useReducedMotion';
import { formatCurrency } from '../../utils/formatters';

import emblemSvg from '../../assets/emblem.svg';
import digitalIndiaSvg from '../../assets/digital-india.svg';
import ministrySealSvg from '../../assets/ministry-seal.svg';
import cadastreMapSvg from '../../assets/cadastre-map.svg';

import farmerVignette1 from '../../assets/farmer-vignette-1.svg';
import farmerVignette2 from '../../assets/farmer-vignette-2.svg';
import farmerVignette3 from '../../assets/farmer-vignette-3.svg';
import farmerVignette4 from '../../assets/farmer-vignette-4.svg';
import kccSeal from '../../assets/kcc-seal.svg';
import pmfbySeal from '../../assets/pmfby-seal.svg';
import grievanceSeal from '../../assets/grievance-seal.svg';
import cadastreSeal from '../../assets/cadastre-seal.svg';

import SideFarmerGutters from '../../components/layout/SideFarmerGutters';
import farmerPortrait from '../../assets/farmers/farmer-portrait-1.jpg';
import farmerTractor from '../../assets/farmers/farmer-tractor-plow.jpg';
import farmerDigital from '../../assets/farmers/farmer-digital-tech.jpg';
import farmerWoman from '../../assets/farmers/farmer-woman-harvest.jpg';
import farmerWheat from '../../assets/farmers/farmer-field-wheat.jpg';
import farmerPaddy from '../../assets/farmers/farmer-paddy-rice.jpg';

/**
 * Modern Government Agricultural Entitlement & Cadastre Portal (KisanSetu).
 * Features authentic Ministry of Agriculture & Digital India branding,
 * responsive side background farmer vignettes, 1-click interactive cadastre simulator,
 * scheme ledgers, and zero empty space.
 */
export default function LandingPage() {
  const { t, i18n } = useTranslation();
  useDocumentTitle('landing.badge', 'किसान सेतु • राष्ट्रीय कृषि डिजिटल अधिकार मंच');
  const { language, toggleLanguage } = useContext(LanguageContext);
  const isEn = language === 'en';
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const containerRef = useRef(null);
  const heroSvgRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Instant Demo Cadastre Simulator State
  const [selectedDemoId, setSelectedDemoId] = useState('FRM-0003');

  // Monitor scroll for header backdrop blur & border shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalFarmersCount = 31;
  const totalGrievancesCount = 7;
  const totalEntitlementGap = 64500;

  // Title words for mask reveal animation
  const heroTitle = t('landing.heroTitle1', 'हर किसान का अधिकार, अब सीधा और पारदर्शी');
  const heroWords = useMemo(() => heroTitle.split(' '), [heroTitle]);

  // Master Hero Entrance Timeline
  useGsap((gsapInstance) => {
    if (prefersReducedMotion) return;

    const tl = gsapInstance.timeline();

    // 1. Badge fade-up 300ms
    tl.fromTo(
      '.hero-badge-anim',
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
    );

    // 2. H1 words mask reveal: translateY(105%) -> 0
    tl.fromTo(
      '.hero-word-inner',
      { yPercent: 105 },
      {
        yPercent: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: 'power3.out',
      },
      '-=0.15'
    );

    // 3. Accent word underline scaleX 0 -> 1
    tl.fromTo(
      '.hero-accent-underline',
      { scaleX: 0, transformOrigin: 'left center' },
      { scaleX: 1, duration: 0.5, ease: 'power2.out' },
      '-=0.2'
    );

    // 4. Subline fade-up 400ms
    tl.fromTo(
      '.hero-subline-anim',
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      '-=0.25'
    );

    // 5. Persona CTA cards fade-up stagger 80ms
    tl.fromTo(
      '.hero-cta-anim',
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        stagger: 0.08,
        ease: 'power2.out',
      },
      '-=0.2'
    );

    // M2.2: SVG Khet line-drawing animation safely wrapped
    const paths = heroSvgRef.current?.querySelectorAll('.draw-path');
    if (paths && paths.length > 0) {
      paths.forEach((path) => {
        let length = 300;
        try {
          if (typeof path.getTotalLength === 'function') {
            length = path.getTotalLength();
          }
        } catch {
          length = 300;
        }
        gsapInstance.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
      });

      tl.to(
        paths,
        {
          strokeDashoffset: 0,
          duration: 1.2,
          ease: 'power2.out',
          stagger: 0.12,
        },
        0.2
      );
    }

    // Suraj circle: 600ms scale-in
    tl.fromTo(
      '.svg-sun',
      { scale: 0, opacity: 0, transformOrigin: 'center center', transformBox: 'fill-box' },
      { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.5)' },
      0.4
    );

    // Fasal stalks grow
    tl.fromTo(
      '.svg-stalk',
      { scaleY: 0, transformOrigin: 'bottom center', transformBox: 'fill-box' },
      { scaleY: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out' },
      0.6
    );

    // Kisan silhouette fade-in last
    tl.fromTo(
      '.svg-kisan',
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: 'power2.out' },
      0.9
    );

    // Ambient sun float
    const sunFloat = gsapInstance.to('.svg-sun', {
      y: -4,
      duration: 3,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });

    const handleVisibility = () => {
      if (document.hidden) {
        sunFloat.pause();
      } else {
        sunFloat.resume();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      sunFloat.kill();
    };
  }, [language, prefersReducedMotion], containerRef);

  // Interactive Cadastre Simulator Profiles
  const demoProfiles = [
    {
      id: 'FRM-0003',
      name: isEn ? 'Ramesh Kumar' : 'रामेश कुमार (Ramesh Kumar)',
      khasra: isEn ? 'Khasra No. 42/1' : 'खसरा संख्या 42/1',
      village: isEn ? 'Chandrapur Khurd, Wardha (MH)' : 'चंद्रपुर खुर्द, वर्धा (महाराष्ट्र)',
      area: isEn ? '1.45 Hectares (Irrigated)' : '1.45 हेक्टेयर (सिंचित)',
      status: 'VERIFIED',
      kccEligible: 280000,
      kccDisbursed: 150000,
      kccGap: 130000,
      pmKisan: isEn ? '16th Installment Disbursed (DBT Active)' : '16वीं किस्त अंतरित (DBT Active)',
      note: isEn ? 'Bhulekh 7/12 & Aadhaar 100% matched. Zero dispute.' : 'भूलेख 7/12 व आधार नाम 100% सत्यापित। कोई विवाद नहीं।',
      badgeColor: 'bg-sage-100 text-sage-600 border-sage-600',
    },
    {
      id: 'FRM-0001',
      name: isEn ? 'Balwant Singh' : 'बलवंत सिंह (Balwant Singh)',
      khasra: isEn ? 'Khasra No. 108/B' : 'खसरा संख्या 108/B',
      village: isEn ? 'Bhogpur, Meerut (UP)' : 'भोगपुर, मेरठ (उत्तर प्रदेश)',
      area: isEn ? '2.80 Hectares (Double-cropped)' : '2.80 हेक्टेयर (दो-फसली)',
      status: 'VERIFIED',
      kccEligible: 420000,
      kccDisbursed: 250000,
      kccGap: 170000,
      pmKisan: isEn ? 'e-KYC Complete • DBT Active' : 'e-KYC पूर्ण • DBT Active',
      note: isEn ? 'Khatauni account no. 004190 record matched successfully.' : 'खतौनी खाता संख्या 004190 रिकॉर्ड मिलान सफल।',
      badgeColor: 'bg-sage-100 text-sage-600 border-sage-600',
    },
    {
      id: 'FRM-0004',
      name: isEn ? 'Rajesh Shinde' : 'राजेश शिंदे (Rajesh Shinde)',
      khasra: isEn ? 'Khasra No. 77/3' : 'खसरा संख्या 77/3',
      village: isEn ? 'Deoli, Wardha (MH)' : 'देवली, वर्धा (महाराष्ट्र)',
      area: isEn ? '0.90 Hectares (Unirrigated)' : '0.90 हेक्टेयर (असिंचित)',
      status: 'MISMATCH',
      kccEligible: 120000,
      kccDisbursed: 120000,
      kccGap: 0,
      pmKisan: isEn ? 'Aadhaar Bank Account Inactive' : 'आधार बैंक खाता इनएक्टिव',
      note: isEn ? 'Warning: Dual mortgage claim registered across Co-op Bank & PNB!' : 'चेतावनी: सहकारी बैंक व PNB में दोहरा बंधक दावा दर्ज!',
      badgeColor: 'bg-rust-100 text-rust-600 border-rust-600',
    },
  ];

  const currentDemo = demoProfiles.find((d) => d.id === selectedDemoId) || demoProfiles[0];

  return (
    <div ref={containerRef} className="min-h-screen bg-paper-50 bg-grain relative overflow-x-hidden flex flex-col">
      <div className="relative flex-1">
        {/* =========================================================================
            RESPONSIVE BACKGROUND WATERMARK VIGNETTES (>=1240px)
            Integrates into paper background; scrolls with content; stops before footer
            ========================================================================= */}
        <SideFarmerGutters />

      {/* 1. Official National Government Top Strip (Tricolor + GoI + Helpline) */}
      <div className="bg-paper-100/90 border-b border-indigo-900/30 text-xs">
        {/* National Tricolor Top Line */}
        <div className="h-1 w-full flex" aria-hidden="true">
          <div className="w-1/3 bg-[#FF9933]" />
          <div className="w-1/3 bg-white" />
          <div className="w-1/3 bg-[#138808]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <img src={emblemSvg} alt="National Emblem of India" className="w-6 h-6 shrink-0" />
            <div className="flex items-center gap-2 text-indigo-900 font-semibold text-[11px] sm:text-xs">
              <span className="font-bold">{isEn ? 'Government of India' : 'भारत सरकार'}</span>
              <span className="text-ink-muted">|</span>
              <span>{isEn ? 'Ministry of Agriculture & Farmers Welfare' : 'कृषि एवं किसान कल्याण मंत्रालय'}</span>
              <span className="hidden md:inline text-ink-muted">
                {isEn ? '• Department of Agriculture & Farmers Welfare' : '• Ministry of Agriculture & Farmers Welfare'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            {/* Toll-Free Kisan Helpline Badge */}
            <a
              href="tel:18001801551"
              className="inline-flex items-center gap-1.5 text-clay-700 font-bold bg-paper-50 px-2 py-0.5 rounded-xs border border-indigo-900/30 hover:bg-paper-200 transition-colors"
            >
              <PhoneCall className="w-3 h-3 text-clay-500" />
              <span>{isEn ? 'Toll-Free Kisan Call Centre: 1800-180-1551' : 'टोल-फ्री किसान कॉल सेंटर: 1800-180-1551'}</span>
            </a>

            <div className="hidden lg:flex items-center gap-1.5 text-sage-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" />
              <span>AgriStack & Bhulekh Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <header
        className={`sticky top-0 z-40 bg-paper-50/95 backdrop-blur-md border-b-2 border-indigo-900 px-4 sm:px-8 py-3 flex items-center justify-between transition-all duration-200 ${
          isScrolled ? 'shadow-hard-sm' : ''
        }`}
      >
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-sm bg-clay-500 border-2 border-indigo-900 flex items-center justify-center text-white font-serif font-bold text-xl shadow-hard-sm group-hover:-translate-y-0.5 transition-transform">
              क
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-xl text-indigo-900 leading-none">
                  किसान सेतु
                </span>
                <span className="font-serif font-bold text-base text-clay-600 leading-none">
                  KisanSetu
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block mt-0.5">
                {isEn ? 'National Agricultural Digital Rights & Cadastre Bridge' : 'राष्ट्रीय कृषि डिजिटल अधिकार एवं भूलेख समाधान पोर्टल'}
              </span>
            </div>
          </Link>

          <div className="hidden xl:flex items-center gap-2 ml-4 pl-4 border-l border-paper-200">
            <img src={digitalIndiaSvg} alt="Digital India" className="h-7 w-auto" />
            <img src={ministrySealSvg} alt="Ministry Seal" className="h-7 w-auto ml-1" />
          </div>
        </div>

        {/* Navigation Links and Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <nav className="hidden lg:flex items-center gap-5 text-xs font-bold text-indigo-900 uppercase tracking-wider">
            <a href="#schemes" className="hover:text-clay-600 transition-colors">
              {isEn ? 'Schemes' : 'सरकारी योजनाएं'}
            </a>
            <a href="#simulator" className="hover:text-clay-600 transition-colors">
              {isEn ? 'Haq Calculator' : 'हक कैलकुलेटर'}
            </a>
            <a href="#cadastre" className="hover:text-clay-600 transition-colors">
              {isEn ? 'Cadastre Map' : 'भूलेख नक्शा'}
            </a>
            <a href="#impact" className="hover:text-clay-600 transition-colors">
              {isEn ? 'Farmer Stories' : 'किसान अनुभव'}
            </a>
          </nav>

          {/* Language Toggle with cross-fade */}
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label={`Switch language to ${language === 'hi' ? 'English' : 'Hindi'}`}
            className="min-h-[40px] flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-900 bg-paper-100 border border-indigo-900 rounded-sm hover:bg-paper-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400"
          >
            <Globe className="w-3.5 h-3.5 text-clay-500" />
            <span key={language} className="animate-fade-in inline-block [animation-duration:150ms]">
              {language === 'hi' ? 'EN' : 'हिंदी'}
            </span>
          </button>

          {/* Main Entrance Button */}
          <Link to="/login">
            <Button variant="primary" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
              {isEn ? 'Portal Login' : 'पोर्टल प्रवेश • Login'}
            </Button>
          </Link>
        </div>
      </header>

      {/* 3. Hero Section: Rich, Full, Government Editorial Layout */}
      <section className="shrink-0 relative overflow-x-hidden w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-saffron-100/40 via-paper-50 to-paper-50 pt-8 sm:pt-14 pb-12 sm:pb-16 border-b-2 border-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column: Headlines & Dual Persona Access Cards */}
            <div className="lg:col-span-7 flex flex-col items-start">
              
              {/* National Initiative Badge */}
              <div className="hero-badge-anim inline-flex items-center gap-2 px-3 py-1 bg-paper-100 border-2 border-indigo-900 rounded-sm text-xs uppercase font-bold tracking-wider text-clay-700 mb-4 shadow-hard-sm">
                <ShieldCheck className="w-4 h-4 text-clay-500" />
                <span>
                  {isEn ? 'Digital India • 100% Aadhaar & 7/12 RoR Certified Platform' : 'डिजिटल भारत • 100% आधार व भूलेख 7/12 प्रमाणित मंच'}
                </span>
              </div>

              {/* H1 with Per-Word Mask Reveal */}
              <h1
                className="text-3xl sm:text-5xl font-bold font-serif text-indigo-900 tracking-tight leading-[1.18] mb-4 select-none"
                aria-label={heroTitle}
              >
                {heroWords.map((word, idx) => {
                  const isAccent =
                    idx === 1 ||
                    word.includes('अधिकार') ||
                    word.toLowerCase().includes('entitlement');

                  return (
                    <span
                      key={idx}
                      className="inline-block overflow-hidden mr-[0.28em] align-top py-0.5"
                    >
                      <span
                        className={`hero-word-inner inline-block relative ${
                          isAccent ? 'italic text-clay-500' : ''
                        }`}
                      >
                        {word}
                        {isAccent && (
                          <span
                            className="hero-accent-underline absolute left-0 right-0 -bottom-1 h-1.5 bg-saffron-400 origin-left"
                            aria-hidden="true"
                          />
                        )}
                      </span>
                    </span>
                  );
                })}
              </h1>

              {/* Subline */}
              <p className="hero-subline-anim text-sm sm:text-base text-ink-muted leading-relaxed mb-6 max-w-xl">
                {isEn
                  ? 'Automated digital reconciliation for Bhulekh (7/12 & Khasra), Kisan Credit Card (KCC), PM-KISAN, and Minimum Support Price (MSP). Small farmers receive their complete entitlements while rural banks eliminate fraudulent multi-mortgage claims.'
                  : 'भूलेख (डिजिटल 7/12 व खसरा), किसान क्रेडिट कार्ड (KCC), PM-KISAN सम्मान निधि और न्यूनतम समर्थन मूल्य (MSP) का स्वचालित डिजिटल समाधान। छोटे किसानों को मिले पूरा हक, और बैंक शाखा को मिले धोखाधड़ी मुक्त सत्यापन।'
                }
              </p>

              {/* Two Prominent Government Access Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl mb-6">
                {/* Farmer Console Entrance */}
                <div
                  onClick={() => navigate('/login?role=farmer')}
                  className="hero-cta-anim p-5 bg-paper-100 border-2 border-indigo-900 rounded-sm shadow-hard hover:shadow-hard-lg hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:scale-[0.98] cursor-pointer transition-all duration-150 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-sm bg-clay-500 text-white flex items-center justify-center shadow-sm">
                        <Sprout className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-clay-100 text-clay-700 border border-clay-500 rounded-xs">
                        {isEn ? 'Farmer Service' : 'किसान सेवा'}
                      </span>
                    </div>
                    <h2 className="font-bold font-serif text-lg text-indigo-900 group-hover:text-clay-600 transition-colors">
                      {isEn ? 'Farmer Service Portal' : 'किसान सेवा केंद्र • Farmer Portal'}
                    </h2>
                    <p className="text-xs text-ink-muted mt-1 leading-snug">
                      {isEn
                        ? 'Check 7/12 land records, KCC entitlement gap, subsidies and register grievances directly.'
                        : 'अपनी ज़मीन का 7/12 खाता, KCC ऋण अंतराल, सब्सिडी व शिकायत सीधे दर्ज करें।'
                      }
                    </p>
                  </div>
                  <div className="pt-3 mt-4 border-t border-paper-200 flex items-center justify-between text-xs font-bold text-clay-500">
                    <span>{isEn ? 'Open Portal (1-Click Demo)' : 'पोर्टल खोलें (1-क्लिक डेमो)'}</span>
                    <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </div>

                {/* Bank Officer Console Entrance */}
                <div
                  onClick={() => navigate('/login?role=bank')}
                  className="hero-cta-anim p-5 bg-paper-100 border-2 border-indigo-900 rounded-sm shadow-hard hover:shadow-hard-lg hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:scale-[0.98] cursor-pointer transition-all duration-150 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-sm bg-indigo-900 text-saffron-400 flex items-center justify-center shadow-sm">
                        <Landmark className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-900 border border-indigo-900 rounded-xs">
                        {isEn ? 'Bank Branch' : 'बैंक शाखा'}
                      </span>
                    </div>
                    <h2 className="font-bold font-serif text-lg text-indigo-900 group-hover:text-clay-600 transition-colors">
                      {isEn ? 'Bank Officer Console' : 'बैंक अधिकारी कंसोल • Officer Console'}
                    </h2>
                    <p className="text-xs text-ink-muted mt-1 leading-snug">
                      {isEn
                        ? 'Digital cadastre cross-check, dual mortgage prevention & instant loan application audit.'
                        : 'डिजिटल भूलेख कैडस्ट्रे मिलान, दोहरे बंधक की जांच व ऋण आवेदन त्वरित ऑडिट।'
                      }
                    </p>
                  </div>
                  <div className="pt-3 mt-4 border-t border-paper-200 flex items-center justify-between text-xs font-bold text-indigo-900">
                    <span>{isEn ? 'Open Audit Console' : 'ऑडिट कंसोल खोलें'}</span>
                    <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </div>
              </div>

              {/* 24x7 Citizen Helpline Pill */}
              <div className="flex items-center gap-2 text-xs text-ink-muted">
                <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0" />
                <span>
                  {isEn
                    ? 'Free Government Prototype • Zero password or OTP required (Interactive Simulation)'
                    : 'निःशुल्क सरकारी सेवा • किसी पासवर्ड या ओटीपी की आवश्यकता नहीं (डेमो सिमुलेशन)'
                  }
                </span>
              </div>
            </div>

            {/* Right Column: Mitti aur Suraj Editorial Artwork & Live Verified Seal */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-paper-100 border-2 border-indigo-900 rounded-sm p-6 shadow-hard-lg relative overflow-hidden">
                
                {/* Official Verification Stamp Ribbon */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-sage-100 border border-sage-600 rounded-xs text-[10px] font-bold text-sage-700 uppercase tracking-wider">
                  <Check className="w-3 h-3 text-sage-600" />
                  <span>{isEn ? '7/12 RoR Verified' : 'भूलेख 7/12 सत्यापित'}</span>
                </div>

                <div className="text-xs font-serif font-bold text-indigo-900 uppercase tracking-wider mb-2">
                  {isEn ? 'Revenue Records & Digital Cadastre' : 'राजस्व अभिलेख एवं डिजिटल कैडस्ट्रे'}
                </div>

                <svg
                  ref={heroSvgRef}
                  viewBox="0 0 400 320"
                  className="w-full h-auto overflow-visible"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Sun (Suraj) with Scale-In & Ambient Float */}
                  <circle
                    cx="280"
                    cy="90"
                    r="45"
                    className="svg-sun fill-saffron-400/80 stroke-indigo-900"
                    strokeWidth="2.5"
                  />

                  {/* Horizon Line */}
                  <line
                    x1="20"
                    y1="180"
                    x2="380"
                    y2="180"
                    className="draw-path stroke-indigo-900"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Parallel Field Rows (Khet ki parallel lines / medh) */}
                  <path
                    d="M40 290L160 180"
                    className="draw-path stroke-clay-500"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M110 300L200 180"
                    className="draw-path stroke-clay-500"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M190 305L240 180"
                    className="draw-path stroke-clay-500"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M280 305L280 180"
                    className="draw-path stroke-clay-500"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M360 300L320 180"
                    className="draw-path stroke-clay-500"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Farmer Silhouette / Medh Figure */}
                  <g className="svg-kisan">
                    <circle cx="110" cy="135" r="9" className="fill-indigo-900" />
                    <path
                      d="M102 165C102 148 118 148 118 165V180H102V165Z"
                      className="fill-indigo-900"
                    />
                    <line
                      x1="120"
                      y1="145"
                      x2="135"
                      y2="180"
                      className="draw-path stroke-clay-600"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </g>

                  {/* Crop Stalks with scaleY grow */}
                  <path
                    d="M50 240C45 220 55 210 60 215C65 210 75 220 70 240"
                    className="svg-stalk draw-path stroke-sage-600"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M310 245C305 225 315 215 320 220C325 215 335 225 330 245"
                    className="svg-stalk draw-path stroke-sage-600"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M230 230C225 215 235 208 238 212C242 208 250 215 245 230"
                    className="svg-stalk draw-path stroke-sage-600"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Status Ticker Footer */}
                <div className="mt-3 pt-3 border-t border-indigo-900/30 flex items-center justify-between text-xs text-indigo-900 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" />
                    <span>{isEn ? 'Today: 12,480+ Land Records Reconciled' : 'आज 12,480+ भूलेख रिकॉर्ड्स का मिलान'}</span>
                  </span>
                  <span className="text-clay-500 font-bold font-mono">{isEn ? '100% Transparent' : '100% पारदर्शी'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. NEW SECTION: 1-Click Interactive Cadastre & Haq Gap Simulator (Instant Demo) */}
      <section id="simulator" className="py-12 sm:py-16 bg-paper-100/60 border-b-2 border-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          
          {/* Section Header with Responsive Farmer Illustration Badge */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div className="max-w-2xl">
              <span className="text-xs uppercase font-bold tracking-wider text-clay-500 block mb-1">
                {isEn ? 'Live Simulator • Interactive Verification' : 'लाइव सिमुलेटर • Interactive Hackathon Testing'}
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold font-serif text-indigo-900">
                {isEn ? 'Select a Survey Number to View Your Instant "Haq Gap"' : 'अपनी ज़मीन का सर्वे नंबर चुनें और तुरंत \'हक अंतराल\' देखें'}
              </h2>
              <p className="text-sm text-ink-muted mt-2">
                {isEn
                  ? 'Experience how KisanSetu cross-references digital 7/12 land records with bank credit ledgers to uncover held entitlements in seconds:'
                  : 'बिना लॉगिन किए देखें कि किसान सेतु कैसे डिजिटल 7/12 और बैंक रिकॉर्ड्स का मिलान कर के अटके हुए अधिकार तुरंत निकालता है:'
                }
              </p>
            </div>
            
            {/* Inline Cadastre Vector for Simulator */}
            <div className="hidden sm:flex items-center gap-3 bg-paper-50 p-2.5 rounded-sm border-2 border-indigo-900 shadow-hard-sm shrink-0">
              <img src={cadastreSeal} alt="Cadastre" className="w-14 h-14 object-contain mix-blend-multiply" />
              <div className="text-xs">
                <span className="font-bold text-indigo-900 block font-serif">
                  {isEn ? 'Bhulekh & Cadastre Engine' : 'भूलेख व कैडस्ट्रल सिम्युलेटर'}
                </span>
                <span className="text-[10px] text-clay-600 block">
                  {isEn ? '1-Click Transparent Audit' : '1-क्लिक पारदर्शी सत्यापन'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick 1-Click Survey Selector Buttons */}
          <div className="flex flex-wrap gap-2.5 sm:gap-3 mb-6">
            {demoProfiles.map((p) => {
              const isSelected = selectedDemoId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedDemoId(p.id)}
                  className={`px-4 py-2.5 rounded-sm border-2 text-xs sm:text-sm font-bold transition-all duration-150 flex items-center gap-2 ${
                    isSelected
                      ? 'bg-clay-500 text-white border-indigo-900 shadow-hard'
                      : 'bg-paper-50 text-indigo-900 border-indigo-900/40 hover:border-indigo-900 hover:bg-paper-100'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{p.khasra}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-xs font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-paper-200 text-ink-muted'
                  }`}>
                    {p.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Live Simulated Cadastre & Entitlement Result Card */}
          <div className="bg-paper-50 border-2 border-indigo-900 rounded-sm p-6 sm:p-8 shadow-hard-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Left Column: Citizen & Land Details */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-clay-500">{currentDemo.id}</span>
                    <h3 className="text-xl sm:text-2xl font-bold font-serif text-indigo-900">
                      {currentDemo.name}
                    </h3>
                    <p className="text-xs text-ink-muted">
                      {currentDemo.village} • {currentDemo.khasra}
                    </p>
                  </div>
                  <span className={`font-mono text-xs font-bold px-3 py-1 border-2 rounded-xs ${currentDemo.badgeColor}`}>
                    {currentDemo.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-paper-100 rounded-sm border border-paper-200">
                    <span className="text-ink-muted block text-[11px]">
                      {isEn ? 'Total Land Area:' : 'कुल भूमि क्षेत्रफल (Land Area):'}
                    </span>
                    <span className="font-bold text-indigo-900 text-sm mt-0.5 block">{currentDemo.area}</span>
                  </div>
                  <div className="p-3 bg-paper-100 rounded-sm border border-paper-200">
                    <span className="text-ink-muted block text-[11px]">
                      {isEn ? 'PM-KISAN DBT Status:' : 'PM-KISAN DBT स्थिति:'}
                    </span>
                    <span className="font-bold text-sage-600 text-xs mt-0.5 block flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {currentDemo.pmKisan}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-paper-100/80 border-l-4 border-l-clay-500 rounded-xs text-xs text-indigo-900">
                  <span className="font-bold block mb-0.5">
                    {isEn ? 'Auto-Audit Findings:' : 'ऑटो-ऑडिट निष्कर्ष:'}
                  </span>
                  <span>{currentDemo.note}</span>
                </div>
              </div>

              {/* Right Column: KCC Haq Gap Assessment Display */}
              <div className="lg:col-span-6 bg-paper-100 p-5 sm:p-6 rounded-sm border-2 border-indigo-900 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold tracking-wider text-clay-700">
                    {isEn ? 'KCC Scale of Finance (Assessment)' : 'KCC स्केल ऑफ फाइनेंस (हक गणना)'}
                  </span>
                  <span className="text-xs font-mono text-ink-muted">Scale: ₹82,000/Ha</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{isEn ? 'Statutory Entitlement (KCC Limit):' : 'कानूनी हक (Eligible KCC Limit):'}</span>
                    <span className="font-bold text-indigo-900 font-mono text-sm">
                      {formatCurrency(currentDemo.kccEligible, i18n.language)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-ink-muted">
                    <span>{isEn ? 'Disbursed Credit (Current Bank Loan):' : 'वर्तमान स्वीकृत ऋण (Current Bank Loan):'}</span>
                    <span className="font-mono">{formatCurrency(currentDemo.kccDisbursed, i18n.language)}</span>
                  </div>

                  {/* Visual Comparison Bar */}
                  <div className="w-full bg-paper-200 h-3 rounded-full overflow-hidden flex">
                    <div
                      className="bg-clay-500 h-full"
                      style={{
                        width: `${Math.round((currentDemo.kccDisbursed / currentDemo.kccEligible) * 100)}%`,
                      }}
                    />
                    <div
                      className="bg-saffron-400 h-full animate-pulse"
                      style={{
                        width: `${Math.round((currentDemo.kccGap / currentDemo.kccEligible) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Haq Gap Highlight Callout */}
                <div className="p-3 bg-saffron-100/70 border border-saffron-500 rounded-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-clay-700 block">
                      {isEn ? 'Held Entitlement Gap (Assessed Haq Gap):' : 'अटका हुआ हक अंतराल (Assessed Haq Gap):'}
                    </span>
                    <span className="font-serif font-bold text-xl sm:text-2xl text-indigo-900">
                      {formatCurrency(currentDemo.kccGap, i18n.language)}
                    </span>
                  </div>
                  <Link to="/login?role=farmer">
                    <Button variant="primary" size="sm">
                      {isEn ? 'View Dossier →' : 'पूरा दावा देखें →'}
                    </Button>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 5. NEW SECTION: Major Government Schemes Integrated (सरकारी योजनाएं) */}
      <section id="schemes" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-8 w-full">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-clay-500" />
              <span className="text-xs uppercase font-bold tracking-wider text-clay-500">
                {isEn ? 'Government Schemes & Direct Benefits • Integrated Portals' : 'सरकारी योजनाएं एवं प्रत्यक्ष लाभ • Integrated Government Schemes'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif text-indigo-900">
              {isEn ? '4 Core Statutory Benefits Integrated on KisanSetu' : 'किसान सेतु पर मिलने वाले 4 प्रमुख संवैधानिक लाभ'}
            </h2>
          </div>
          
          {/* Small Woman Farmer Vignette Card */}
          <div className="hidden sm:flex items-center gap-3 bg-paper-100 p-2.5 rounded-sm border-2 border-indigo-900 shadow-hard-sm shrink-0">
            <img src={farmerVignette3} alt="महिला किसान" className="w-14 h-14 object-contain shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-indigo-900 block font-serif">
                {isEn ? 'Women & Small Farmers' : 'महिला व छोटे किसान'}
              </span>
              <span className="text-[10px] text-sage-600 block">
                {isEn ? '100% DBT Direct Transfer' : '100% DBT सीधा अंतरण'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: PM-KISAN */}
          <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-5 shadow-hard flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-sage-100 text-sage-600 border border-sage-600 rounded-xs">
                  {isEn ? 'DBT Scheme' : 'DBT योजना'}
                </span>
                <span className="text-xs font-serif font-bold text-clay-500">
                  {isEn ? '₹6,000/year' : '₹6,000/वर्ष'}
                </span>
              </div>
              <img src={farmerVignette1} alt="PM-KISAN" className="w-12 h-12 mb-2 object-contain mix-blend-multiply opacity-85" />
              <h3 className="font-bold font-serif text-lg text-indigo-900 mb-2">
                {isEn ? 'PM-KISAN Samman Nidhi' : 'PM-KISAN सम्मान निधि'}
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                {isEn
                  ? '₹6,000 annual direct income support to eligible farmer families transferred in 3 equal installments directly into Aadhaar-linked accounts.'
                  : 'पात्र किसान परिवारों को प्रति वर्ष ₹6,000 की प्रत्यक्ष सहायता तीन समान किस्तों में सीधे आधार-लिंक्ड बैंक खाते में।'}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-paper-200">
              <Link to="/login?role=farmer" className="text-xs font-bold text-clay-500 hover:underline flex items-center justify-between">
                <span>{isEn ? 'Check DBT Status' : 'DBT स्थिति जांचें'}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: KCC Loan */}
          <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-5 shadow-hard flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-clay-100 text-clay-700 border border-clay-500 rounded-xs">
                  {isEn ? '4% Subsidized' : '4% ब्याज छूट'}
                </span>
                <span className="text-xs font-serif font-bold text-clay-500">
                  {isEn ? 'Up to ₹3 Lakh' : '₹3 लाख तक'}
                </span>
              </div>
              <img src={kccSeal} alt="KCC" className="w-12 h-12 mb-2 object-contain mix-blend-multiply opacity-85" />
              <h3 className="font-bold font-serif text-lg text-indigo-900 mb-2">
                {isEn ? 'Kisan Credit Card (KCC)' : 'किसान क्रेडिट कार्ड (KCC)'}
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                {isEn
                  ? 'Concessional crop loans based on real cultivated land as per NABARD & RBI official Scale of Finance benchmarks.'
                  : 'नाबार्ड एवं RBI की आधिकारिक \'स्केल ऑफ फाइनेंस\' के अनुसार आपकी वास्तविक बुवाई भूमि के आधार पर रियायती फसल ऋण।'}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-paper-200">
              <Link to="/login?role=farmer" className="text-xs font-bold text-clay-500 hover:underline flex items-center justify-between">
                <span>{isEn ? 'Credit Limit Calculator' : 'ऋण पात्रता कैलकुलेटर'}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 3: PMFBY */}
          <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-5 shadow-hard flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-saffron-100 text-ochre-600 border border-ochre-500 rounded-xs">
                  {isEn ? 'Insurance Cover' : 'बीमा सुरक्षा'}
                </span>
                <span className="text-xs font-serif font-bold text-clay-500">
                  {isEn ? '100% Indemnity' : '100% क्षतिपूर्ति'}
                </span>
              </div>
              <img src={pmfbySeal} alt="PMFBY" className="w-12 h-12 mb-2 object-contain mix-blend-multiply opacity-85" />
              <h3 className="font-bold font-serif text-lg text-indigo-900 mb-2">
                {isEn ? 'Crop Insurance (PMFBY)' : 'प्रधानमंत्री फसल बीमा (PMFBY)'}
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                {isEn
                  ? 'Direct bank settlement of crop losses from drought, flood, or hailstorms verified by satellite remote sensing.'
                  : 'सूखा, ओलावृष्टि या बाढ़ जैसी प्राकृतिक आपदाओं में उपग्रह व रिमोट सेंसिंग द्वारा स्वचालित उपज क्षति का सीधा बैंक भुगतान।'}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-paper-200">
              <Link to="/login?role=farmer" className="text-xs font-bold text-clay-500 hover:underline flex items-center justify-between">
                <span>{isEn ? 'Claim Status Match' : 'क्लेम स्टेटस मिलान'}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 4: MSP Guarantee */}
          <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-5 shadow-hard flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-900 border border-indigo-900 rounded-xs">
                  {isEn ? 'Statutory Floor' : 'वैधानिक दर'}
                </span>
                <span className="text-xs font-serif font-bold text-clay-500">
                  {isEn ? '23 Crops' : '23 फसलें'}
                </span>
              </div>
              <img src={ministrySealSvg} alt="MSP" className="w-12 h-12 mb-2 object-contain mix-blend-multiply opacity-85" />
              <h3 className="font-bold font-serif text-lg text-indigo-900 mb-2">
                {isEn ? 'Minimum Support Price (MSP)' : 'न्यूनतम समर्थन मूल्य (MSP)'}
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                {isEn
                  ? 'Verification of government procurement prices for wheat, paddy, soybean and cotton, and recovery of underpaid amounts.'
                  : 'गेहूं, धान, सोयाबीन व कपास की सरकारी खरीद मंडियों में घोषित वैधानिक न्यूनतम मूल्य सत्यापन और अंडर-पेमेंट की रिकवरी।'}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-paper-200">
              <Link to="/login?role=farmer" className="text-xs font-bold text-clay-500 hover:underline flex items-center justify-between">
                <span>{isEn ? 'Verify Mandi Rates' : 'मंडी भाव मिलान'}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. NEW SECTION: Live Digital Cadastre GIS Map Showcase (भूलेख नक्शा) */}
      <section id="cadastre" className="py-12 sm:py-16 bg-paper-100/50 border-t-2 border-b-2 border-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left: Cadastral Map Vector */}
            <div className="lg:col-span-7">
              <div className="p-3 bg-paper-50 border-2 border-indigo-900 rounded-sm shadow-hard-lg">
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-indigo-900/30 mb-2 text-xs font-bold text-indigo-900">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-clay-500" />
                    <span>ग्राम कैडस्ट्रे नक्शा: चंद्रपुर खुर्द, वर्धा (महाराष्ट्र)</span>
                  </span>
                  <span className="font-mono text-[10px] bg-clay-100 text-clay-700 px-2 py-0.5 rounded-xs border border-clay-500">
                    Live GIS Sync
                  </span>
                </div>
                <img
                  src={cadastreMapSvg}
                  alt="Cadastral Land Records GIS Map"
                  className="w-full h-auto rounded-xs"
                />
              </div>
            </div>

            {/* Right: Technical Explanation of Cadastre Automation */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <img src={farmerVignette2} alt="Digital Kisan" className="w-10 h-10 shrink-0 object-contain" />
                <span className="text-xs uppercase font-bold tracking-wider text-clay-500">
                  {isEn ? 'Digital Cadastre Integration • GIS Mapping' : 'डिजिटल भूलेख एकीकरण • Digital Cadastre'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-indigo-900">
                {isEn ? 'End of Paper Patwari Reports: 10-Second Digital Verification' : 'कागज़ी पटवारी रिपोर्ट का अंत, 10 सेकंड में डिजिटल मिलान'}
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                {isEn
                  ? 'Millions of Indian farmers face loan delays simply because verifying survey numbers against bank ledgers takes months. KisanSetu bridges state Bhulekh portals directly with banking core engines.'
                  : 'भारत के करोड़ों किसान सिर्फ इसलिए समय पर फसल ऋण नहीं ले पाते क्योंकि उनके ज़मीन के खसरा नंबर का बैंक फाइलों से मिलान होने में महीनों लग जाते हैं। किसान सेतु राज्य भूलेख पोर्टल्स (जैसे MahaBhulekh, UP Bhulekh) के साथ सीधा जुड़ा है।'}
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5 p-2.5 bg-paper-50 rounded-sm border border-paper-200">
                  <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-indigo-900 block">
                      {isEn ? 'Accurate Area & Irrigation Standing:' : 'सटीक रकबा व सिंचित स्थिति:'}
                    </span>
                    <span className="text-ink-muted">
                      {isEn
                        ? 'Algorithmic calculation of irrigated area using canal proximity and borewell registry.'
                        : 'नहर से दूरी और बोरवेल के आधार पर सिंचित रकबे की सटीक गणना।'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 bg-paper-50 rounded-sm border border-paper-200">
                  <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-indigo-900 block">
                      {isEn ? 'Automated Multi-Pledge Fraud Prevention:' : 'दोहरे ऋण की स्वचालित रोकथाम:'}
                    </span>
                    <span className="text-ink-muted">
                      {isEn
                        ? 'Simultaneous mortgaging of identical parcels across multiple banks is flagged in real-time.'
                        : 'एक ही खेत पर अलग-अलग बैंकों से जाली ऋण लेने की धोखाधड़ी तुरंत ब्लॉक होती है।'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 bg-paper-50 rounded-sm border border-paper-200">
                  <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-indigo-900 block">
                      {isEn ? '48-Hour Digital Mutation Slip:' : '48 घंटे में डिजिटल म्यूटेशन पावती:'}
                    </span>
                    <span className="text-ink-muted">
                      {isEn
                        ? 'Pre-filled dispute tokens generated instantly whenever spelling or boundary errors are detected.'
                        : 'नाम की स्पेलिंग गलती पर तुरंत प्री-फिल्ड शिकायत उत्पन्न होती है।'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/login?role=bank">
                  <Button variant="secondary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                    {isEn ? 'Explore Bank Verification Workflow' : 'बैंक सत्यापन प्रक्रिया देखें'}
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. Meaningful Verified Proof Points with CountUp */}
      <section className="border-b-2 border-indigo-900 py-8 sm:py-10 bg-paper-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            
            <div className="p-3 bg-paper-50 border-2 border-indigo-900 rounded-sm shadow-hard-sm">
              <span className="text-3xl sm:text-4xl font-bold font-serif text-indigo-900 block tabular-nums">
                <CountUp value={5} /> {isEn ? 'Rules' : 'नियम'}
              </span>
              <span className="text-xs font-semibold text-clay-700 uppercase tracking-wider mt-1 block">
                {isEn ? 'Automated Anomaly Engine' : 'स्वचालित विसंगति इंजन'}
              </span>
              <p className="text-[11px] text-ink-muted mt-0.5">
                {isEn ? 'Name mismatch, duplicate survey & dormant account blocks' : 'नाम विसंगति, दोहरा सर्वे व निष्क्रिय बैंक खाता रोकथाम'}
              </p>
            </div>

            <div className="p-3 bg-paper-50 border-2 border-indigo-900 rounded-sm shadow-hard-sm">
              <span className="text-3xl sm:text-4xl font-bold font-serif text-indigo-900 block tabular-nums">
                <CountUp
                  value={totalEntitlementGap}
                  format={(val) => formatCurrency(val, i18n.language)}
                />
              </span>
              <span className="text-xs font-semibold text-clay-700 uppercase tracking-wider mt-1 block">
                {isEn ? 'Average Entitlement Gap' : 'औसत आकलित हक अंतराल'}
              </span>
              <p className="text-[11px] text-ink-muted mt-0.5">
                {isEn ? 'KCC scale shortfall, MSP gap & PMFBY claim recovery' : 'KCC फसल पैमाना, MSP अंतर व PMFBY दावा पुनर्प्राप्ति'}
              </p>
            </div>

            <div className="p-3 bg-paper-50 border-2 border-indigo-900 rounded-sm shadow-hard-sm">
              <span className="text-3xl sm:text-4xl font-bold font-serif text-indigo-900 block tabular-nums">
                <CountUp value={totalFarmersCount} /> {isEn ? 'Farmers' : 'किसान'}
              </span>
              <span className="text-xs font-semibold text-clay-700 uppercase tracking-wider mt-1 block">
                {isEn ? 'Verified Farmer Catchment' : 'सत्यापित कृषक कैचमेंट'}
              </span>
              <p className="text-[11px] text-ink-muted mt-0.5">
                {isEn ? 'WCAG 2.2 AA compliant, mobile-first digital records' : 'WCAG 2.2 AA अनुपालित, मोबाइल-प्रथम डिजिटल रिकॉर्ड्स'}
              </p>
            </div>

            <div className="p-3 bg-paper-50 border-2 border-indigo-900 rounded-sm shadow-hard-sm">
              <span className="text-3xl sm:text-4xl font-bold font-serif text-sage-600 block tabular-nums">
                {isEn ? '48 Hours' : '48 घंटे'}
              </span>
              <span className="text-xs font-semibold text-clay-700 uppercase tracking-wider mt-1 block">
                {isEn ? 'Citizen Charter SLA' : 'नागरिक अधिकार चार्टर SLA'}
              </span>
              <p className="text-[11px] text-ink-muted mt-0.5">
                {isEn ? 'Max statutory SLA for revenue & mutation dispute slips' : 'राजस्व सुधार एवं नामांतरण शिकायत का अधिकतम समय'}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 8. NEW SECTION: Farmer Testimonials & Ground Realities (किसानों की आवाज़) */}
      <section id="impact" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-8 w-full">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="max-w-2xl">
            <span className="text-xs uppercase font-bold tracking-wider text-clay-500 block mb-1">
              {isEn ? 'Ground Impact Stories • Real Testimonials' : 'धरातल पर प्रभाव • Ground Impact Stories'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif text-indigo-900">
              {isEn ? 'Voices from the Ground: Vidarbha & Western UP Farmers' : 'विदर्भ और पश्चिमी उत्तर प्रदेश के किसानों के वास्तविक अनुभव'}
            </h2>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 bg-paper-100 px-3 py-1.5 rounded-sm border border-indigo-900/40 shrink-0">
            <img src={farmerVignette4} alt="उन्नत कृषि" className="w-9 h-9 shrink-0 object-contain" />
            <span className="text-xs font-bold text-indigo-900 font-serif">
              {isEn ? '100% Ground Verified' : '100% धरातलीय सत्यापन'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Story 1 */}
          <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-6 shadow-hard flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-clay-500 text-white font-serif font-bold text-base flex items-center justify-center border border-indigo-900">
                  {isEn ? 'R' : 'रा'}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-indigo-900">{isEn ? 'Ramesh Kumar' : 'रामेश कुमार'}</h4>
                  <span className="text-[11px] text-ink-muted">
                    {isEn ? 'Chandrapur Khurd, Wardha (MH)' : 'चंद्रपुर खुर्द, वर्धा (महाराष्ट्र)'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-ink-muted italic leading-relaxed">
                {isEn
                  ? '"The bank froze my KCC because Aadhaar had \'Ramesh\' and 7/12 had \'Ramesh Dayaram\'. KisanSetu reconciled the records digitally in 2 minutes and my ₹1.3 Lakh loan was disbursed."'
                  : '"बैंक ने आधार में \'रामेश\' और 7/12 में \'रमेश\' होने के कारण मेरा KCC रोक दिया था। किसान सेतु पर 2 मिनट में डिजिटल मिलान हुआ और ₹1.3 लाख का KCC पास हो गया।"'}
              </p>
            </div>
            <div className="pt-3 mt-4 border-t border-paper-200 flex items-center justify-between text-[11px] text-sage-700 font-bold">
              <span>{isEn ? '✓ Resolution: KCC Sanctioned' : '✓ समाधान: KCC ऋण स्वीकृत'}</span>
              <span className="font-mono">₹1,30,000</span>
            </div>
          </div>

          {/* Story 2 */}
          <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-6 shadow-hard flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-900 text-paper-50 font-serif font-bold text-base flex items-center justify-center border border-indigo-900">
                  {isEn ? 'B' : 'ब'}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-indigo-900">{isEn ? 'Balwant Singh' : 'बलवंत सिंह'}</h4>
                  <span className="text-[11px] text-ink-muted">
                    {isEn ? 'Bhogpur, Meerut (UP)' : 'भोगपुर, मेरठ (उत्तर प्रदेश)'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-ink-muted italic leading-relaxed">
                {isEn
                  ? '"A neighbor\'s survey number was mistakenly mapped onto my Khatauni. Using KisanSetu\'s pre-filled mutation grievance slip, the revenue inspector corrected it within 48 hours."'
                  : '"खतौनी में पड़ोसी किसान का सर्वे नंबर गलती से दर्ज था। किसान सेतु के म्यूटेशन शिकायत फॉर्म से 48 घंटे में राजस्व लेखपाल ने त्रुटि सुधार कर के पावती रसीद दी।"'}
              </p>
            </div>
            <div className="pt-3 mt-4 border-t border-paper-200 flex items-center justify-between text-[11px] text-sage-700 font-bold">
              <span>{isEn ? '✓ Resolution: 7/12 Rectified' : '✓ समाधान: 7/12 खतौनी सुधार'}</span>
              <span className="font-mono">48 Hours SLA</span>
            </div>
          </div>

          {/* Story 3: Bank Officer */}
          <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-6 shadow-hard flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-saffron-500 text-indigo-900 font-serif font-bold text-base flex items-center justify-center border border-indigo-900">
                  {isEn ? 'S' : 'सु'}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-indigo-900">{isEn ? 'Sunita Verma' : 'सुनीता वर्मा'}</h4>
                  <span className="text-[11px] text-ink-muted">
                    {isEn ? 'Lead Bank Credit Officer, Wardha Hub' : 'लीड बैंक क्रेडिट ऑफिसर, विदर्भ हब'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-ink-muted italic leading-relaxed">
                {isEn
                  ? '"Earlier, awaiting physical Patwari reports delayed every single credit application by 15 days. Now, a full audit of cadastre, irrigated acreage, and prior charges happens in 10 seconds."'
                  : '"पहले हर ऋण आवेदन में पटवारी रिपोर्ट आने में 15 दिन लगते थे। अब 10 सेकंड में पूरे भूलेख, सिंचित रकबे और पुराने ऋणों का डिजिटल ऑडिट हो जाता है।"'}
              </p>
            </div>
            <div className="pt-3 mt-4 border-t border-paper-200 flex items-center justify-between text-[11px] text-indigo-900 font-bold">
              <span>{isEn ? '✓ Zero NPA Double-Pledge Fraud' : '✓ समाधान: शून्य NPA धोखाधड़ी'}</span>
              <span className="font-mono">10s Audit</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8.5. NEW SECTION: Modern Government Farmer Welfare & Digital Krishi Showcase
          (राष्ट्रीय अन्नदाता कल्याण एवं डिजिटल कृषि पहल)
          ========================================================================= */}
      <section className="py-12 sm:py-16 bg-paper-100/70 border-t-2 border-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-paper-50 border border-indigo-900/40 rounded-full text-xs font-bold text-clay-700 uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-saffron-500 animate-pulse" />
                {isEn ? 'Official GoI Initiatives • Farmer Welfare Missions' : 'सरकारी पहल एवं अन्नदाता सशक्तिकरण • Official GoI Initiatives'}
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold font-serif text-indigo-900 leading-tight">
                {isEn ? 'National Farmer Welfare & Transparent Digital Agriculture Mission' : 'राष्ट्रीय अन्नदाता कल्याण एवं पारदर्शी डिजिटल कृषि मिशन'}
              </h2>
              <p className="text-sm text-ink-muted mt-2 max-w-2xl leading-relaxed">
                {isEn
                  ? 'Convergence of the Digital Agriculture Mission, Direct Benefit Transfer (DBT), satellite cadastre integration, and women farmer empowerment under the Government of India.'
                  : 'भारत सरकार के डिजिटल कृषि मिशन, प्रत्यक्ष लाभ अंतरण (DBT), उपग्रह भूलेख एकीकरण और महिला कृषक सशक्तिकरण का आधुनिक संगम।'}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-paper-50 p-2.5 rounded-sm border border-indigo-900/30 shadow-hard-xs shrink-0">
              <img src={ministrySealSvg} alt="कृषि मंत्रालय" className="w-10 h-10 shrink-0" />
              <div>
                <span className="text-xs font-bold font-serif text-indigo-950 block">
                  {isEn ? 'Ministry of Agriculture & Farmers Welfare' : 'कृषि एवं किसान कल्याण मंत्रालय'}
                </span>
                <span className="text-[10px] text-ink-muted block">
                  {isEn ? 'Government of India' : 'भारत सरकार'}
                </span>
              </div>
            </div>
          </div>

          {/* 6 Photo Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: PM-KISAN & Annadata */}
            <div className="bg-paper-50 border-2 border-indigo-900 rounded-sm overflow-hidden shadow-hard flex flex-col group hover:-translate-y-1 transition-all duration-200">
              <div className="relative aspect-[16/10] overflow-hidden bg-paper-200">
                <img
                  src={farmerPortrait}
                  alt="अन्नदाता किसान सम्मान"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 bg-saffron-500 text-indigo-950 text-[10px] font-bold font-mono px-2 py-0.5 rounded-xs border border-indigo-900 shadow-sm uppercase">
                  {isEn ? '100% DBT Transfer' : '100% DBT अंतरण'}
                </div>
                <div className="absolute bottom-2 right-2 bg-indigo-950/85 backdrop-blur-xs text-paper-50 text-[10px] font-mono px-2 py-0.5 rounded-xs">
                  {isEn ? '₹3.2 Lakh Cr Disbursed' : '₹3.2 लाख करोड़ वितरित'}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-indigo-950 group-hover:text-clay-600 transition-colors">
                    {isEn ? 'PM-KISAN Samman Nidhi' : 'पीएम-किसान सम्मान निधि (PM-KISAN)'}
                  </h3>
                  <p className="text-xs text-ink-muted mt-2 leading-relaxed">
                    {isEn
                      ? '₹6,000 per year directly to eligible farmer families. Zero middlemen, with biometric and Aadhaar-verified DBT transfers.'
                      : 'हर पात्र किसान परिवार को ₹6,000 प्रति वर्ष सीधा बैंक खाते में। शून्य बिचौलिया, बायोमीट्रिक व आधार-सत्यापित भुगतान।'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-paper-200 flex items-center justify-between text-xs font-bold text-clay-700">
                  <span>{isEn ? '3 Annual Installments' : '3 किस्तों में भुगतान'}</span>
                  <span className="font-mono text-indigo-900">{isEn ? '11+ Cr Farmers' : '11+ करोड़ पंजीकृत किसान'}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Women in Agriculture (Namo Drone Didi) */}
            <div className="bg-paper-50 border-2 border-indigo-900 rounded-sm overflow-hidden shadow-hard flex flex-col group hover:-translate-y-1 transition-all duration-200">
              <div className="relative aspect-[16/10] overflow-hidden bg-paper-200">
                <img
                  src={farmerWoman}
                  alt="महिला किसान सशक्तिकरण"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 bg-sage-600 text-paper-50 text-[10px] font-bold font-mono px-2 py-0.5 rounded-xs border border-indigo-900 shadow-sm uppercase">
                  {isEn ? 'Women Empowerment' : 'महिला किसान सशक्तिकरण'}
                </div>
                <div className="absolute bottom-2 right-2 bg-indigo-950/85 backdrop-blur-xs text-paper-50 text-[10px] font-mono px-2 py-0.5 rounded-xs">
                  {isEn ? '15,000+ Drone Didis' : '15,000+ नमो ड्रोन दीदी'}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-indigo-950 group-hover:text-sage-700 transition-colors">
                    {isEn ? 'Namo Drone Didi & Women SHGs' : 'नमो ड्रोन दीदी एवं महिला स्वयं सहायता समूह'}
                  </h3>
                  <p className="text-xs text-ink-muted mt-2 leading-relaxed">
                    {isEn
                      ? 'Empowering rural women with drone pilot certifications, nano-fertilizer spraying kits, and 4% concessional SHG credit lines.'
                      : 'महिला किसानों को ड्रोन पायलट प्रशिक्षण, नैनो यूरिया छिड़काव उपकरण और SHG समूह हेतु 4% रियायती कृषि ऋण सुविधा।'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-paper-200 flex items-center justify-between text-xs font-bold text-sage-800">
                  <span>{isEn ? 'Lakhpati Didi Initiative' : 'लखपति दीदी पहल'}</span>
                  <span className="font-mono text-indigo-900">{isEn ? '80% Equipment Subsidy' : '80% उपकरण सब्सिडी'}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Modern Mechanization */}
            <div className="bg-paper-50 border-2 border-indigo-900 rounded-sm overflow-hidden shadow-hard flex flex-col group hover:-translate-y-1 transition-all duration-200">
              <div className="relative aspect-[16/10] overflow-hidden bg-paper-200">
                <img
                  src={farmerTractor}
                  alt="कृषि यंत्रीकरण उप-मिशन"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 bg-ochre-500 text-indigo-950 text-[10px] font-bold font-mono px-2 py-0.5 rounded-xs border border-indigo-900 shadow-sm uppercase">
                  {isEn ? 'Agri Mechanization (SMAM)' : 'कृषि यंत्रीकरण (SMAM)'}
                </div>
                <div className="absolute bottom-2 right-2 bg-indigo-950/85 backdrop-blur-xs text-paper-50 text-[10px] font-mono px-2 py-0.5 rounded-xs">
                  {isEn ? 'Up to 50% Subsidy' : '50% तक यंत्रीकरण अनुदान'}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-indigo-950 group-hover:text-ochre-700 transition-colors">
                    {isEn ? 'Modern Farm Machinery & Custom Hiring' : 'उन्नत कृषि यंत्र एवं कस्टम हायरिंग केंद्र'}
                  </h3>
                  <p className="text-xs text-ink-muted mt-2 leading-relaxed">
                    {isEn
                      ? '40% to 50% direct subsidy on tractors, rotavators, and laser levelers. Custom hiring centers for small landholders.'
                      : 'ट्रैक्टर, रोटावेटर, रीपर एवं लेजर लैंड लेवलर की खरीद पर 40% से 50% प्रत्यक्ष सब्सिडी। छोटे किसानों के लिए हायरिंग सेंटर।'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-paper-200 flex items-center justify-between text-xs font-bold text-ochre-800">
                  <span>{isEn ? 'Precision Farming' : 'आधुनिक कृषि साधन'}</span>
                  <span className="font-mono text-indigo-900">{isEn ? '55,000+ CHCs' : '55,000+ CHC केंद्र'}</span>
                </div>
              </div>
            </div>

            {/* Card 4: Fasal Bima Yojana */}
            <div className="bg-paper-50 border-2 border-indigo-900 rounded-sm overflow-hidden shadow-hard flex flex-col group hover:-translate-y-1 transition-all duration-200">
              <div className="relative aspect-[16/10] overflow-hidden bg-paper-200">
                <img
                  src={farmerWheat}
                  alt="प्रधानमंत्री फसल बीमा योजना"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 bg-clay-500 text-paper-50 text-[10px] font-bold font-mono px-2 py-0.5 rounded-xs border border-indigo-900 shadow-sm uppercase">
                  {isEn ? 'Crop Safety Shield' : 'फसल सुरक्षा कवच'}
                </div>
                <div className="absolute bottom-2 right-2 bg-indigo-950/85 backdrop-blur-xs text-paper-50 text-[10px] font-mono px-2 py-0.5 rounded-xs">
                  {isEn ? '₹1.5 Lakh Cr Settled' : '₹1.5 लाख करोड़ क्लेम'}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-indigo-950 group-hover:text-clay-600 transition-colors">
                    {isEn ? 'PM Fasal Bima Yojana (PMFBY)' : 'प्रधानमंत्री फसल बीमा योजना (PMFBY)'}
                  </h3>
                  <p className="text-xs text-ink-muted mt-2 leading-relaxed">
                    {isEn
                      ? 'Comprehensive crop risk cover against drought, unseasonal rains, and pests. Affordable 1.5% Rabi and 2% Kharif premium rates.'
                      : 'सूखा, बाढ़, ओलावृष्टि व बेमौसम बारिश से नुकसान पर संपूर्ण सुरक्षा। रबी फसल पर मात्र 1.5% व खरीफ पर 2% न्यूनतम प्रीमियम।'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-paper-200 flex items-center justify-between text-xs font-bold text-clay-700">
                  <span>{isEn ? 'Satellite Loss Assessment' : 'उपग्रह क्षति आंकलन'}</span>
                  <span className="font-mono text-indigo-900">{isEn ? '72-Hour Claim Filing' : '72 घंटे में क्लेम दर्ज'}</span>
                </div>
              </div>
            </div>

            {/* Card 5: AgriStack & Digital 7/12 Cadastre */}
            <div className="bg-paper-50 border-2 border-indigo-900 rounded-sm overflow-hidden shadow-hard flex flex-col group hover:-translate-y-1 transition-all duration-200">
              <div className="relative aspect-[16/10] overflow-hidden bg-paper-200">
                <img
                  src={farmerDigital}
                  alt="डिजिटल कृषि AgriStack मिशन"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 bg-indigo-900 text-paper-50 text-[10px] font-bold font-mono px-2 py-0.5 rounded-xs border border-indigo-900 shadow-sm uppercase">
                  AgriStack DPI
                </div>
                <div className="absolute bottom-2 right-2 bg-indigo-950/85 backdrop-blur-xs text-paper-50 text-[10px] font-mono px-2 py-0.5 rounded-xs">
                  {isEn ? 'Digital Farmer ID' : 'डिजिटल किसान पहचान (Farmer ID)'}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-indigo-950 group-hover:text-indigo-700 transition-colors">
                    {isEn ? 'Digital Cadastre & Unified AgriStack' : 'डिजिटल भूलेख व एकीकृत एग्रीस्टैक (AgriStack)'}
                  </h3>
                  <p className="text-xs text-ink-muted mt-2 leading-relaxed">
                    {isEn
                      ? 'Seamless linkage of village cadastre maps, Khasra entries, and 7/12 RoRs to a single Farmer ID. Instant eligibility checks.'
                      : 'भू-नक्शा, खसरा-खतौनी और 7/12 का डिजिटल रिकॉर्ड एक ही पहचान से लिंक। बिना पटवारी चक्कर के स्वतः पात्रता सत्यापन।'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-paper-200 flex items-center justify-between text-xs font-bold text-indigo-950">
                  <span>{isEn ? 'Satellite Parcel Demarcation' : 'उपग्रह पार्सल मैपिंग'}</span>
                  <span className="font-mono text-indigo-900">{isEn ? '100% Paperless Sync' : '100% पेपरलेस सत्यापन'}</span>
                </div>
              </div>
            </div>

            {/* Card 6: 24x7 Helpline & Call Center */}
            <div className="bg-paper-50 border-2 border-indigo-900 rounded-sm overflow-hidden shadow-hard flex flex-col group hover:-translate-y-1 transition-all duration-200">
              <div className="relative aspect-[16/10] overflow-hidden bg-paper-200">
                <img
                  src={farmerPaddy}
                  alt="राष्ट्रीय किसान हेल्पलाइन"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 bg-sage-600 text-paper-50 text-[10px] font-bold font-mono px-2 py-0.5 rounded-xs border border-indigo-900 shadow-sm uppercase">
                  {isEn ? '24x7 Toll-Free Helpdesk' : '24x7 टोल-फ्री सेवा'}
                </div>
                <div className="absolute bottom-2 right-2 bg-indigo-950/85 backdrop-blur-xs text-paper-50 text-[10px] font-mono px-2 py-0.5 rounded-xs">
                  {isEn ? '22 Indian Languages' : '22 भारतीय भाषाएं'}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-indigo-950 group-hover:text-sage-700 transition-colors">
                    {isEn ? 'National Kisan Call Centre (1800-180-1551)' : 'राष्ट्रीय किसान कॉल सेंटर (KCC 1800-180-1551)'}
                  </h3>
                  <p className="text-xs text-ink-muted mt-2 leading-relaxed">
                    {isEn
                      ? 'Live advisory on weather forecasts, Mandi APMC prices, crop pests, and grievance filing backed by Digital Bhashini voice AI.'
                      : 'मौसम पूर्वानुमान, मंडी भाव, कीट नियंत्रण और योजना पंजीकरण की त्वरित सहायता। डिजिटल भाषिणी वॉइस इंटीग्रेशन समर्थित।'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-paper-200 flex items-center justify-between text-xs font-bold text-sage-800">
                  <span>{isEn ? 'Toll-Free Agronomist Advice' : 'निःशुल्क परामर्श'}</span>
                  <span className="font-mono text-indigo-900">1800-180-1551</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Official Trust Badges & Partner Ministries Strip */}
      <section className="py-8 bg-paper-50 border-t-2 border-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center">
          <span className="text-[11px] uppercase font-bold tracking-wider text-ink-muted block mb-4">
            {isEn ? 'Affiliated National Digital Missions & Regulatory Authorities' : 'संबद्ध राष्ट्रीय डिजिटल मिशन एवं नियामक संस्थान'}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-90">
            <div className="flex items-center gap-2">
              <img src={digitalIndiaSvg} alt="Digital India" className="h-8 w-auto" />
            </div>
            <div className="flex items-center gap-2">
              <img src={ministrySealSvg} alt="Ministry of Agriculture" className="h-8 w-auto" />
              <span className="text-xs font-bold text-indigo-900">
                {isEn ? 'Ministry of Agriculture' : 'कृषि मंत्रालय'}
              </span>
            </div>
            <div className="px-3 py-1 bg-paper-100 border border-indigo-900 rounded-xs text-xs font-bold text-indigo-900 font-mono">
              AgriStack India
            </div>
            <div className="px-3 py-1 bg-paper-100 border border-indigo-900 rounded-xs text-xs font-bold text-clay-700 font-mono">
              PM-KISAN DBT Mission
            </div>
            <div className="px-3 py-1 bg-paper-100 border border-indigo-900 rounded-xs text-xs font-bold text-indigo-900 font-mono">
              NABARD Credit Linkage
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* 10. Modern Government Portal Footer */}
      <Footer />
    </div>
  );
}
