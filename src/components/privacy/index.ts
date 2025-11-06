// Privacy-focused components for GDPR and CCPA compliance
export { default as DataDeletionRequest } from './DataDeletionRequest';
export { default as PrivacySettings } from './PrivacySettings';
export { default as ConsentManager } from './ConsentManager';
export { default as DataExport } from './DataExport';
export { default as AnalyticsOptOut } from './AnalyticsOptOut';
export { default as CCPANotice } from './CCPANotice';

// Re-export types for convenience
export type {
  DataDeletionRequest as DataDeletionRequestType,
  PrivacySettings as PrivacySettingsType,
  ConsentRecord,
  DataExportRequest,
  AnalyticsOptOutSettings,
  CCPANoticeData,
  FormValidationError,
  ApiResponse,
} from '@/types/cookie-consent';