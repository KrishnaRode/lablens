"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface ListenButtonProps {
  /** The full text to read aloud. */
  text: string;
  /** BCP-47 locale, e.g. "hi-IN", used to pick a matching voice. */
  locale: string;
}

/**
 * Reads the explanation aloud using the browser's built-in Web Speech API —
 * fully local, no network, no dependencies. Picks a voice matching the chosen
 * language when the OS provides one. Long text is split into short sentence
 * chunks so it plays reliably (works around the Chrome ~15s cut-off bug).
 */
export default function ListenButton({ text, locale }: ListenButtonProps) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setSupported(true);

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const lang = locale.toLowerCase();
      const base = lang.split("-")[0];
      voiceRef.current =
        voices.find((v) => v.lang.toLowerCase() === lang) ??
        voices.find((v) => v.lang.toLowerCase().startsWith(base)) ??
        null;
    };

    pickVoice();
    window.speechSynthesis.addEventListener("voiceschanged", pickVoice);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", pickVoice);
      window.speechSynthesis.cancel();
    };
  }, [locale]);

  // Stop any in-flight speech if the text or language changes.
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [text, locale]);

  const speak = useCallback(() => {
    const synth = window.speechSynthesis;
    synth.cancel();

    // Split into short chunks on line breaks and sentence terminators,
    // including Devanagari (।) and Urdu (۔) full stops.
    const chunks = text
      .split(/\n+/)
      .flatMap((line) => line.match(/[^.?!।۔]+[.?!।۔]?/g) ?? [line])
      .map((s) => s.trim())
      .filter(Boolean);

    if (chunks.length === 0) return;
    setSpeaking(true);

    chunks.forEach((chunk, i) => {
      const u = new SpeechSynthesisUtterance(chunk);
      u.lang = locale;
      if (voiceRef.current) u.voice = voiceRef.current;
      u.rate = 0.95;
      if (i === chunks.length - 1) {
        u.onend = () => setSpeaking(false);
        u.onerror = () => setSpeaking(false);
      }
      synth.speak(u);
    });
  }, [text, locale]);

  const toggle = useCallback(() => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    } else {
      speak();
    }
  }, [speaking, speak]);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={speaking}
      className="inline-flex items-center gap-2 rounded-xl border border-border bg-panel px-3.5 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-panel-hover hover:text-text"
    >
      {speaking ? <StopIcon /> : <SpeakerIcon />}
      {speaking ? "Stop" : "Listen"}
    </button>
  );
}

function SpeakerIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}
