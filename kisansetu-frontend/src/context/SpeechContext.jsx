import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const SpeechContext = createContext(null);

/**
 * Text pre-processing utility to pronounce agricultural & financial terms naturally in Hindi or English.
 */
function cleanTextForSpeech(rawText, isHindi) {
  if (!rawText) return '';

  let text = String(rawText);

  // Strip markdown headings, bold, italics, bullets, code blocks
  text = text.replace(/```[\s\S]*?```/g, ' ');
  text = text.replace(/`([^`]+)`/g, '$1');
  text = text.replace(/[*_~#]/g, ' ');
  text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1'); // replace links with anchor text
  text = text.replace(/https?:\/\/\S+/g, ' '); // remove raw urls

  // Natural Currency formatting
  if (isHindi) {
    text = text.replace(/₹\s*([\d,]+(?:\.\d+)?)/g, '$1 रुपये');
    text = text.replace(/Rs\.?\s*([\d,]+(?:\.\d+)?)/gi, '$1 रुपये');
    text = text.replace(/INR\s*([\d,]+(?:\.\d+)?)/gi, '$1 रुपये');
    text = text.replace(/(\d+)\s*%/g, '$1 प्रतिशत');
    text = text.replace(/KCC/gi, 'के.सी.सी.');
    text = text.replace(/MSP/gi, 'एम.एस.पी.');
    text = text.replace(/PMFBY/gi, 'पी.एम.एफ.बी.वाई.');
    text = text.replace(/Aadhaar/gi, 'आधार');
  } else {
    text = text.replace(/₹\s*([\d,]+(?:\.\d+)?)/g, '$1 rupees');
    text = text.replace(/Rs\.?\s*([\d,]+(?:\.\d+)?)/gi, '$1 rupees');
    text = text.replace(/INR\s*([\d,]+(?:\.\d+)?)/gi, '$1 rupees');
    text = text.replace(/(\d+)\s*%/g, '$1 percent');
    text = text.replace(/KCC/gi, 'K.C.C.');
    text = text.replace(/MSP/gi, 'M.S.P.');
    text = text.replace(/PMFBY/gi, 'P.M.F.B.Y.');
  }

  // Remove excessive punctuation, decorative bars, and symbols
  text = text.replace(/[•|►▶■◆✓✔✗✘\t]/g, ' ');
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Splits long narrative into natural sentence chunks to prevent browser speech synthesis timeouts.
 */
function chunkText(text) {
  if (!text) return [];

  // Match sentences ending in period, full stop (। in Hindi), question mark, or exclamation
  const rawSentences = text.match(/[^.!?।\n]+[.!?।\n]+|[^.!?।\n]+$/g) || [text];
  const chunks = [];

  let currentChunk = '';
  for (const s of rawSentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;

    if ((currentChunk + ' ' + trimmed).length <= 180) {
      currentChunk = currentChunk ? currentChunk + ' ' + trimmed : trimmed;
    } else {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = trimmed;
    }
  }

  if (currentChunk) chunks.push(currentChunk);
  return chunks;
}

export function SpeechProvider({ children }) {
  const { i18n } = useTranslation();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [activeSectionTitle, setActiveSectionTitle] = useState('');
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);

  const chunksRef = useRef([]);
  const activeIndexRef = useRef(0);
  const speedRef = useRef(playbackSpeed);
  const langRef = useRef(i18n.language);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    speedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    langRef.current = i18n.language;
  }, [i18n.language]);

  // Clean stop on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getBestVoice = useCallback((targetLang) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const isHindi = targetLang.startsWith('hi');

    if (isHindi) {
      // Look for Hindi voice
      const hindiVoice = voices.find(
        (v) => v.lang === 'hi-IN' || v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi')
      );
      if (hindiVoice) return hindiVoice;
    } else {
      // Look for Indian English first, then any English voice
      const indianEnglish = voices.find(
        (v) => v.lang === 'en-IN' || v.name.toLowerCase().includes('india')
      );
      if (indianEnglish) return indianEnglish;

      const genericEnglish = voices.find((v) => v.lang.startsWith('en'));
      if (genericEnglish) return genericEnglish;
    }

    return voices[0] || null;
  }, []);

  const playNextChunk = useCallback(() => {
    if (!isPlayingRef.current) return;

    if (activeIndexRef.current >= chunksRef.current.length) {
      // Completed all chunks
      setIsPlaying(false);
      setIsPaused(false);
      setActiveSectionId(null);
      isPlayingRef.current = false;
      return;
    }

    const chunk = chunksRef.current[activeIndexRef.current];
    setCurrentChunkIndex(activeIndexRef.current + 1);

    const utterance = new SpeechSynthesisUtterance(chunk);
    const targetLang = langRef.current === 'en' ? 'en-IN' : 'hi-IN';
    utterance.lang = targetLang;
    utterance.rate = speedRef.current;
    utterance.pitch = 1.0;

    const voice = getBestVoice(targetLang);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => {
      if (isPlayingRef.current) {
        activeIndexRef.current += 1;
        playNextChunk();
      }
    };

    utterance.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') {
        return;
      }
      console.warn('Speech synthesis utterance note:', e.error);
      if (isPlayingRef.current) {
        activeIndexRef.current += 1;
        playNextChunk();
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [getBestVoice]);

  const speak = useCallback(
    (rawText, options = {}) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        console.warn('Web Speech API is not supported in this browser.');
        return;
      }

      // Stop previous narration
      window.speechSynthesis.cancel();

      const sectionId = options.sectionId || 'default-section';
      const sectionTitle = options.sectionTitle || 'Content Narration';
      const lang = options.language || (i18n.language === 'en' ? 'en' : 'hi');
      const isHindi = lang.startsWith('hi');

      const cleaned = cleanTextForSpeech(rawText, isHindi);
      const chunks = chunkText(cleaned);

      if (chunks.length === 0) {
        return;
      }

      chunksRef.current = chunks;
      activeIndexRef.current = 0;
      setTotalChunks(chunks.length);
      setCurrentChunkIndex(1);
      setActiveSectionId(sectionId);
      setActiveSectionTitle(sectionTitle);
      setIsPlaying(true);
      setIsPaused(false);
      isPlayingRef.current = true;

      // Ensure voices are loaded before speak
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          playNextChunk();
        };
      } else {
        playNextChunk();
      }
    },
    [i18n.language, playNextChunk]
  );

  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isPlaying]);

  const resume = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    isPlayingRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);
    setActiveSectionId(null);
    setActiveSectionTitle('');
    chunksRef.current = [];
    activeIndexRef.current = 0;
  }, []);

  const cycleSpeed = useCallback(() => {
    const speeds = [0.8, 1.0, 1.25, 1.5];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
  }, [playbackSpeed]);

  const value = {
    speak,
    pause,
    resume,
    stop,
    isPlaying,
    isPaused,
    activeSectionId,
    activeSectionTitle,
    playbackSpeed,
    setPlaybackSpeed,
    cycleSpeed,
    progress: totalChunks > 0 ? Math.round((currentChunkIndex / totalChunks) * 100) : 0,
    currentChunkIndex,
    totalChunks,
  };

  return <SpeechContext.Provider value={value}>{children}</SpeechContext.Provider>;
}

export function useTextToSpeech() {
  const context = useContext(SpeechContext);
  if (!context) {
    throw new Error('useTextToSpeech must be used within a SpeechProvider');
  }
  return context;
}
