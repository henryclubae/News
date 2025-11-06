'use client';

import React, { useState, useCallback } from 'react';
import { DataExportRequest, FormValidationError } from '@/types/cookie-consent';
import { dataExportAPI, privacyUtils } from '@/lib/privacy-api';

interface DataExportProps {
  onExportRequested?: (request: DataExportRequest) => void;
  className?: string;
}

const DATA_TYPES = [
  { id: 'profile', label: 'Profile Information', description: 'Name, email, profile picture, account settings', size: '~50KB' },
  { id: 'content', label: 'User Content', description: 'Articles, comments, posts, uploads', size: '~2-50MB' },
  { id: 'activity', label: 'Activity History', description: 'Browse history, interactions, reading patterns', size: '~500KB' },
  { id: 'preferences', label: 'Preferences & Settings', description: 'Privacy settings, notifications, customizations', size: '~10KB' },
  { id: 'communications', label: 'Communications', description: 'Messages, emails, notification history', size: '~1-10MB' },
  { id: 'analytics', label: 'Analytics Data', description: 'Usage statistics, behavior data', size: '~100KB' },
] as const;

const EXPORT_FORMATS = [
  { 
    value: 'json' as const, 
    label: 'JSON', 
    description: 'Machine-readable format, best for developers',
    icon: '{ }' 
  },
  { 
    value: 'csv' as const, 
    label: 'CSV', 
    description: 'Spreadsheet format, best for data analysis',
    icon: '📊' 
  },
  { 
    value: 'pdf' as const, 
    label: 'PDF', 
    description: 'Human-readable format, best for printing',
    icon: '📄' 
  },
] as const;

