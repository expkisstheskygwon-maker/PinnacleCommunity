import { useState, useEffect } from 'react';

export function useLanguage() {
  const [lang, setLang] = useState<'ko' | 'en'>('ko');

  useEffect(() => {
    // Client-side initialization to avoid SSR hydration mismatches
    const stored = localStorage.getItem('lang') as 'ko' | 'en';
    if (stored) {
      setLang(stored);
    }

    const handleLangChange = () => {
      const updated = localStorage.getItem('lang') as 'ko' | 'en';
      if (updated) {
        setLang(updated);
      }
    };

    window.addEventListener('languageChange', handleLangChange);
    return () => {
      window.removeEventListener('languageChange', handleLangChange);
    };
  }, []);

  const changeLanguage = (newLang: 'ko' | 'en') => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
    window.dispatchEvent(new Event('languageChange'));
  };

  return { lang, changeLanguage };
}
