import React from 'react';
import { useTranslation } from 'react-i18next';
import { PhoneCall, ShieldCheck, ExternalLink, Globe } from 'lucide-react';
import emblemSvg from '../../assets/emblem.svg';
import digitalIndiaSvg from '../../assets/digital-india.svg';

/**
 * Modern Government of India Ministry & Digital India Footer.
 * Compliant with GIGW (Guidelines for Indian Government Websites) and WCAG 2.2 AA.
 *
 * @returns {JSX.Element}
 */
export default function Footer() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const centralPortals = [
    { name: 'PM-KISAN Portal', url: 'https://pmkisan.gov.in' },
    { name: 'Digital India Bhashini', url: 'https://bhashini.gov.in' },
    { name: 'AgriStack India', url: 'https://agristack.gov.in' },
    { name: 'DBT Bharat Mission', url: 'https://dbtbharat.gov.in' },
    { name: 'National Portal of India', url: 'https://india.gov.in' },
    { name: 'NABARD Rural Credit', url: 'https://nabard.org' },
  ];

  return (
    <footer className="mt-auto border-t-2 border-indigo-900 bg-paper-100 text-indigo-900 relative z-20">
      {/* National Tricolor Top Strip */}
      <div className="h-1.5 w-full flex" aria-hidden="true">
        <div className="w-1/3 bg-[#FF9933]" />
        <div className="w-1/3 bg-white" />
        <div className="w-1/3 bg-[#138808]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 pb-8 border-b border-paper-200">
          {/* Column 1: Ministry Branding */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-3">
              <img src={emblemSvg} alt="National Emblem of India" className="w-12 h-12 shrink-0" />
              <div>
                <span className="font-serif font-bold text-sm block leading-tight text-indigo-900">
                  {isEn ? 'Government of India' : 'भारत सरकार'}
                </span>
                <span className="text-[11px] font-semibold text-clay-700 block leading-tight">
                  {isEn ? 'Ministry of Agriculture & Farmers Welfare' : 'कृषि एवं किसान कल्याण मंत्रालय'}
                </span>
                <span className="text-[10px] text-ink-muted block mt-0.5">
                  {isEn ? 'Department of Agriculture & Farmers Welfare' : 'Ministry of Agriculture & Farmers Welfare'}
                </span>
              </div>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              {isEn 
                ? 'Transparent digital platform for small & marginal farmers land & credit entitlements under Digital Agriculture Mission & Cadastre Integration.'
                : 'डिजिटल कृषि मिशन व भूलेख एकीकरण के अंतर्गत छोटे व सीमांत किसानों के भूमि व ऋण अधिकारों का पारदर्शी मंच।'
              }
            </p>
            <div className="pt-1">
              <img src={digitalIndiaSvg} alt="Digital India Initiative" className="h-9 w-auto border border-indigo-900/40 rounded-xs bg-paper-50 p-1" />
            </div>
          </div>

          {/* Column 2: Government Schemes & Services */}
          <div>
            <h4 className="font-serif font-bold text-sm text-indigo-900 uppercase tracking-wider mb-3">
              {isEn ? 'Affiliated Schemes' : 'संबद्ध सरकारी योजनाएं'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-ink-muted hover:text-clay-600 block">
                  {isEn ? '• PM-KISAN Samman Nidhi (DBT)' : '• PM-KISAN सम्मान निधि योजना (DBT)'}
                </span>
              </li>
              <li>
                <span className="text-ink-muted hover:text-clay-600 block">
                  {isEn ? '• Kisan Credit Card (KCC) 4% Interest' : '• किसान क्रेडिट कार्ड (KCC) 4% ब्याज छूट'}
                </span>
              </li>
              <li>
                <span className="text-ink-muted hover:text-clay-600 block">
                  {isEn ? '• PM Fasal Bima Yojana (PMFBY)' : '• प्रधानमंत्री फसल बीमा योजना (PMFBY)'}
                </span>
              </li>
              <li>
                <span className="text-ink-muted hover:text-clay-600 block">
                  {isEn ? '• Minimum Support Price (MSP) Procurement' : '• न्यूनतम समर्थन मूल्य (MSP) कानूनी खरीद'}
                </span>
              </li>
              <li>
                <span className="text-ink-muted hover:text-clay-600 block">
                  {isEn ? '• Digital Bhulekh 7/12 & Khasra Maps' : '• डिजिटल भूलेख 7/12 व खसरा खतौनी नक्शा'}
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: National Portals Quick Links */}
          <div>
            <h4 className="font-serif font-bold text-sm text-indigo-900 uppercase tracking-wider mb-3">
              {isEn ? 'National Portals' : 'राष्ट्रीय सरकारी पोर्टल'}
            </h4>
            <ul className="space-y-2 text-xs">
              {centralPortals.map((portal) => (
                <li key={portal.name}>
                  <a
                    href={portal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-ink-muted hover:text-clay-600 transition-colors font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-saffron-500 rounded-xs"
                  >
                    <span>{portal.name}</span>
                    <ExternalLink className="w-3 h-3 text-clay-500" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: 24x7 Citizen Helpline & Grievance Charter */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-indigo-900 uppercase tracking-wider">
              {isEn ? 'Farmer Support & Redressal' : 'किसान सहायता व निवारण'}
            </h4>

            {/* Helpline Box */}
            <div className="bg-paper-50 border-2 border-indigo-900 rounded-sm p-3.5 shadow-hard-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-sage-100 border border-sage-600 text-sage-600 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-clay-700 block">
                    {isEn ? 'Kisan Call Centre (Toll-Free)' : 'किसान कॉल सेंटर (टोल-फ्री)'}
                  </span>
                  <a href="tel:18001801551" className="font-mono font-bold text-base text-indigo-900 tracking-tight hover:underline">
                    1800-180-1551
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-sage-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" />
                <span>
                  {isEn ? '24x7 Free Service • 22 Indian Languages' : '24x7 निःशुल्क सेवा • 22 भारतीय भाषाओं में'}
                </span>
              </div>
            </div>

            {/* Citizen Charter Notice */}
            <div className="flex items-start gap-2 text-[11px] text-ink-muted leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-clay-500 shrink-0 mt-0.5" />
              <span>
                {isEn 
                  ? 'Under Citizen Charter, guaranteed digital grievance acknowledgment and revenue correction within 48 hours.'
                  : 'नागरिक घोषणापत्र (Citizen Charter) के अंतर्गत 48 घंटे में डिजिटल शिकायत पावती व राजस्व सुधार का प्रावधान।'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Compliance, Disclaimer, Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-ink-muted text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1">
            <span>
              {isEn ? '© 2026 KisanSetu • Govt of India Digital Agriculture Initiative' : '© 2026 किसान सेतु (KisanSetu) • भारत सरकार डिजिटल कृषि पहल'}
            </span>
            <span>•</span>
            <span>{isEn ? 'GIGW 3.0 & WCAG 2.2 AA Compliant' : 'GIGW 3.0 व WCAG 2.2 AA अनुपालित'}</span>
            <span>•</span>
            <span>{isEn ? 'RTI Act 2005 Aligned' : 'RTI Act 2005 संरेखित'}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-block px-2 py-0.5 rounded-xs border border-indigo-900/30 bg-paper-50 font-mono text-[10px] text-clay-700 font-bold">
              NIC Cloud Hosted • SSL 256-bit
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
