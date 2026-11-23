import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import farmerVignette1 from '../../assets/farmer-vignette-1.svg';
import farmerVignette2 from '../../assets/farmer-vignette-2.svg';
import farmerVignette3 from '../../assets/farmer-vignette-3.svg';
import farmerVignette4 from '../../assets/farmer-vignette-4.svg';
import ministrySeal from '../../assets/ministry-seal.svg';
import digitalIndiaLogo from '../../assets/digital-india.svg';
import emblemSvg from '../../assets/emblem.svg';
import kccSeal from '../../assets/kcc-seal.svg';
import pmfbySeal from '../../assets/pmfby-seal.svg';
import grievanceSeal from '../../assets/grievance-seal.svg';
import cadastreSeal from '../../assets/cadastre-seal.svg';

import farmerPortrait from '../../assets/farmers/farmer-portrait-1.jpg';
import farmerTractor from '../../assets/farmers/farmer-tractor-plow.jpg';
import farmerDigital from '../../assets/farmers/farmer-digital-tech.jpg';
import farmerWoman from '../../assets/farmers/farmer-woman-harvest.jpg';
import farmerWheat from '../../assets/farmers/farmer-field-wheat.jpg';
import farmerPaddy from '../../assets/farmers/farmer-paddy-rice.jpg';

/**
 * SideFarmerGutters
 * 
 * Full-Height, Continuous Government of India & Farmer Side Rails.
 * Completely bilingual (Hindi & English) responsive rails that scroll with page.
 */