export default function DataExport({
  onExportRequested,
  className = ''
}: DataExportProps) {
  const [formData, setFormData] = useState<{
    email: string;
    requestType: 'full_export' | 'partial_export';
    dataTypes: string[];
    format: 'json' | 'csv' | 'pdf';
  }>({
    email: '',
    requestType: 'partial_export',
    dataTypes: [],
    format: 'json',
  });

  const [errors, setErrors] = useState<FormValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<DataExportRequest | null>(null);
  const [statusCheck, setStatusCheck] = useState({
    requestId: '',
    email: '',
    isChecking: false,
    result: null as DataExportRequest | null,
  });

  const validateForm = useCallback((): FormValidationError[] => {
    const validationErrors: FormValidationError[] = [];

    if (!formData.email.trim()) {
      validationErrors.push({
        field: 'email',
        message: 'Email address is required',
        code: 'REQUIRED'
      });
    } else if (!privacyUtils.validateEmail(formData.email)) {
      validationErrors.push({
        field: 'email',
        message: 'Please enter a valid email address',
        code: 'INVALID_FORMAT'
      });
    }

    if (formData.requestType === 'partial_export' && formData.dataTypes.length === 0) {
      validationErrors.push({
        field: 'dataTypes',
        message: 'Please select at least one data type to export',
        code: 'REQUIRED'
      });
    }

    return validationErrors;
  }, [formData]);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific errors
    if (errors.length > 0) {
      setErrors(prev => prev.filter(error => error.field !== field));
    }
  };

  const handleDataTypeToggle = (dataTypeId: string) => {
    setFormData(prev => ({
      ...prev,
      dataTypes: prev.dataTypes.includes(dataTypeId)
        ? prev.dataTypes.filter(id => id !== dataTypeId)
        : [...prev.dataTypes, dataTypeId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      const response = await dataExportAPI.requestExport({
        email: formData.email.trim(),
        requestType: formData.requestType,
        dataTypes: formData.requestType === 'full_export' 
          ? DATA_TYPES.map(dt => dt.id) 
          : formData.dataTypes,
        format: formData.format,
      });

      if (response.success && response.data) {
        setSubmittedRequest(response.data);
        onExportRequested?.(response.data);
      } else {
        setErrors(response.errors || [
          { field: 'general', message: response.error || 'Failed to submit request', code: 'SUBMISSION_FAILED' }
        ]);
      }
    } catch {
      setErrors([
        { field: 'general', message: 'Network error. Please try again.', code: 'NETWORK_ERROR' }
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkExportStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!statusCheck.requestId.trim() || !statusCheck.email.trim()) {
      setErrors([
        { field: 'status', message: 'Please enter both request ID and email address', code: 'REQUIRED' }
      ]);
      return;
    }

    if (!privacyUtils.validateEmail(statusCheck.email)) {
      setErrors([
        { field: 'status', message: 'Please enter a valid email address', code: 'INVALID_FORMAT' }
      ]);
      return;
    }

    setStatusCheck(prev => ({ ...prev, isChecking: true }));
    setErrors([]);

    try {
      const response = await dataExportAPI.getExportStatus(statusCheck.requestId, statusCheck.email);
      
      if (response.success && response.data) {
        setStatusCheck(prev => ({ ...prev, result: response.data ?? null }));
      } else {
        setErrors([
          { field: 'status', message: response.error || 'Export request not found', code: 'NOT_FOUND' }
        ]);
      }
    } catch {
      setErrors([
        { field: 'status', message: 'Network error. Please try again.', code: 'NETWORK_ERROR' }
      ]);
    } finally {
      setStatusCheck(prev => ({ ...prev, isChecking: false }));
    }
  };

  const getFieldError = (fieldName: string) => {
    return errors.find(error => error.field === fieldName)?.message;
  };

  const getEstimatedSize = (): string => {
    if (formData.requestType === 'full_export') {
      return '~10-100MB';
    }
    
    const selectedTypes = DATA_TYPES.filter(type => formData.dataTypes.includes(type.id));
    if (selectedTypes.length === 0) return '~0KB';
    
    // Simple estimation logic
    const sizes = selectedTypes.map(type => {
      const sizeStr = type.size.replace(/[^\d.-]/g, '');
      return parseFloat(sizeStr) || 0;
    });
    
    const totalMB = sizes.reduce((sum, size) => sum + size, 0);
    return totalMB < 1 ? `~${Math.round(totalMB * 1000)}KB` : `~${Math.round(totalMB)}MB`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (submittedRequest) {
    return (
      <ExportRequestSuccess 
        request={submittedRequest} 
        onNewRequest={() => {
          setSubmittedRequest(null);
          setFormData({
            email: '',
            requestType: 'partial_export',
            dataTypes: [],
            format: 'json',
          });
        }}
      />
    );
  }

  return (
    <div className={`max-w-4xl mx-auto space-y-8 ${className}`}>
      {/* New Export Request */}
      <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Export Your Data
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Request a copy of your personal data in accordance with privacy regulations (GDPR Article 20, CCPA Section 1798.100)
          </p>
        </div>

        {/* General Errors */}
        {errors.some(e => e.field === 'general') && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300">
                  {getFieldError('general')}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                getFieldError('email') ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="your@email.com"
              aria-describedby={getFieldError('email') ? 'email-error' : undefined}
            />
            {getFieldError('email') && (
              <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                {getFieldError('email')}
              </p>
            )}
          </div>

          {/* Export Type */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Export Type
            </h3>
            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="requestType"
                  value="full_export"
                  checked={formData.requestType === 'full_export'}
                  onChange={(e) => handleInputChange('requestType', e.target.value)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    Complete Data Export
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Export all available data associated with your account
                  </div>
                </div>
              </label>
              
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="requestType"
                  value="partial_export"
                  checked={formData.requestType === 'partial_export'}
                  onChange={(e) => handleInputChange('requestType', e.target.value)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    Selective Data Export
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Choose specific data types to export
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Data Types (for partial export) */}
          {formData.requestType === 'partial_export' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Data Types to Export *
              </h3>
              <div className="space-y-2">
                {DATA_TYPES.map((dataType) => (
                  <label key={dataType.id} className="flex items-start space-x-3 cursor-pointer p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input
                      type="checkbox"
                      checked={formData.dataTypes.includes(dataType.id)}
                      onChange={() => handleDataTypeToggle(dataType.id)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {dataType.label}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {dataType.size}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {dataType.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {getFieldError('dataTypes') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {getFieldError('dataTypes')}
                </p>
              )}
            </div>
          )}

          {/* Export Format */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Export Format
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {EXPORT_FORMATS.map((format) => (
                <label key={format.value} className="flex items-center space-x-3 cursor-pointer p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <input
                    type="radio"
                    name="format"
                    value={format.value}
                    checked={formData.format === format.value}
                    onChange={(e) => handleInputChange('format', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{format.icon}</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {format.label}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {format.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Estimated Size */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Estimated Export Size: {getEstimatedSize()}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  Processing may take 5-30 minutes depending on data volume
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Processing Request...
              </span>
            ) : (
              'Request Data Export'
            )}
          </button>
        </form>
      </div>

      {/* Status Check */}
      <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Check Export Status
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your request ID and email to check the status of an existing export request
          </p>
        </div>

        {/* Status Errors */}
        {errors.some(e => e.field === 'status') && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300">
                  {getFieldError('status')}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={checkExportStatus} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="requestId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Request ID
              </label>
              <input
                type="text"
                id="requestId"
                value={statusCheck.requestId}
                onChange={(e) => setStatusCheck(prev => ({ ...prev, requestId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                placeholder="EXP-XXXXXXXX"
              />
            </div>
            <div>
              <label htmlFor="statusEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="statusEmail"
                value={statusCheck.email}
                onChange={(e) => setStatusCheck(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                placeholder="your@email.com"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={statusCheck.isChecking}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              statusCheck.isChecking
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {statusCheck.isChecking ? 'Checking...' : 'Check Status'}
          </button>
        </form>

        {/* Status Result */}
        {statusCheck.result && (
          <ExportStatusResult 
            request={statusCheck.result} 
            formatFileSize={formatFileSize}
          />
        )}
      </div>
    </div>
  );
}

function ExportRequestSuccess({ 
  request, 
  onNewRequest 
}: { 
  request: DataExportRequest; 
  onNewRequest: () => void; 
}) {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Export Request Submitted
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Your data export request has been successfully submitted and is being processed.
        </p>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <div className="text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">Request ID:</span>
              <span className="font-mono text-gray-900 dark:text-white">{request.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
              <span className="text-gray-900 dark:text-white">{request.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">Format:</span>
              <span className="text-gray-900 dark:text-white uppercase">{request.format}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">
                {request.status}
              </span>
            </div>
          </div>
        </div>

        <div className="text-left bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 mb-6">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            What happens next:
          </h3>
          <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
            <li>We will verify your identity via email</li>
            <li>Your data will be processed and packaged</li>
            <li>You will receive a download link when ready</li>
            <li>The download will be available for 7 days</li>
          </ol>
        </div>

        <button
          onClick={onNewRequest}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Submit New Request
        </button>
      </div>
    </div>
  );
}

function ExportStatusResult({ 
  request, 
  formatFileSize 
}: { 
  request: DataExportRequest; 
  formatFileSize: (bytes: number) => string; 
}) {
  const getStatusColor = (status: DataExportRequest['status']) => {
    switch (status) {
      case 'ready': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'processing': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
      case 'failed': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      case 'expired': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20';
      default: return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
    }
  };

  return (
    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
        Export Status
      </h4>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Submitted:</span>
          <span className="text-sm text-gray-900 dark:text-white">
            {new Date(request.submittedAt).toLocaleString()}
          </span>
        </div>
        
        {request.completedAt && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Completed:</span>
            <span className="text-sm text-gray-900 dark:text-white">
              {new Date(request.completedAt).toLocaleString()}
            </span>
          </div>
        )}
        
        {request.fileSize && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">File Size:</span>
            <span className="text-sm text-gray-900 dark:text-white">
              {formatFileSize(request.fileSize)}
            </span>
          </div>
        )}
        
        {request.expiresAt && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Expires:</span>
            <span className="text-sm text-gray-900 dark:text-white">
              {new Date(request.expiresAt).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {request.status === 'ready' && request.downloadUrl && (
        <div className="mt-4">
          <a
            href={request.downloadUrl}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Export
          </a>
        </div>
      )}
    </div>
  );
}