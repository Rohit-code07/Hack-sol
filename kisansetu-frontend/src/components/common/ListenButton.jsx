import React from 'react';
import { Volume2, VolumeX, Pause, Play, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useTextToSpeech from '../../hooks/useTextToSpeech';

/**
 * Reusable section-level Listen button for natural website narration.
 * Matches KisanSetu paper & editorial design language with zero layout shift.
 */
export default function ListenButton({
  text,
  sectionId,
  sectionTitle,
  variant = 'pill',
  size = 'sm',
  className = '',
  language = null,
}) {
  const { t, i18n } = useTranslation();
  const { speak, pause, resume, stop, isPlaying, isPaused, activeSectionId } = useTextToSpeech();

  const isCurrentSection = activeSectionId === sectionId;
  const isCurrentlyPlaying = isCurrentSection && isPlaying && !isPaused;
  const isCurrentlyPaused = isCurrentSection && isPaused;

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (isCurrentlyPlaying) {
      pause();
    } else if (isCurrentlyPaused) {
      resume();
    } else {
      const speechText = typeof text === 'function' ? text() : text;
      speak(speechText, {
        sectionId,
        sectionTitle: sectionTitle || t('common.listen', 'Listen'),
        language: language || (i18n.language === 'en' ? 'en' : 'hi'),
      });
    }
  };

  const isEn = i18n.language === 'en';

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={
          isCurrentlyPlaying
            ? isEn ? 'Pause narration' : 'वाचन रोकें'
            : isCurrentlyPaused
            ? isEn ? 'Resume narration' : 'वाचन जारी रखें'
            : isEn ? 'Listen to this section' : 'इस खंड को सुनें'
        }
        title={isCurrentlyPlaying ? (isEn ? 'Pause' : 'रोकें') : (isEn ? 'Listen' : 'सुनें')}
        className={`p-1.5 rounded-xs border transition-all duration-150 inline-flex items-center justify-center ${
          isCurrentSection
            ? 'bg-saffron-500 text-indigo-950 border-indigo-900 shadow-sm animate-pulse'
            : 'bg-paper-100 hover:bg-paper-200 text-indigo-900 border-paper-300'
        } ${className}`}
      >
        {isCurrentlyPlaying ? (
          <Pause className="w-3.5 h-3.5" />
        ) : isCurrentlyPaused ? (
          <Play className="w-3.5 h-3.5" />
        ) : (
          <Volume2 className="w-3.5 h-3.5 text-clay-600" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={
        isCurrentlyPlaying
          ? isEn ? 'Pause narration' : 'वाचन रोकें'
          : isCurrentlyPaused
          ? isEn ? 'Resume narration' : 'वाचन जारी रखें'
          : isEn ? 'Listen aloud' : 'बोलकर सुनें'
      }
      className={`inline-flex items-center gap-1.5 font-sans font-semibold text-xs tracking-wide transition-all duration-150 border rounded-xs focus:outline-none focus:ring-1 focus:ring-indigo-900 select-none ${
        size === 'xs' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      } ${
        isCurrentlyPlaying
          ? 'bg-saffron-500 text-indigo-950 border-indigo-900 shadow-sm font-bold'
          : isCurrentlyPaused
          ? 'bg-amber-100 text-amber-900 border-amber-400 font-bold'
          : 'bg-paper-50 hover:bg-paper-100 text-indigo-900 border-indigo-900/30 hover:border-indigo-900 hover:text-clay-600'
      } ${className}`}
    >
      {isCurrentlyPlaying ? (
        <>
          <span className="flex items-center gap-0.5">
            <span className="w-1 h-3 bg-indigo-950 rounded-full animate-pulse" />
            <span className="w-1 h-2 bg-indigo-950 rounded-full animate-pulse [animation-delay:150ms]" />
            <span className="w-1 h-3.5 bg-indigo-950 rounded-full animate-pulse [animation-delay:300ms]" />
          </span>
          <span>{isEn ? 'Playing...' : 'सुना रहे हैं...'}</span>
        </>
      ) : isCurrentlyPaused ? (
        <>
          <Play className="w-3.5 h-3.5 text-amber-800" />
          <span>{isEn ? 'Resume' : 'जारी रखें'}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 text-clay-600" />
          <span>{isEn ? 'Listen 🔊' : 'सुनें 🔊'}</span>
        </>
      )}
    </button>
  );
}