export default function SideFarmerGutters() {
  const location = useLocation();
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const path = location.pathname;

  // 1. Dynamic Primary Seals according to active section (bilingual)
  let primaryLeftSeal = {
    img: farmerVignette1,
    title: isEn ? 'Farmer • KISAN' : 'अन्नदाता • KISAN',
    sub: 'PM-KISAN DBT ₹6,000'
  };
  let primaryRightSeal = {
    img: farmerVignette3,
    title: isEn ? 'Women Farmer • SHG' : 'महिला किसान • SHG',
    sub: isEn ? 'Namo Drone Didi • 4% KCC' : 'नमो ड्रोन दीदी • 4% KCC'
  };
  let advisoryLeft = {
    title: isEn ? 'Direct Benefit Transfer' : 'DBT प्रत्यक्ष लाभ',
    text: isEn ? '100% direct benefit transferred to Aadhaar-seeded accounts' : '100% आधार सीडेड बैंक खातों में सीधी सहायता राशि'
  };
  let advisoryRight = {
    title: isEn ? 'Verified e-KYC' : 'सत्यापित ई-केवाईसी',
    text: isEn ? 'Fast restoration of held benefits through biometric verification' : 'बायोमीट्रिक सत्यापन द्वारा अटके लाभों की त्वरित बहाली'
  };

  if (path.includes('/loan')) {
    primaryLeftSeal = {
      img: kccSeal,
      title: isEn ? 'Kisan Credit • KCC' : 'किसान क्रेडिट • KCC',
      sub: isEn ? '4% Subsidized Interest' : '4% रियायती ब्याज दर'
    };
    primaryRightSeal = {
      img: emblemSvg,
      title: isEn ? 'NABARD Credit' : 'नाबार्ड • NABARD',
      sub: isEn ? 'Institutional Rural Finance' : 'संस्थागत ग्रामीण वित्त'
    };
    advisoryLeft = {
      title: isEn ? 'Interest Subvention (PRI)' : 'ब्याज अनुदान (PRI)',
      text: isEn ? '3% additional rebate on prompt repayment, effective interest only 4%' : 'समय पर अदायगी करने पर 3% अतिरिक्त छूट, प्रभावी ब्याज मात्र 4%'
    };
    advisoryRight = {
      title: isEn ? 'Scale of Finance' : 'स्केल ऑफ फाइनेंस',
      text: isEn ? 'District Technical Committee scales determine crop-wise credit limits' : 'जिला स्तरीय तकनीकी समिति द्वारा फसलवार ऋण सीमा निर्धारित'
    };
  } else if (path.includes('/land')) {
    primaryLeftSeal = {
      img: cadastreSeal,
      title: isEn ? 'Cadastre • 7/12 RoR' : 'भूलेख • 7/12 CADASTRE',
      sub: isEn ? 'Verified Digital Khatauni' : 'सत्यापित डिजिटल खतौनी'
    };
    primaryRightSeal = {
      img: farmerVignette2,
      title: isEn ? 'e-Bhulekh • SATELLITE' : 'ई-भूलेख • SATELLITE',
      sub: isEn ? 'Satellite Parcel Mapping' : 'उपग्रह पार्सल मैपिंग'
    };
    advisoryLeft = {
      title: isEn ? 'GIS Map Integration' : 'भू-नक्शा एकीकरण',
      text: isEn ? '100% satellite geo-referencing of Khasra parcels under AgriStack' : 'AgriStack के अंतर्गत 100% खसरा भूखंडों का सैटेलाइट सीमांकन'
    };
    advisoryRight = {
      title: isEn ? 'Transparent Mutation' : 'पारदर्शी नामांतरण',
      text: isEn ? 'Online mutation verification and digital acknowledgment receipt' : 'राजस्व लेखपाल द्वारा ऑनलाइन म्यूटेशन व पावती'
    };
  } else if (path.includes('/entitlement')) {
    primaryLeftSeal = {
      img: pmfbySeal,
      title: isEn ? 'Crop Security • PMFBY' : 'फसल सुरक्षा • PMFBY',
      sub: isEn ? '100% Insured Coverage' : '100% बीमित सुरक्षा'
    };
    primaryRightSeal = {
      img: kccSeal,
      title: isEn ? 'Statutory Entitlement' : 'संवैधानिक पात्रता',
      sub: isEn ? 'Scale of Finance Limit' : 'स्केल ऑफ़ फाइनेंस'
    };
    advisoryLeft = {
      title: isEn ? 'Satellite Damage Survey' : 'उपग्रह क्षति आंकलन',
      text: isEn ? 'Remote sensing damage survey within 72 hrs of calamity' : 'आपदा उपरांत 72 घंटे में रिमोट सेंसिंग द्वारा नुकसान सर्वे'
    };
    advisoryRight = {
      title: isEn ? 'Legal MSP Guarantee' : 'MSP वैधानिक खरीद',
      text: isEn ? 'Statutory Minimum Support Price guarantee across 23 notified crops' : '23 अधिसूचित फसलों पर न्यूनतम समर्थन मूल्य की सरकारी गारंटी'
    };
  } else if (path.includes('/grievance')) {
    primaryLeftSeal = {
      img: grievanceSeal,
      title: isEn ? 'Ombudsman • LOKPAL' : 'लोकपाल • LOKPAL',
      sub: isEn ? 'Public Grievance Redressal' : 'पारदर्शी जन शिकायत'
    };
    primaryRightSeal = {
      img: digitalIndiaLogo,
      title: isEn ? 'Digital Receipt Slip' : 'डिजिटल पावती रसीद',
      sub: 'AgriStack India'
    };
    advisoryLeft = {
      title: isEn ? 'Citizen Charter SLA' : 'नागरिक अधिकार चार्टर',
      text: isEn ? 'Maximum 48-hour resolution SLA for revenue & bank disputes' : 'राजस्व व बैंक विसंगतियों का अधिकतम 48 घंटे में समाधान SLA'
    };
    advisoryRight = {
      title: isEn ? 'Official Escalation' : 'अधिकारी संज्ञान',
      text: isEn ? 'Direct digital appeal to Lead Bank Officer & Tehsildar level' : 'लीड बैंक ऑफिसर एवं तहसीलदार स्तर पर सीधी डिजिटल अपील'
    };
  } else if (path.includes('/discrepanc')) {
    primaryLeftSeal = {
      img: cadastreSeal,
      title: isEn ? 'Record Audit Desk' : 'दस्तावेज मिलान • AUDIT',
      sub: isEn ? '7/12 & Aadhaar Sync' : '7/12 व आधार सुधार'
    };
    primaryRightSeal = {
      img: grievanceSeal,
      title: isEn ? 'Mutation Helpdesk' : 'म्यूटेशन सुधार • DESK',
      sub: isEn ? 'Talathi Verification Slip' : 'राजस्व लेखपाल पावती'
    };
    advisoryLeft = {
      title: isEn ? 'Auto-Detection' : 'ऑटो-डिटेक्शन',
      text: isEn ? 'Automated resolution for name & account number spelling errors' : 'नाम व खाता संख्या की स्पेलिंग विसंगतियों का स्वतः निवारण'
    };
    advisoryRight = {
      title: isEn ? 'Single-Window Remedy' : 'एकल खिड़की समाधान',
      text: isEn ? 'Free from court rounds, direct correction via digital verification' : 'पटवारी चक्कर से मुक्ति, डिजिटल सत्यापन द्वारा सीधा सुधार'
    };
  }

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0"
    >
      {/* =========================================================================
          LEFT CONTINUOUS SIDE RAIL (Spans Full Height, Zero Empty Space)
          ========================================================================= */}
      <div className="hidden min-[1200px]:flex absolute left-2 xl:left-4 2xl:left-8 top-6 bottom-8 w-28 xl:w-36 2xl:w-44 flex-col gap-4 justify-start overflow-hidden max-h-[calc(100%-3rem)]">
        
        {/* Item 1: Primary Section Seal */}
        <div className="bg-paper-50/95 p-2.5 rounded-sm border border-indigo-900/40 shadow-hard-xs flex flex-col items-center text-center">
          <div className="w-16 h-16 xl:w-22 xl:h-22 flex items-center justify-center">
            <img src={primaryLeftSeal.img} alt="" className="w-full h-full object-contain drop-shadow-xs" />
          </div>
          <span className="text-[10px] xl:text-[12px] font-bold font-serif text-indigo-950 mt-1.5 leading-tight">
            {primaryLeftSeal.title}
          </span>
          <span className="text-[7.5px] xl:text-[9px] text-clay-700 font-mono font-semibold mt-0.5">
            {primaryLeftSeal.sub}
          </span>
        </div>

        {/* Item 2: Authentic Farmer Portrait Photo Card */}
        <div className="bg-paper-50/95 p-2 rounded-sm border border-indigo-900/40 shadow-hard-xs">
          <div className="h-0.5 bg-gradient-to-r from-saffron-500 via-paper-50 to-sage-600 rounded-full mb-1.5" />
          <div className="aspect-[4/3] rounded-xs overflow-hidden border border-paper-200 bg-paper-100">
            <img src={farmerPortrait} alt="अन्नदाता किसान" className="w-full h-full object-cover" />
          </div>
          <div className="mt-1.5 text-center">
            <span className="text-[9.5px] xl:text-[11px] font-bold font-serif text-indigo-950 block">
              {isEn ? 'Farmer Dignity' : 'अन्नदाता गौरव'}
            </span>
            <span className="text-[7.5px] xl:text-[8px] text-sage-700 font-mono font-semibold block">
              {isEn ? '100% DBT Transfer' : '100% DBT हस्तांतरण'}
            </span>
          </div>
        </div>

        {/* Item 3: Section Advisory Card */}
        <div className="bg-paper-100/90 p-2.5 rounded-sm border border-indigo-900/30 shadow-hard-xs text-center">
          <span className="text-[8.5px] xl:text-[10px] font-bold uppercase tracking-wider text-clay-700 block font-mono">
            {advisoryLeft.title}
          </span>
          <p className="text-[7.5px] xl:text-[9px] text-ink-muted leading-tight mt-1">
            {advisoryLeft.text}
          </p>
        </div>

        {/* Item 4: Modern Mechanization Tractor Photo Card */}
        <div className="bg-paper-50/95 p-2 rounded-sm border border-indigo-900/40 shadow-hard-xs">
          <div className="aspect-[4/3] rounded-xs overflow-hidden border border-paper-200 bg-paper-100">
            <img src={farmerTractor} alt="उन्नत कृषि" className="w-full h-full object-cover" />
          </div>
          <div className="mt-1.5 text-center">
            <span className="text-[9.5px] xl:text-[11px] font-bold font-serif text-indigo-950 block">
              {isEn ? 'Modern Agri Tech' : 'उन्नत कृषि यंत्र'}
            </span>
            <span className="text-[7.5px] xl:text-[8px] text-clay-700 font-mono font-semibold block">
              {isEn ? '50% SMAM Subsidy' : '50% SMAM सब्सिडी'}
            </span>
          </div>
        </div>

        {/* Item 5: Official Ministry Watermark Seal */}
        <div className="bg-paper-50/95 p-2.5 rounded-sm border border-indigo-900/40 shadow-hard-xs flex items-center gap-2">
          <img src={ministrySeal} alt="" className="w-7 h-7 shrink-0 object-contain" />
          <div className="leading-tight text-left">
            <span className="text-[9.5px] xl:text-[10px] font-bold font-serif text-indigo-950 block">
              {isEn ? 'Agriculture Ministry' : 'कृषि मंत्रालय'}
            </span>
            <span className="text-[7px] xl:text-[7.5px] text-ink-muted uppercase tracking-wider block">
              {isEn ? 'Govt. of India' : 'भारत सरकार'}
            </span>
          </div>
        </div>

        {/* Item 6: Green Revolution & Paddy Field Photo Card */}
        <div className="bg-paper-50/95 p-2 rounded-sm border border-indigo-900/40 shadow-hard-xs">
          <div className="aspect-[4/3] rounded-xs overflow-hidden border border-paper-200 bg-paper-100">
            <img src={farmerPaddy} alt="हरित क्रांति" className="w-full h-full object-cover" />
          </div>
          <div className="mt-1.5 text-center">
            <span className="text-[9.5px] xl:text-[11px] font-bold font-serif text-indigo-950 block">
              {isEn ? 'Micro Irrigation' : 'सूक्ष्म सिंचाई'}
            </span>
            <span className="text-[7.5px] xl:text-[8px] text-sage-700 font-mono font-semibold block">
              {isEn ? '55% PMKSY Subsidy' : '55% PMKSY अनुदान'}
            </span>
          </div>
        </div>

        {/* Item 7: Verified Cadastre Land Seal */}
        <div className="bg-paper-50/95 p-2.5 rounded-sm border border-indigo-900/40 shadow-hard-xs flex items-center gap-2">
          <img src={cadastreSeal} alt="" className="w-7 h-7 shrink-0 object-contain" />
          <div className="leading-tight text-left">
            <span className="text-[9.5px] xl:text-[10px] font-bold font-serif text-indigo-950 block">
              {isEn ? 'Digital Cadastre' : 'डिजिटल भूलेख'}
            </span>
            <span className="text-[7px] xl:text-[7.5px] text-clay-700 font-mono font-semibold block">
              {isEn ? 'Verified 7/12 RoR' : 'सत्यापित 7/12 खतौनी'}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          RIGHT CONTINUOUS SIDE RAIL (Spans Full Height, Zero Empty Space)
          ========================================================================= */}
      <div className="hidden min-[1200px]:flex absolute right-2 xl:right-4 2xl:right-8 top-6 bottom-8 w-28 xl:w-36 2xl:w-44 flex-col gap-4 justify-start overflow-hidden max-h-[calc(100%-3rem)]">
        
        {/* Item 1: Primary Section Seal */}
        <div className="bg-paper-50/95 p-2.5 rounded-sm border border-indigo-900/40 shadow-hard-xs flex flex-col items-center text-center">
          <div className="w-16 h-16 xl:w-22 xl:h-22 flex items-center justify-center">
            <img src={primaryRightSeal.img} alt="" className="w-full h-full object-contain drop-shadow-xs" />
          </div>
          <span className="text-[10px] xl:text-[12px] font-bold font-serif text-indigo-950 mt-1.5 leading-tight">
            {primaryRightSeal.title}
          </span>
          <span className="text-[7.5px] xl:text-[9px] text-clay-700 font-mono font-semibold mt-0.5">
            {primaryRightSeal.sub}
          </span>
        </div>

        {/* Item 2: Women in Agriculture Photo Card */}
        <div className="bg-paper-50/95 p-2 rounded-sm border border-indigo-900/40 shadow-hard-xs">
          <div className="h-0.5 bg-gradient-to-r from-saffron-500 via-paper-50 to-sage-600 rounded-full mb-1.5" />
          <div className="aspect-[4/3] rounded-xs overflow-hidden border border-paper-200 bg-paper-100">
            <img src={farmerWoman} alt="महिला किसान" className="w-full h-full object-cover" />
          </div>
          <div className="mt-1.5 text-center">
            <span className="text-[9.5px] xl:text-[11px] font-bold font-serif text-indigo-950 block">
              {isEn ? 'Women Farmer SHG' : 'महिला किसान SHG'}
            </span>
            <span className="text-[7.5px] xl:text-[8px] text-clay-700 font-mono font-semibold block">
              {isEn ? 'Namo Drone Didi' : 'नमो ड्रोन दीदी पहल'}
            </span>
          </div>
        </div>

        {/* Item 3: 24x7 Kisan Call Center Live Widget */}
        <div className="bg-paper-100/95 p-2.5 rounded-sm border-2 border-indigo-900 shadow-hard-xs">
          <div className="flex items-center gap-1.5 mb-1 justify-center">
            <div className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" />
            <span className="text-[8px] xl:text-[8.5px] font-bold text-sage-800 uppercase tracking-wider font-mono">
              {isEn ? '24x7 Toll-Free' : '24x7 टोल-फ्री'}
            </span>
          </div>
          <div className="text-[11px] xl:text-[13px] font-bold text-indigo-950 font-serif text-center tabular-nums">
            1800-180-1551
          </div>
          <div className="text-[7px] xl:text-[8px] text-ink-muted text-center leading-tight mt-0.5">
            {isEn ? 'Kisan Call Centre (22 Languages)' : 'राष्ट्रीय किसान कॉल सेंटर (22 भाषाएं)'}
          </div>
        </div>

        {/* Item 4: Crop Security & Wheat Field Photo Card */}
        <div className="bg-paper-50/95 p-2 rounded-sm border border-indigo-900/40 shadow-hard-xs">
          <div className="aspect-[4/3] rounded-xs overflow-hidden border border-paper-200 bg-paper-100">
            <img src={farmerWheat} alt="फसल सुरक्षा" className="w-full h-full object-cover" />
          </div>
          <div className="mt-1.5 text-center">
            <span className="text-[9.5px] xl:text-[11px] font-bold font-serif text-indigo-950 block">
              {isEn ? 'Crop Insurance' : 'फसल बीमा सुरक्षा'}
            </span>
            <span className="text-[7.5px] xl:text-[8px] text-ochre-700 font-mono font-semibold block">
              {isEn ? '100% Insured Area' : '100% बीमित रकबा'}
            </span>
          </div>
        </div>

        {/* Item 5: Digital India Official Seal */}
        <div className="bg-paper-50/95 p-2.5 rounded-sm border border-indigo-900/40 shadow-hard-xs flex items-center gap-2">
          <img src={digitalIndiaLogo} alt="" className="w-7 h-7 shrink-0 object-contain" />
          <div className="leading-tight text-left">
            <span className="text-[9.5px] xl:text-[10px] font-bold font-serif text-indigo-950 block">
              {isEn ? 'Digital India' : 'डिजिटल भारत'}
            </span>
            <span className="text-[7px] xl:text-[7.5px] text-ink-muted uppercase tracking-wider block">AgriStack India</span>
          </div>
        </div>

        {/* Item 6: Digital Tech Farmer Photo Card */}
        <div className="bg-paper-50/95 p-2 rounded-sm border border-indigo-900/40 shadow-hard-xs">
          <div className="aspect-[4/3] rounded-xs overflow-hidden border border-paper-200 bg-paper-100">
            <img src={farmerDigital} alt="डिजिटल तकनीक" className="w-full h-full object-cover" />
          </div>
          <div className="mt-1.5 text-center">
            <span className="text-[9.5px] xl:text-[11px] font-bold font-serif text-indigo-950 block">
              {isEn ? 'Digital Farmer' : 'डिजिटल किसान'}
            </span>
            <span className="text-[7.5px] xl:text-[8px] text-indigo-900 font-mono font-semibold block">
              {isEn ? 'AI Satellite Oversight' : 'AI उपग्रह निगरानी'}
            </span>
          </div>
        </div>

        {/* Item 7: Satyameva Jayate State Emblem */}
        <div className="bg-paper-50/95 p-2.5 rounded-sm border border-indigo-900/40 shadow-hard-xs flex items-center gap-2">
          <img src={emblemSvg} alt="" className="w-7 h-7 shrink-0 object-contain" />
          <div className="leading-tight text-left">
            <span className="text-[9.5px] xl:text-[10px] font-bold font-serif text-indigo-950 block">
              {isEn ? 'Truth Alone Triumphs' : 'सत्यमेव जयते'}
            </span>
            <span className="text-[7px] xl:text-[7.5px] text-ink-muted uppercase tracking-wider block">
              {isEn ? 'Govt. of India Portal' : 'भारत सरकार पोर्टल'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
