import React, { useState } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage, translations } from '../context/LanguageContext';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
];

export default function LanguageSetter({ variant = 'dropdown' }) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  const current = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  // Compact dropdown for navbar
  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-sky-100 hover:bg-sky-50 transition-all text-sm font-medium text-ink-700 shadow-sm"
          aria-label="Change language"
        >
          <Globe size={16} className="text-sky-600" />
          <span className="hidden sm:inline">{current.native}</span>
          <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-pop border border-sky-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-2 border-b border-sky-50 bg-sky-50/50">
                <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">
                  Select Language
                </p>
              </div>
              <div className="max-h-72 overflow-y-auto py-1">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-sky-50 transition-colors text-left ${
                      language === lang.code ? 'bg-sky-50' : ''
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-800">{lang.native}</p>
                      <p className="text-xs text-ink-400">{lang.name}</p>
                    </div>
                    {language === lang.code && (
                      <Check size={16} className="text-sky-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Card grid for settings page
  return (
    <div className="bg-white rounded-2xl p-6 shadow-card">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
          <Globe className="w-5 h-5 text-sky-600" />
        </div>
        <div>
          <h3 className="font-display font-bold text-ink-900">Language</h3>
          <p className="text-xs text-ink-400">Choose your preferred language</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`relative p-4 rounded-xl border-2 transition-all text-left ${
              language === lang.code
                ? 'border-sky-400 bg-sky-50 shadow-md'
                : 'border-ink-100 bg-white hover:border-sky-200 hover:bg-sky-50/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{lang.flag}</span>
              {language === lang.code && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </span>
              )}
            </div>
            <p className="font-semibold text-ink-800">{lang.native}</p>
            <p className="text-xs text-ink-400">{lang.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}