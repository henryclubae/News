/**
 * Privacy API Utilities
 * Handles API calls for privacy-related operations
 */

import { 
  DataDeletionRequest, 
  PrivacySettings, 
  ConsentRecord, 
  DataExportRequest, 
  AnalyticsOptOutSettings,
  CCPANoticeData,
  ApiResponse 
} from '@/types/cookie-consent';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * Generic API client with error handling
 */
async function apiClient<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        errors: data.errors,
      };
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

/**
 * Data Deletion Request API
 */
export const dataDeletionAPI = {
  /**
   * Submit a data deletion request
   */
  async submitRequest(request: Omit<DataDeletionRequest, 'id' | 'status' | 'submittedAt'>): Promise<ApiResponse<DataDeletionRequest>> {
    return apiClient<DataDeletionRequest>('/privacy/data-deletion', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Get deletion request status
   */
  async getRequestStatus(requestId: string, email: string): Promise<ApiResponse<DataDeletionRequest>> {
    return apiClient<DataDeletionRequest>(`/privacy/data-deletion/${requestId}?email=${encodeURIComponent(email)}`);
  },

  /**
   * Verify email for deletion request
   */
  async verifyEmail(requestId: string, token: string): Promise<ApiResponse<{ verified: boolean }>> {
    return apiClient<{ verified: boolean }>('/privacy/data-deletion/verify', {
      method: 'POST',
      body: JSON.stringify({ requestId, token }),
    });
  },
};

/**
 * Privacy Settings API
 */
export const privacySettingsAPI = {
  /**
   * Get user privacy settings
   */
  async getSettings(userId?: string): Promise<ApiResponse<PrivacySettings>> {
    const params = userId ? `?userId=${userId}` : '';
    return apiClient<PrivacySettings>(`/privacy/settings${params}`);
  },

  /**
   * Update privacy settings
   */
  async updateSettings(settings: PrivacySettings, userId?: string): Promise<ApiResponse<PrivacySettings>> {
    return apiClient<PrivacySettings>('/privacy/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings, userId }),
    });
  },

  /**
   * Reset to default settings
   */
  async resetToDefaults(userId?: string): Promise<ApiResponse<PrivacySettings>> {
    return apiClient<PrivacySettings>('/privacy/settings/reset', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },
};

/**
 * Consent Manager API
 */
export const consentManagerAPI = {
  /**
   * Record consent
   */
  async recordConsent(consent: Omit<ConsentRecord, 'id' | 'timestamp'>): Promise<ApiResponse<ConsentRecord>> {
    return apiClient<ConsentRecord>('/privacy/consent', {
      method: 'POST',
      body: JSON.stringify(consent),
    });
  },

  /**
   * Get consent history
   */
  async getConsentHistory(userId?: string): Promise<ApiResponse<ConsentRecord[]>> {
    const params = userId ? `?userId=${userId}` : '';
    return apiClient<ConsentRecord[]>(`/privacy/consent/history${params}`);
  },

  /**
   * Withdraw consent
   */
  async withdrawConsent(consentId: string, userId?: string): Promise<ApiResponse<ConsentRecord>> {
    return apiClient<ConsentRecord>(`/privacy/consent/${consentId}/withdraw`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  /**
   * Renew consent
   */
  async renewConsent(userId: string, consentType: string): Promise<ApiResponse<ConsentRecord>> {
    return apiClient<ConsentRecord>('/privacy/consent/renew', {
      method: 'POST',
      body: JSON.stringify({ userId, consentType }),
    });
  },
};

/**
 * Data Export API
 */
export const dataExportAPI = {
  /**
   * Request data export
   */
  async requestExport(request: Omit<DataExportRequest, 'id' | 'status' | 'submittedAt'>): Promise<ApiResponse<DataExportRequest>> {
    return apiClient<DataExportRequest>('/privacy/data-export', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Get export status
   */
  async getExportStatus(requestId: string, email: string): Promise<ApiResponse<DataExportRequest>> {
    return apiClient<DataExportRequest>(`/privacy/data-export/${requestId}?email=${encodeURIComponent(email)}`);
  },

  /**
   * Download export file
   */
  async downloadExport(requestId: string, token: string): Promise<ApiResponse<Blob>> {
    try {
      const response = await fetch(`${API_BASE_URL}/privacy/data-export/${requestId}/download?token=${token}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Download failed',
        };
      }

      const blob = await response.blob();
      return {
        success: true,
        data: blob,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Download failed',
      };
    }
  },
};

/**
 * Analytics Opt-Out API
 */
export const analyticsOptOutAPI = {
  /**
   * Get opt-out settings
   */
  async getOptOutSettings(): Promise<ApiResponse<AnalyticsOptOutSettings>> {
    return apiClient<AnalyticsOptOutSettings>('/privacy/analytics-opt-out');
  },

  /**
   * Update opt-out settings
   */
  async updateOptOutSettings(settings: AnalyticsOptOutSettings): Promise<ApiResponse<AnalyticsOptOutSettings>> {
    return apiClient<AnalyticsOptOutSettings>('/privacy/analytics-opt-out', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  /**
   * Opt out of all analytics
   */
  async optOutAll(): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient<{ success: boolean }>('/privacy/analytics-opt-out/all', {
      method: 'POST',
    });
  },
};

/**
 * CCPA Compliance API
 */
export const ccpaAPI = {
  /**
   * Get CCPA notice data
   */
  async getNoticeData(userId?: string): Promise<ApiResponse<CCPANoticeData>> {
    const params = userId ? `?userId=${userId}` : '';
    return apiClient<CCPANoticeData>(`/privacy/ccpa${params}`);
  },

  /**
   * Submit do not sell request
   */
  async submitDoNotSellRequest(email: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient<{ success: boolean }>('/privacy/ccpa/do-not-sell', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Get opt-out status
   */
  async getOptOutStatus(email: string): Promise<ApiResponse<{ optedOut: boolean; date?: string }>> {
    return apiClient<{ optedOut: boolean; date?: string }>(`/privacy/ccpa/opt-out-status?email=${encodeURIComponent(email)}`);
  },
};

/**
 * Utility functions
 */
export const privacyUtils = {
  /**
   * Detect if user is likely from California (for CCPA)
   */
  async detectCaliforniaUser(): Promise<boolean> {
    try {
      // Check localStorage first
      const stored = localStorage.getItem('user-location');
      if (stored) {
        const location = JSON.parse(stored);
        return location.state === 'CA' || location.region === 'California';
      }

      // Simple IP-based detection (in production, use a proper geolocation service)
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      const isCA = data.region === 'California' || data.region_code === 'CA';
      
      // Store result
      localStorage.setItem('user-location', JSON.stringify({
        state: data.region_code,
        region: data.region,
        country: data.country_name,
        detected: new Date().toISOString(),
      }));
      
      return isCA;
    } catch (error) {
      console.warn('Could not detect user location:', error);
      return false;
    }
  },

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Generate secure request ID
   */
  generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Get privacy rights by jurisdiction
   */
  getPrivacyRights(jurisdiction: 'GDPR' | 'CCPA' | 'LGPD' | 'PIPEDA'): string[] {
    const rights = {
      GDPR: [
        'Right to be informed',
        'Right of access',
        'Right to rectification',
        'Right to erasure',
        'Right to restrict processing',
        'Right to data portability',
        'Right to object',
        'Rights in relation to automated decision making and profiling'
      ],
      CCPA: [
        'Right to know what personal information is collected',
        'Right to know whether personal information is sold or disclosed',
        'Right to say no to the sale of personal information',
        'Right to access personal information',
        'Right to equal service and price'
      ],
      LGPD: [
        'Right to confirmation of data processing',
        'Right to access data',
        'Right to correction of data',
        'Right to anonymization or deletion',
        'Right to data portability',
        'Right to information about data sharing',
        'Right to revoke consent'
      ],
      PIPEDA: [
        'Right to know how personal information is used',
        'Right to access personal information',
        'Right to challenge accuracy and completeness',
        'Right to withdraw consent',
        'Right to file complaints'
      ]
    };
    
    return rights[jurisdiction] || [];
  },
};