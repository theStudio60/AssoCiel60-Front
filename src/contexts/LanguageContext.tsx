'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface LanguageContextType {
  lang: string;
  switchLang: (newLang: string) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    // Sidebar
    dashboard: 'Tableau de bord',
    members: 'Membres',
    subscriptions: 'Abonnements',
    invoices: 'Factures',
    plans: 'Packs',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    mainMenu: 'Menu Principal',
    others: 'Autres',
    
    // Login
    login: 'Connexion',
    accessYourAccount: 'Accédez à votre espace membre',
    email: 'Email',
    password: 'Mot de passe',
    forgotPassword: 'Oublié ?',
    signIn: 'Se connecter',
    signingIn: 'Connexion en cours...',
    notMemberYet: 'Pas encore membre ?',
    joinNow: 'Adhérer maintenant',
    join: 'Adhérer',
    
    // 2FA
    twoFactorVerification: 'Vérification 2FA',
    enterCodeReceived: 'Entrez le code reçu par email',
    verify: 'Vérifier',
    verifying: 'Vérification...',
    backToLogin: '← Retour à la connexion',
    
    // Dashboard
    welcome: 'Bienvenue',
    platformOverview: 'Voici un aperçu de votre plateforme',
    totalMembers: 'Total Membres',
    activeSubscriptions: 'Abonnements Actifs',
    totalRevenue: 'Revenu Total',
    pendingPayments: 'Paiements en Attente',
    recentMembers: 'Membres Récents',
    recentActivity: 'Activité Récente',
    noMembers: 'Aucun membre pour le moment',
    noActivity: 'Aucune activité récente',
    seeAll: 'Voir tout',
    manageMembers: 'Gérer les Membres',
    fullCRUD: 'CRUD complet',
    completeManagement: 'Gestion complète',
    paymentsReminders: 'Paiements & rappels',
    packs: 'Packs',
    manageOffers: 'Gestion des offres',
    loading: 'Chargement...',
    paid: 'Payé',
    pending: 'En attente',
    
    // Members Page
    membersManagement: 'Gestion des Membres',
    manageViewMembers: 'Gérez et visualisez tous vos membres',
    totalMembersLabel: 'Total Membres',
    activeMembersLabel: 'Membres Actifs',
    pendingLabel: 'En Attente',
    newThisMonth: 'Nouveaux ce mois',
    exportExcel: 'Exporter Excel',
    search: 'Rechercher...',
    mostRecent: 'Plus récents',
    active: 'Actifs',
    expired: 'Expirés',
    date: 'Date',
    member: 'Membre',
    pack: 'Pack',
    status: 'Statut',
    action: 'Action',
    noMembersFound: 'Aucun membre trouvé',
    viewDetails: 'Voir détails',
    delete: 'Supprimer',
    deleteQuestion: 'Supprimer ?',
    deleteConfirm: 'Supprimer',
    cancel: 'Annuler',
    deleted: 'Supprimé !',
    error: 'Erreur',
    exportSuccess: 'Export réussi !',
    showing: 'Affichage de',
    to: 'à',
    on: 'sur',
    membersLower: 'membres',
    previous: 'Précédent',
    next: 'Suivant',
    activeStatus: 'Actif',
    pendingStatus: 'En attente',
    expiredStatus: 'Expiré',
    canceledStatus: 'Annulé',
    none: 'Aucun',
  },
  en: {
    // Sidebar
    dashboard: 'Dashboard',
    members: 'Members',
    subscriptions: 'Subscriptions',
    invoices: 'Invoices',
    plans: 'Plans',
    settings: 'Settings',
    logout: 'Logout',
    mainMenu: 'Main Menu',
    others: 'Others',
    
    // Login
    login: 'Login',
    accessYourAccount: 'Access your member area',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot?',
    signIn: 'Sign In',
    signingIn: 'Signing in...',
    notMemberYet: 'Not a member yet?',
    joinNow: 'Join now',
    join: 'Join',
    
    // 2FA
    twoFactorVerification: '2FA Verification',
    enterCodeReceived: 'Enter the code received by email',
    verify: 'Verify',
    verifying: 'Verifying...',
    backToLogin: '← Back to login',
    
    // Dashboard
    welcome: 'Welcome',
    platformOverview: 'Here is an overview of your platform',
    totalMembers: 'Total Members',
    activeSubscriptions: 'Active Subscriptions',
    totalRevenue: 'Total Revenue',
    pendingPayments: 'Pending Payments',
    recentMembers: 'Recent Members',
    recentActivity: 'Recent Activity',
    noMembers: 'No members yet',
    noActivity: 'No recent activity',
    seeAll: 'See all',
    manageMembers: 'Manage Members',
    fullCRUD: 'Full CRUD',
    completeManagement: 'Complete management',
    paymentsReminders: 'Payments & reminders',
    packs: 'Packs',
    manageOffers: 'Manage offers',
    loading: 'Loading...',
    paid: 'Paid',
    pending: 'Pending',
    
    // Members Page
    membersManagement: 'Members Management',
    manageViewMembers: 'Manage and view all your members',
    totalMembersLabel: 'Total Members',
    activeMembersLabel: 'Active Members',
    pendingLabel: 'Pending',
    newThisMonth: 'New this month',
    exportExcel: 'Export Excel',
    search: 'Search...',
    mostRecent: 'Most recent',
    active: 'Active',
    expired: 'Expired',
    date: 'Date',
    member: 'Member',
    pack: 'Pack',
    status: 'Status',
    action: 'Action',
    noMembersFound: 'No members found',
    viewDetails: 'View details',
    delete: 'Delete',
    deleteQuestion: 'Delete?',
    deleteConfirm: 'Delete',
    cancel: 'Cancel',
    deleted: 'Deleted!',
    error: 'Error',
    exportSuccess: 'Export successful!',
    showing: 'Showing',
    to: 'to',
    on: 'of',
    membersLower: 'members',
    previous: 'Previous',
    next: 'Next',
    activeStatus: 'Active',
    pendingStatus: 'Pending',
    expiredStatus: 'Expired',
    canceledStatus: 'Canceled',
    none: 'None',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState('fr');

  const switchLang = (newLang: string) => {
    setLang(newLang);
  };

  const t = (key: string): string => {
    return translations[lang as keyof typeof translations][key as keyof typeof translations.fr] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, switchLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};