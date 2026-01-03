'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// ============================================================================
// THEME CONTEXT
// ============================================================================

interface ThemeContextType {
  theme: string;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<string>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme') || 'light';
    setTheme(stored);
    applyTheme(stored);
  }, []);

  const applyTheme = (newTheme: string) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
    root.setAttribute('data-theme', newTheme);
    
    // Force repaint
    void root.offsetHeight;
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

// ============================================================================
// LANGUAGE CONTEXT
// ============================================================================

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

// Traductions FR
const fr = {
  "dashboard": "Tableau de bord",
  "members": "Membres",
  "subscriptions": "Abonnements",
  "invoices": "Factures",
  "plans": "Packs",
  "settings": "Paramètres",
  "logout": "Déconnexion",
  "mainMenu": "Menu Principal",
  "others": "Autres",
  "welcome": "Bienvenue",
  "platformOverview": "Vue d'ensemble de la plateforme",
  "totalMembers": "Total Membres",
  "activeSubscriptions": "Abonnements Actifs",
  "totalRevenue": "Revenue Total",
  "pendingPayments": "Paiements en Attente",
  "manageMembers": "Gérer les Membres",
  "fullCRUD": "CRUD complet",
  "completeManagement": "Gestion complète",
  "paymentsReminders": "Paiements & Rappels",
  "packs": "Packs",
  "manageOffers": "Gérer les offres",
  "recentMembers": "Membres Récents",
  "recentActivity": "Activité Récente",
  "seeAll": "Voir tout",
  "loading": "Chargement...",
  "noMembers": "Aucun membre récent",
  "noActivity": "Aucune activité récente",
  "paid": "Payée",
  "pending": "En attente",
  "common": {
    "loading": "Chargement des données...",
    "error": "Erreur"
  },
  "admin": {
    "reports": {
      "title": "Rapports Mensuels",
      "subtitle": "Générez et consultez les rapports d'activité",
      "selectMonth": "Sélectionner le mois",
      "period": "Période",
      "to": "au",
      "downloadPDF": "Télécharger PDF",
      "generating": "Génération du rapport...",
      "pleaseWait": "Veuillez patienter",
      "generated": "Rapport généré !",
      "downloadStarted": "Le téléchargement a commencé",
      "generateError": "Impossible de générer le rapport",
      "totalMembers": "Membres Total",
      "thisMonth": "ce mois",
      "activeSubscriptions": "Abonnements Actifs",
      "new": "nouveaux",
      "monthlyRevenue": "Revenue du Mois",
      "paymentRate": "Taux de Paiement",
      "invoices": "factures",
      "financialDetails": "Détails Financiers",
      "paidRevenue": "Revenue payé",
      "pendingRevenue": "Revenue en attente",
      "issuedInvoices": "Factures émises",
      "paidInvoices": "Factures payées",
      "topActions": "Top Actions du Mois",
      "totalActions": "Total d'actions",
      "completePDF": "Rapport PDF Complet",
      "pdfDescription": "Le rapport PDF inclut des informations détaillées : top organisations, dernières factures, distribution des packs, et bien plus encore.",
      "tip": "Astuce : Vous pouvez programmer l'envoi automatique mensuel de ce rapport par email.",
      "noData": "Aucune donnée",
      "selectMonthPrompt": "Sélectionnez un mois pour voir le rapport"
    }
  }
};

// Traductions EN
const en = {
  "dashboard": "Dashboard",
  "members": "Members",
  "subscriptions": "Subscriptions",
  "invoices": "Invoices",
  "plans": "Plans",
  "settings": "Settings",
  "logout": "Logout",
  "mainMenu": "Main Menu",
  "others": "Others",
  "welcome": "Welcome",
  "platformOverview": "Platform overview",
  "totalMembers": "Total Members",
  "activeSubscriptions": "Active Subscriptions",
  "totalRevenue": "Total Revenue",
  "pendingPayments": "Pending Payments",
  "manageMembers": "Manage Members",
  "fullCRUD": "Full CRUD",
  "completeManagement": "Complete management",
  "paymentsReminders": "Payments & Reminders",
  "packs": "Plans",
  "manageOffers": "Manage offers",
  "recentMembers": "Recent Members",
  "recentActivity": "Recent Activity",
  "seeAll": "See all",
  "loading": "Loading...",
  "noMembers": "No recent members",
  "noActivity": "No recent activity",
  "paid": "Paid",
  "pending": "Pending",
  "common": {
    "loading": "Loading data...",
    "error": "Error"
  },
  "admin": {
    "reports": {
      "title": "Monthly Reports",
      "subtitle": "Generate and view activity reports",
      "selectMonth": "Select month",
      "period": "Period",
      "to": "to",
      "downloadPDF": "Download PDF",
      "generating": "Generating report...",
      "pleaseWait": "Please wait",
      "generated": "Report generated!",
      "downloadStarted": "Download started",
      "generateError": "Unable to generate report",
      "totalMembers": "Total Members",
      "thisMonth": "this month",
      "activeSubscriptions": "Active Subscriptions",
      "new": "new",
      "monthlyRevenue": "Monthly Revenue",
      "paymentRate": "Payment Rate",
      "invoices": "invoices",
      "financialDetails": "Financial Details",
      "paidRevenue": "Paid revenue",
      "pendingRevenue": "Pending revenue",
      "issuedInvoices": "Issued invoices",
      "paidInvoices": "Paid invoices",
      "topActions": "Top Actions of the Month",
      "totalActions": "Total actions",
      "completePDF": "Complete PDF Report",
      "pdfDescription": "The PDF report includes detailed information: top organizations, latest invoices, plan distribution, and much more.",
      "tip": "Tip: You can schedule automatic monthly email delivery of this report.",
      "noData": "No data",
      "selectMonthPrompt": "Select a month to view the report"
    }
  }
};

const translations: Record<string, any> = { fr, en };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<string>('fr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('language') || 'fr';
    setLanguageState(stored);
  }, []);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to French if translation not found
        let fallback: any = translations.fr;
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object' && fk in fallback) {
            fallback = fallback[fk];
          } else {
            return key; // Return key if no translation found
          }
        }
        return fallback;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  if (!mounted) return <>{children}</>;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};