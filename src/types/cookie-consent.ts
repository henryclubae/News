/**
 * GDPR Cookie Consent Types
 * Defines interfaces for cookie consent management
 */

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export interface ConsentData {
  preferences: CookiePreferences;
  timestamp: string;
  version: string;
  consentId: string;
  userAgent: string;
  ipHash?: string;
}

export interface CookieInfo {
  name: string;
  purpose: string;
  duration: string;
  category: keyof CookiePreferences;
  provider: string;
  isEssential?: boolean;
}

export interface CookieCategory {
  id: keyof CookiePreferences;
  title: string;
  description: string;
  cookies: CookieInfo[];
  required?: boolean;
}

export type ConsentStatus = 'pending' | 'accepted' | 'rejected' | 'partial';

export interface ConsentBannerProps {
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onCustomize: () => void;
  onClose: () => void;
}

export interface PreferenceCenterProps {
  preferences: CookiePreferences;
  onSave: (preferences: CookiePreferences) => void;
  onClose: () => void;
  categories: CookieCategory[];
}

export interface CookiePolicyData {
  lastUpdated: string;
  contactEmail: string;
  companyName: string;
  privacyPolicyUrl: string;
  categories: CookieCategory[];
}

// Privacy-focused component types
export interface DataDeletionRequest {
  id: string;
  email: string;
  fullName: string;
  requestType: 'full_deletion' | 'specific_data' | 'anonymize';
  dataTypes: string[];
  reason?: string;
  verificationToken?: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  submittedAt: string;
  processedAt?: string;
  notes?: string;
}

export interface PrivacySettings {
  dataCollection: {
    analytics: boolean;
    personalization: boolean;
    marketing: boolean;
    research: boolean;
    location: boolean;
    device_info: boolean;
    behavioral: boolean;
  };
  communications: {
    newsletter: boolean;
    notifications: boolean;
    marketingEmails: boolean;
    productUpdates: boolean;
    breaking_news: boolean;
    personalized: boolean;
    promotional: boolean;
  };
  dataRetention: {
    activityLogs: '30_days' | '90_days' | '1_year' | 'indefinite';
    userContent: 'never_delete' | '1_year' | '2_years' | '5_years';
    analyticsData: '6_months' | '1_year' | '2_years';
  };
  visibility: {
    profileVisibility: 'public' | 'private' | 'limited';
    activityVisibility: 'public' | 'followers' | 'private';
    searchIndexing: boolean;
  };
  profileVisibility: 'public' | 'private' | 'limited';
  thirdPartySharing: boolean;
  updatedAt?: string;
}

export interface ConsentRecord {
  id: string;
  userId?: string;
  consentType: 'necessary' | 'functional' | 'analytics' | 'marketing' | 'personalization' | 'data_processing';
  granted: boolean;
  status: 'granted' | 'denied' | 'withdrawn' | 'pending';
  timestamp: string;
  ipAddress?: string;
  userAgent: string;
  version: string;
  withdrawnAt?: string;
  expiresAt?: string;
  purpose?: string;
  source: 'banner' | 'settings' | 'registration' | 'api';
  metadata?: Record<string, unknown>;
}

export interface DataExportRequest {
  id: string;
  email: string;
  requestType: 'full_export' | 'partial_export';
  dataTypes: string[];
  format: 'json' | 'csv' | 'pdf';
  status: 'pending' | 'processing' | 'ready' | 'expired' | 'failed';
  submittedAt: string;
  completedAt?: string;
  downloadUrl?: string;
  expiresAt?: string;
  fileSize?: number;
}

export interface AnalyticsOptOutSettings {
  googleAnalytics: boolean;
  facebookPixel: boolean;
  customAnalytics: boolean;
  performanceMonitoring: boolean;
  errorTracking: boolean;
  heatmapping: boolean;
  sessionRecording: boolean;
}

export interface CCPANoticeData {
  isCaliforniaResident: boolean;
  personalInfoSold: boolean;
  personalInfoShared: boolean;
  optOutRequests: number;
  lastOptOutDate?: string;
  categories: {
    identifiers: boolean;
    personalRecords: boolean;
    commercialInfo: boolean;
    biometricInfo: boolean;
    internetActivity: boolean;
    geolocationData: boolean;
    sensoryInfo: boolean;
    professionalInfo: boolean;
    educationInfo: boolean;
    profileInferences: boolean;
  };
}

export interface FormValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: FormValidationError[];
  message?: string;
}