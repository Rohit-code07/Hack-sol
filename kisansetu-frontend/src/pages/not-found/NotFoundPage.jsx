import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import useGsap from '../../hooks/useGsap';
import Button from '../../components/common/Button';
import Footer from '../../components/common/Footer';
import emblemSvg from '../../assets/emblem.svg';

/**
 * NotFoundPage component
 * 404 fallback page featuring spring emblem float and animated heading.
 *
 * @returns {JSX.Element} 404 error interface
 */
export default function NotFoundPage() {
  const { t } = useTranslation();
  const { isAuthenticated, role } = useAuth();
  useDocumentTitle('errors.notFoundTitle', 'Page Not Found');
  const emblemRef = useRef(null);

  // Subtle spring float on emblem: translateY(-6px) -> 0 once
  useGsap((gsap) => {
    if (emblemRef.current) {
      gsap.fromTo(
        emblemRef.current,
        { opacity: 0, y: -6 },
        { opacity: 0.85, y: 0, duration: 0.7, ease: 'back.out(1.7)' }
      );
    }
  }, []);

  const homeDestination = isAuthenticated
    ? role === 'bank'
      ? '/bank'
      : '/farmer'
    : '/';

  return (
    <div className="min-h-screen flex flex-col bg-paper-50 bg-grain">
      <main className="flex-1 max-w-xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <img
          ref={emblemRef}
          src={emblemSvg}
          alt="Emblem"
          className="w-20 h-20 mb-6"
        />

        <span className="font-serif font-bold text-6xl sm:text-7xl text-clay-500 tracking-tight block animate-scale-in">
          404
        </span>

        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-indigo-900 mt-2 mb-3 animate-fade-up">
          {t('errors.notFoundTitle', 'Page Not Found')}
        </h1>

        <p className="text-sm sm:text-base text-ink-muted mb-8 max-w-md animate-fade-up" style={{ animationDelay: '100ms' }}>
          {t('errors.notFoundDesc', 'The requested page or record does not exist in the digital cadastre.')}
        </p>

        <Link to={homeDestination} className="animate-fade-up" style={{ animationDelay: '200ms' }}>
          <Button
            variant="primary"
            size="md"
            icon={<Home className="w-4 h-4" />}
          >
            {t('errors.homeBtn', 'Return to Home Console')}
          </Button>
        </Link>
      </main>

      <Footer />
    </div>
  );
}
