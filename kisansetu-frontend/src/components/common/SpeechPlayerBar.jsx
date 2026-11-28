import React from 'react';
import { Volume2, Pause, Play, Square, X, Gauge } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useTextToSpeech from '../../hooks/useTextToSpeech';

/**
 * Global persistent floating audio player bar that appears whenever narration is active.
 * Provides pause, resume, stop, playback speed cycle, and chunk progress indicator.
 */
export default function SpeechPlayerBar() {
  const { t, i18n } = useTranslation();
  const {
    isPlaying,
    isPaused,
    activeSectionTitle,
    pause,
    resume,
    stop,
    playbackSpeed,
    cycleSpeed,
    currentChunkIndex,
    totalChunks,
    progress,
  } = useTextToSpeech();

  if (!isPlaying && !isPaused) return null;

  const isEn = i18n.language === 'en';

  return (
    <div
      role="region"
      aria-label="Audio Narration Player"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-xl bg-paper-50 border-2 border-indigo-900 rounded-sm shadow-hard p-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-3 animate-fade-in"
    >
      {/* Sound wave / speaker indicator & Section Title */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-xs bg-saffron-500 border border-indigo-900 flex items-center justify-center text-indigo-950 shrink-0">
          <Volume2 className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-bold text-clay-600 tracking-wider">
              {isEn ? 'Reading' : 'ध्वनि वाचन'}
            </span>
            {totalChunks > 1 && (
              <span className="text-[10px] font-mono text-ink-muted">
                ({currentChunkIndex}/{totalChunks})
              </span>
            )}
          </div>
          <h4 className="text-xs font-serif font-bold text-indigo-950 truncate leading-tight">
            {activeSectionTitle || (isEn ? 'Website Content' : 'वेबसाइट सामग्री')}
          </h4>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Speed toggle */}
        <button
          type="button"
          onClick={cycleSpeed}
          title={isEn ? 'Playback speed' : 'वाचन गति'}
          className="px-2 py-1 text-[11px] font-mono font-bold text-indigo-900 bg-paper-100 hover:bg-paper-200 border border-paper-300 rounded-xs transition-colors"
        >
          {playbackSpeed}x
        </button>

        {/* Play/Pause Button */}
        {isPlaying && !isPaused ? (
          <button
            type="button"
            onClick={pause}
            aria-label={isEn ? 'Pause' : 'रोकें'}
            title={isEn ? 'Pause' : 'रोकें'}
            className="p-1.5 bg-paper-100 hover:bg-paper-200 text-indigo-950 border border-indigo-900 rounded-xs transition-colors"
          >
            <Pause className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={resume}
            aria-label={isEn ? 'Resume' : 'जारी रखें'}
            title={isEn ? 'Resume' : 'जारी रखें'}
            className="p-1.5 bg-saffron-500 hover:bg-saffron-400 text-indigo-950 border border-indigo-900 rounded-xs transition-colors"
          >
            <Play className="w-4 h-4" />
          </button>
        )}

        {/* Stop button */}
        <button
          type="button"
          onClick={stop}
          aria-label={isEn ? 'Stop narration' : 'वाचन समाप्त करें'}
          title={isEn ? 'Stop' : 'समाप्त'}
          className="p-1.5 bg-paper-100 hover:bg-paper-200 text-rust-600 border border-paper-300 hover:border-rust-600 rounded-xs transition-colors"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
        </button>

        {/* Dismiss / Close */}
        <button
          type="button"
          onClick={stop}
          aria-label={isEn ? 'Close player' : 'बंद करें'}
          className="p-1 text-ink-muted hover:text-indigo-950 transition-colors ml-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
