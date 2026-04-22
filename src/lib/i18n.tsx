'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import en from './dictionaries/en.json'
import es from './dictionaries/es.json'

type Dictionary = typeof en
type Locale = 'en' | 'es'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Dictionary
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es') // Default Spanish for LATAM/Spain focus

  useEffect(() => {
    // Detect browser language on mount if no preference is saved
    const saved = localStorage.getItem('NEXT_LOCALE') as Locale
    if (saved && (saved === 'en' || saved === 'es')) {
      setLocaleState(saved)
    } else {
      const browserLang = navigator.language.split('-')[0]
      if (browserLang === 'es') setLocaleState('es')
      else setLocaleState('en')
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('NEXT_LOCALE', newLocale)
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`
  }

  const t = locale === 'es' ? es : en

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider')
  }
  return context
}
