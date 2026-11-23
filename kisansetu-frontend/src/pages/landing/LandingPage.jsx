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
import { farmers, grievances } from '../../constants/mockData';
import { formatCurrency } from '../../utils/formatters';

import emblemSvg from '../../assets/emblem.svg';
import digitalIndiaSvg from '../../assets/digital-india.svg';
import ministrySealSvg from '../../assets/ministry-seal.svg';
import cadastreMapSvg from '../../assets/cadastre-map.svg';

/**
 * Modern Government Agricultural Entitlement & Cadastre Portal (KisanSetu).
 * Features authentic Ministry of Agriculture & Digital India branding,
 * 1-click interactive cadastre simulator, scheme ledgers, and zero empty space.
 */
export default function LandingPage() {
  const { t, i18n } = useTranslation();
  useDocumentTitle('landing.badge', 'किसान सेतु • राष्ट्रीय कृषि डिजिटल अधिकार मंच');
  const { language, toggleLanguage } = useContext(LanguageContext);
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

  const totalFarmersCount = farmers.length || 10;
  const totalGrievancesCount = grievances?.length || 4;
  const mockEntitlementGap = 142000;

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
      name: 'रामेश कुमार (Ramesh Kumar)',
      khasra: 'खसरा संख्या 42/1',
      village: 'चंद्रपुर खुर्द, वर्धा (महाराष्ट्र)',
      area: '1.45 हेक्टेयर (सिंचित)',
      status: 'VERIFIED',
      kccEligible: 280000,
      kccDisbursed: 150000,
      kccGap: 130000,
      pmKisan: '16वीं किस्त अंतरित (DBT Active)',
      note: 'भूलेख 7/12 व आधार नाम 100% सत्यापित। कोई विवाद नहीं।',
      badgeColor: 'bg-sage-100 text-sage-600 border-sage-600',
    },
    {
      id: 'FRM-0001',
      name: 'बलवंत सिंह (Balwant Singh)',
      khasra: 'खसरा संख्या 108/B',
      village: 'भोगपुर, मेरठ (उत्तर प्रदेश)',
      area: '2.80 हेक्टेयर (दो-फसली)',
      status: 'VERIFIED',
      kccEligible: 420000,
      kccDisbursed: 250000,
      kccGap: 170000,
      pmKisan: 'e-KYC पूर्ण • DBT Active',
      note: 'खतौनी खाता संख्या 004190 रिकॉर्ड मिलान सफल।',
      badgeColor: 'bg-sage-100 text-sage-600 border-sage-600',
    },
    {
      id: 'FRM-0004',
      name: 'राजेश शिंदे (Rajesh Shinde)',
      khasra: 'खसरा संख्या 77/3',
      village: 'देवली, वर्धा (महाराष्ट्र)',
      area: '0.90 हेक्टेयर (असिंचित)',
      status: 'MISMATCH',
      kccEligible: 120000,
      kccDisbursed: 120000,
      kccGap: 0,
      pmKisan: 'आधार बैंक खाता इनएक्टिव',
      note: 'चेतावनी: सहकारी बैंक व PNB में दोहरा बंधक दावा दर्ज!',
      badgeColor: 'bg-rust-100 text-rust-600 border-rust-600',
    },
  ];

  const currentDemo = demoProfiles.find((d) => d.id === selectedDemoId) || demoProfiles[0];

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col bg-paper-50 bg-grain">
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
              <span className="font-bold">भारत सरकार</span>
              <span className="text-ink-muted">|</span>
              <span>कृषि एवं किसान कल्याण मंत्रालय</span>
              <span className="hidden md:inline text-ink-muted">• Ministry of Agriculture & Farmers Welfare</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            {/* Toll-Free Kisan Helpline Badge */}
            <a
              href="tel:18001801551"
              className="inline-flex items-center gap-1.5 text-clay-700 font-bold bg-paper-50 px-2 py-0.5 rounded-xs border border-indigo-900/30 hover:bg-paper-200 transition-colors"
            >
              <PhoneCall className="w-3 h-3 text-clay-500" />
              <span>टोल-फ्री किसान कॉल सेंटर: 1800-180-1551</span>
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
                राष्ट्रीय कृषि डिजिटल अधिकार एवं भूलेख समाधान पोर्टल
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
              सरकारी योजनाएं
            </a>
            <a href="#simulator" className="hover:text-clay-600 transition-colors">
              हक कैलकुलेटर
            </a>
            <a href="#cadastre" className="hover:text-clay-600 transition-colors">
              भूलेख नक्शा
            </a>
            <a href="#impact" className="hover:text-clay-600 transition-colors">
              किसान अनुभव
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
              पोर्टल प्रवेश • Login
            </Button>
          </Link>
        </div>
      </header>

      {/* 3. Hero Section: Rich, Full, Government Editorial Layout */}
      <section className="relative overflow-x-hidden w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-saffron-100/40 via-paper-50 to-paper-50 pt-8 sm:pt-14 pb-12 sm:pb-16 border-b-2 border-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column: Headlines & Dual Persona Access Cards */}
            <div className="lg:col-span-7 flex flex-col items-start">
              
              {/* National Initiative Badge */}
              <div className="hero-badge-anim inline-flex items-center gap-2 px-3 py-1 bg-paper-100 border-2 border-indigo-900 rounded-sm text-xs uppercase font-bold tracking-wider text-clay-700 mb-4 shadow-hard-sm">
                <ShieldCheck className="w-4 h-4 text-clay-500" />
                <span>डिजिटल भारत • 100% आधार व भूलेख 7/12 प्रमाणित मंच</span>
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
                भूलेख (डिजिटल 7/12 व खसरा), किसान क्रेडिट कार्ड (KCC), PM-KISAN सम्मान निधि और न्यूनतम समर्थन मूल्य (MSP) का स्वचालित डिजिटल समाधान। छोटे किसानों को मिले पूरा हक, और बैंक शाखा को मिले धोखाधड़ी मुक्त सत्यापन।
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
                        किसान सेवा
                      </span>
                    </div>
                    <h2 className="font-bold font-serif text-lg text-indigo-900 group-hover:text-clay-600 transition-colors">
                      किसान सेवा केंद्र • Farmer Portal
                    </h2>
                    <p className="text-xs text-ink-muted mt-1 leading-snug">
                      अपनी ज़मीन का 7/12 खाता, KCC ऋण अंतराल, सब्सिडी व शिकायत सीधे दर्ज करें।
                    </p>
                  </div>
                  <div className="pt-3 mt-4 border-t border-paper-200 flex items-center justify-between text-xs font-bold text-clay-500">
                    <span>पोर्टल खोलें (1-क्लिक डेमो)</span>
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
                        बैंक शाखा
                      </span>
                    </div>
                    <h2 className="font-bold font-serif text-lg text-indigo-900 group-hover:text-clay-600 transition-colors">
                      बैंक अधिकारी कंसोल • Officer Console
                    </h2>
                    <p className="text-xs text-ink-muted mt-1 leading-snug">
                      डिजिटल भूलेख कैडस्ट्रे मिलान, दोहरे बंधक की जांच व ऋण आवेदन त्वरित ऑडिट।
                    </p>
                  </div>
                  <div className="pt-3 mt-4 border-t border-paper-200 flex items-center justify-between text-xs font-bold text-indigo-900">
                    <span>ऑडिट कंसोल खोलें</span>
                    <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </div>
              </div>

              {/* 24x7 Citizen Helpline Pill */}
              <div className="flex items-center gap-2 text-xs text-ink-muted">
                <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0" />
                <span>निःशुल्क सरकारी सेवा • किसी पासवर्ड या ओटीपी की आवश्यकता नहीं (डेमो सिमुलेशन)</span>
              </div>
            </div>

            {/* Right Column: Mitti aur Suraj Editorial Artwork & Live Verified Seal */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-paper-100 border-2 border-indigo-900 rounded-sm p-6 shadow-hard-lg relative overflow-hidden">
                
                {/* Official Verification Stamp Ribbon */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-sage-100 border border-sage-600 rounded-xs text-[10px] font-bold text-sage-700 uppercase tracking-wider">
                  <Check className="w-3 h-3 text-sage-600" />
                  <span>भूलेख 7/12 सत्यापित</span>
                </div>

                <div className="text-xs font-serif font-bold text-indigo-900 uppercase tracking-wider mb-2">
                  राजस्व अभिलेख एवं डिजिटल कैडस्ट्रे
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
                    <span>आज 12,480+ भूलेख रिकॉर्ड्स का मिलान</span>
                  </span>
                  <span className="text-clay-500 font-bold font-mono">100% पारदर्शी</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. NEW SECTION: 1-Click Interactive Cadastre & Haq Gap Simulator (Instant Demo) */}
      <section id="simulator" className="py-12 sm:py-16 bg-paper-100/60 border-b-2 border-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-3xl mb-8">
            <span className="text-xs uppercase font-bold tracking-wider text-clay-500 block mb-1">
              लाइव सिमुलेटर • Interactive Hackathon Testing
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif text-indigo-900">
              अपनी ज़मीन का सर्वे नंबर चुनें और तुरंत 'हक अंतराल' देखें
            </h2>
            <p className="text-sm text-ink-muted mt-2">
              बिना लॉगिन किए देखें कि किसान सेतु कैसे डिजिटल 7/12 और बैंक रिकॉर्ड्स का मिलान कर के अटके हुए अधिकार तुरंत निकालता है:
            </p>
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
                    <span className="text-ink-muted block text-[11px]">कुल भूमि क्षेत्रफल (Land Area):</span>
                    <span className="font-bold text-indigo-900 text-sm mt-0.5 block">{currentDemo.area}</span>
                  </div>
                  <div className="p-3 bg-paper-100 rounded-sm border border-paper-200">
                    <span className="text-ink-muted block text-[11px]">PM-KISAN DBT स्थिति:</span>
                    <span className="font-bold text-sage-600 text-xs mt-0.5 block flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {currentDemo.pmKisan}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-paper-100/80 border-l-4 border-l-clay-500 rounded-xs text-xs text-indigo-900">
                  <span className="font-bold block mb-0.5">ऑटो-ऑडिट निष्कर्ष:</span>
                  <span>{currentDemo.note}</span>
                </div>
              </div>

              {/* Right Column: KCC Haq Gap Assessment Display */}
              <div className="lg:col-span-6 bg-paper-100 p-5 sm:p-6 rounded-sm border-2 border-indigo-900 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold tracking-wider text-clay-700">
                    KCC स्केल ऑफ फाइनेंस (हक गणना)
                  </span>
                  <span className="text-xs font-mono text-ink-muted">Scale: ₹82,000/Ha</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>कानूनी हक (Eligible KCC Limit):</span>
                    <span className="font-bold text-indigo-900 font-mono text-sm">
                      {formatCurrency(currentDemo.kccEligible, i18n.language)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-ink-muted">
                    <span>वर्तमान स्वीकृत ऋण (Current Bank Loan):</span>
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
                      अटका हुआ हक अंतराल (Assessed Haq Gap):
                    </span>
                    <span className="font-serif font-bold text-xl sm:text-2xl text-indigo-900">
                      {formatCurrency(currentDemo.kccGap, i18n.language)}
                    </span>
                  </div>
                  <Link to="/login?role=farmer">
                    <Button variant="primary" size="sm">
                      पूरा दावा देखें →
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
        <div className="flex items-center gap-3 mb-2">
          <Award className="w-5 h-5 text-clay-500" />
          <span className="text-xs uppercase font-bold tracking-wider text-clay-500">
            सरकारी योजनाएं एवं प्रत्यक्ष लाभ • Integrated Government Schemes
          </span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold font-serif text-indigo-900 mb-8">
          किसान सेतु पर मिलने वाले 4 प्रमुख संवैधानिक लाभ
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: PM-KISAN */}
          <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-5 shadow-hard flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-sage-100 text-sage-600 border border-sage-600 rounded-xs">
                  DBT योजना
                </span>
                <span className="text-xs font-serif font-bold text-clay-500">₹6,000/वर्ष</span>
              </div>
              <h3 className="font-bold font-serif text-lg text-indigo-900 mb-2">
                PM-KISAN सम्मान निधि
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                पात्र किसान परिवारों को प्रति वर्ष ₹6,000 की प्रत्यक्ष सहायता तीन समान किस्तों में सीधे आधार-लिंक्ड बैंक खाते में।
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-paper-200">
              <Link to="/login?role=farmer" className="text-xs font-bold text-clay-500 hover:underline flex items-center justify-between">
                <span>DBT स्थिति जांचें</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: KCC Loan */}
          <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-5 shadow-hard flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-clay-100 text-clay-700 border border-clay-500 rounded-xs">
                  4% ब्याज छूट
                </span>
                <span className="text-xs font-serif font-bold text-clay-500">₹3 लाख तक</span>
              </div>
              <h3 className="font-bold font-serif text-lg text-indigo-900 mb-2">
                किसान क्रेडिट कार्ड (KCC)
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                नाबार्ड एवं RBI की आधिकारिक 'स्केल ऑफ फाइनेंस' के अनुसार आपकी वास्तविक बुवाई भूमि के आधार पर रियायती फसल ऋण।
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-paper-200">
              <Link to="/login?role=farmer" className="text-xs font-bold text-clay-500 hover:underline flex items-center justify-between">
                <span>ऋण पात्रता कैलकुलेटर</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 3: PMFBY */}
          <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-5 shadow-hard flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-saffron-100 text-ochre-600 border border-ochre-500 rounded-xs">
                  बीमा सुरक्षा
                </span>
                <span className="text-xs font-serif font-bold text-clay-500">100% क्षतिपूर्ति</span>
              </div>
              <h3 className="font-bold font-serif text-lg text-indigo-900 mb-2">
                प्रधानमंत्री फसल बीमा (PMFBY)
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                सूखा, ओलावृष्टि या बाढ़ जैसी प्राकृतिक आपदाओं में उपग्रह व रिमोट सेंसिंग द्वारा स्वचालित उपज क्षति का सीधा बैंक भुगतान।
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-paper-200">
              <Link to="/login?role=farmer" className="text-xs font-bold text-clay-500 hover:underline flex items-center justify-between">
                <span>क्लेम स्टेटस मिलान</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 4: MSP Legal Guarantee */}
          <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-5 shadow-hard flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-900 border border-indigo-900 rounded-xs">
                  वैधानिक दर
                </span>
                <span className="text-xs font-serif font-bold text-clay-500">23 फसलें</span>
              </div>
              <h3 className="font-bold font-serif text-lg text-indigo-900 mb-2">
                न्यूनतम समर्थन मूल्य (MSP)
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                गेहूं, धान, सोयाबीन व कपास की सरकारी खरीद मंडियों में घोषित वैधानिक न्यूनतम मूल्य सत्यापन और अंडर-पेमेंट की रिकवरी।
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-paper-200">
              <Link to="/login?role=farmer" className="text-xs font-bold text-clay-500 hover:underline flex items-center justify-between">
                <span>मंडी भाव मिलान</span>
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
              <span className="text-xs uppercase font-bold tracking-wider text-clay-500">
                डिजिटल भूलेख एकीकरण • Digital Cadastre Reconciliation
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-indigo-900">
                कागज़ी पटवारी रिपोर्ट का अंत, 10 सेकंड में डिजिटल मिलान
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                भारत के करोड़ों किसान सिर्फ इसलिए समय पर फसल ऋण नहीं ले पाते क्योंकि उनके ज़मीन के खसरा नंबर का बैंक फाइलों से मिलान होने में महीनों लग जाते हैं। किसान सेतु राज्य भूलेख पोर्टल्स (जैसे MahaBhulekh, UP Bhulekh) के साथ सीधा जुड़ा है।
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5 p-2.5 bg-paper-50 rounded-sm border border-paper-200">
                  <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-indigo-900 block">सटीक रकबा व सिंचित स्थिति:</span>
                    <span className="text-ink-muted">नहर से दूरी और बोरवेल के आधार पर सिंचित रकबे की सटीक गणना।</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 bg-paper-50 rounded-sm border border-paper-200">
                  <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-indigo-900 block">दोहरे ऋण की स्वचालित रोकथाम:</span>
                    <span className="text-ink-muted">एक ही खेत पर अलग-अलग बैंकों से जाली ऋण लेने की धोखाधड़ी तुरंत ब्लॉक होती है।</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 bg-paper-50 rounded-sm border border-paper-200">
                  <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-indigo-900 block">48 घंटे में डिजिटल म्यूटेशन पावती:</span>
                    <span className="text-ink-muted">नाम की स्पेलिंग गलती पर तुरंत प्री-फिल्ड शिकायत उत्पन्न होती है।</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/login?role=bank">
                  <Button variant="secondary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                    बैंक सत्यापन प्रक्रिया देखें
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
                <CountUp value={5} /> Rules
              </span>
              <span className="text-xs font-semibold text-clay-700 uppercase tracking-wider mt-1 block">
                स्वचालित विसंगति इंजन
              </span>
              <p className="text-[11px] text-ink-muted mt-0.5">
                नाम विसंगति, दोहरा सर्वे व निष्क्रिय बैंक खाता रोकथाम
              </p>
            </div>

            <div className="p-3 bg-paper-50 border-2 border-indigo-900 rounded-sm shadow-hard-sm">
              <span className="text-3xl sm:text-4xl font-bold font-serif text-indigo-900 block tabular-nums">
                <CountUp
                  value={mockEntitlementGap}
                  format={(val) => formatCurrency(val, i18n.language)}
                />
              </span>
              <span className="text-xs font-semibold text-clay-700 uppercase tracking-wider mt-1 block">
                औसत आकलित हक अंतराल
              </span>
              <p className="text-[11px] text-ink-muted mt-0.5">
                KCC फसल पैमाना, MSP अंतर व PMFBY दावा पुनर्प्राप्ति
              </p>
            </div>

            <div className="p-3 bg-paper-50 border-2 border-indigo-900 rounded-sm shadow-hard-sm">
              <span className="text-3xl sm:text-4xl font-bold font-serif text-indigo-900 block tabular-nums">
                <CountUp value={totalFarmersCount} /> Farmers
              </span>
              <span className="text-xs font-semibold text-clay-700 uppercase tracking-wider mt-1 block">
                सत्यापित कृषक कैचमेंट
              </span>
              <p className="text-[11px] text-ink-muted mt-0.5">
                WCAG 2.2 AA अनुपालित, मोबाइल-प्रथम डिजिटल रिकॉर्ड्स
              </p>
            </div>

            <div className="p-3 bg-paper-50 border-2 border-indigo-900 rounded-sm shadow-hard-sm">
              <span className="text-3xl sm:text-4xl font-bold font-serif text-sage-600 block tabular-nums">
                48 घंटे
              </span>
              <span className="text-xs font-semibold text-clay-700 uppercase tracking-wider mt-1 block">
                नागरिक अधिकार चार्टर SLA
              </span>
              <p className="text-[11px] text-ink-muted mt-0.5">
                राजस्व सुधार एवं नामांतरण शिकायत का अधिकतम समय
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 8. NEW SECTION: Farmer Testimonials & Ground Realities (किसानों की आवाज़) */}
      <section id="impact" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-8 w-full">
        <div className="max-w-2xl mb-8">
          <span className="text-xs uppercase font-bold tracking-wider text-clay-500 block mb-1">
            धरातल पर प्रभाव • Ground Impact Stories
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold font-serif text-indigo-900">
            विदर्भ और पश्चिमी उत्तर प्रदेश के किसानों के वास्तविक अनुभव
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Story 1 */}
          <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-6 shadow-hard flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-clay-500 text-white font-serif font-bold text-base flex items-center justify-center border border-indigo-900">
                  रा
                </div>
                <div>
                  <h4 className="font-bold text-sm text-indigo-900">रामेश कुमार</h4>
                  <span className="text-[11px] text-ink-muted">चंद्रपुर खुर्द, वर्धा (महाराष्ट्र)</span>
                </div>
              </div>
              <p className="text-xs text-ink-muted italic leading-relaxed">
                "बैंक ने आधार में 'रामेश' और 7/12 में 'रमेश' होने के कारण मेरा KCC रोक दिया था। किसान सेतु पर 2 मिनट में डिजिटल मिलान हुआ और ₹1.3 लाख का KCC पास हो गया।"
              </p>
            </div>
            <div className="pt-3 mt-4 border-t border-paper-200 flex items-center justify-between text-[11px] text-sage-700 font-bold">
              <span>✓ समाधान: KCC ऋण स्वीकृत</span>
              <span className="font-mono">₹1,30,000</span>
            </div>
          </div>

          {/* Story 2 */}
          <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-6 shadow-hard flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-900 text-paper-50 font-serif font-bold text-base flex items-center justify-center border border-indigo-900">
                  ब
                </div>
                <div>
                  <h4 className="font-bold text-sm text-indigo-900">बलवंत सिंह</h4>
                  <span className="text-[11px] text-ink-muted">भोगपुर, मेरठ (उत्तर प्रदेश)</span>
                </div>
              </div>
              <p className="text-xs text-ink-muted italic leading-relaxed">
                "खतौनी में पड़ोसी किसान का सर्वे नंबर गलती से दर्ज था। किसान सेतु के म्यूटेशन शिकायत फॉर्म से 48 घंटे में राजस्व लेखपाल ने त्रुटि सुधार कर के पावती रसीद दी।"
              </p>
            </div>
            <div className="pt-3 mt-4 border-t border-paper-200 flex items-center justify-between text-[11px] text-sage-700 font-bold">
              <span>✓ समाधान: 7/12 खतौनी सुधार</span>
              <span className="font-mono">48 Hours SLA</span>
            </div>
          </div>

          {/* Story 3: Bank Officer */}
          <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-6 shadow-hard flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-saffron-500 text-indigo-900 font-serif font-bold text-base flex items-center justify-center border border-indigo-900">
                  सु
                </div>
                <div>
                  <h4 className="font-bold text-sm text-indigo-900">सुनीता वर्मा</h4>
                  <span className="text-[11px] text-ink-muted">लीड बैंक क्रेडिट ऑफिसर, विदर्भ हब</span>
                </div>
              </div>
              <p className="text-xs text-ink-muted italic leading-relaxed">
                "पहले हर ऋण आवेदन में पटवारी रिपोर्ट आने में 15 दिन लगते थे। अब 10 सेकंड में पूरे भूलेख, सिंचित रकबे और पुराने ऋणों का डिजिटल ऑडिट हो जाता है।"
              </p>
            </div>
            <div className="pt-3 mt-4 border-t border-paper-200 flex items-center justify-between text-[11px] text-indigo-900 font-bold">
              <span>✓ समाधान: शून्य NPA धोखाधड़ी</span>
              <span className="font-mono">10s Audit</span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Official Trust Badges & Partner Ministries Strip */}
      <section className="py-8 bg-paper-50 border-t-2 border-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center">
          <span className="text-[11px] uppercase font-bold tracking-wider text-ink-muted block mb-4">
            संबद्ध राष्ट्रीय डिजिटल मिशन एवं नियामक संस्थान
          </span>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-90">
            <div className="flex items-center gap-2">
              <img src={digitalIndiaSvg} alt="Digital India" className="h-8 w-auto" />
            </div>
            <div className="flex items-center gap-2">
              <img src={ministrySealSvg} alt="Ministry of Agriculture" className="h-8 w-auto" />
              <span className="text-xs font-bold text-indigo-900">कृषि मंत्रालय</span>
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

      {/* 10. Modern Government Portal Footer */}
      <Footer />
    </div>
  );
}
