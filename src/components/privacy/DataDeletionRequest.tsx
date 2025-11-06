'use client';

import React, { useState, useCallback } from 'react';
import { DataDeletionRequest, FormValidationError } from '@/types/cookie-consent';
import { dataDeletionAPI, privacyUtils } from '@/lib/privacy-api';

interface DataDeletionRequestProps {
  onSuccess?: (request: DataDeletionRequest) => void;
  onCancel?: () => void;
  className?: string;
}

const DATA_TYPES = [
  { id: 'profile', label: 'Profile Information', description: 'Name, email, profile picture' },
  { id: 'content', label: 'User Content', description: 'Articles, comments, uploads' },
  { id: 'activity', label: 'Activity Logs', description: 'Browse history, interactions' },
  { id: 'preferences', label: 'Preferences', description: 'Settings, customizations' },
  { id: 'analytics', label: 'Analytics Data', description: 'Usage statistics, behavior data' },
  { id: 'communications', label: 'Communications', description: 'Messages, notifications' },
] as const;

const REQUEST_TYPES = [
  { 
    id: 'full_deletion' as const, 
    label: 'Complete Account Deletion', 
    description: 'Delete all data associated with your account permanently' 
  },
  { 
    id: 'specific_data' as const, 
    label: 'Specific Data Deletion', 
    description: 'Delete only selected types of data' 
  },
  { 
    id: 'anonymize' as const, 
    label: 'Data Anonymization', 
    description: 'Remove personally identifiable information while keeping anonymized data for analytics' 
  },
] as const;

export default function DataDeletionRequestForm({
  onSuccess,
  onCancel,
  className = ''
}: DataDeletionRequestProps) {
  const [formData, setFormData] = useState<{
    email: string;
    fullName: string;
    requestType: 'full_deletion' | 'specific_data' | 'anonymize';
    dataTypes: string[];
    reason: string;
  }>({
    email: '',
    fullName: '',
    requestType: 'full_deletion',
    dataTypes: [],
    reason: '',
  });

  const [errors, setErrors] = useState<FormValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<DataDeletionRequest | null>(null);

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

    if (!formData.fullName.trim()) {
      validationErrors.push({
        field: 'fullName',
        message: 'Full name is required',
        code: 'REQUIRED'
      });
    } else if (formData.fullName.trim().length < 2) {
      validationErrors.push({
        field: 'fullName',
        message: 'Full name must be at least 2 characters',
        code: 'TOO_SHORT'
      });
    }

    if (formData.requestType === 'specific_data' && formData.dataTypes.length === 0) {
      validationErrors.push({
        field: 'dataTypes',
        message: 'Please select at least one data type to delete',
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

    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      const response = await dataDeletionAPI.submitRequest({
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
        requestType: formData.requestType,
        dataTypes: formData.requestType === 'full_deletion' 
          ? DATA_TYPES.map(dt => dt.id) 
          : formData.dataTypes,
        reason: formData.reason.trim() || undefined,
      });

      if (response.success && response.data) {
        setSubmittedRequest(response.data);
        onSuccess?.(response.data);
      } else {
        setErrors(response.errors || [
          { field: 'general', message: response.error || 'Failed to submit request', code: 'SUBMISSION_FAILED' }
        ]);
        setShowConfirmation(false);
      }
    } catch {
      setErrors([
        { field: 'general', message: 'Network error. Please try again.', code: 'NETWORK_ERROR' }
      ]);
      setShowConfirmation(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (fieldName: string) => {
    return errors.find(error => error.field === fieldName)?.message;
  };

  if (submittedRequest) {
    return (
      <SuccessMessage 
        request={submittedRequest} 
        onClose={() => {
          setSubmittedRequest(null);
          onCancel?.();
        }}
      />
    );
  }

  return (
    <div className={`max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Data Deletion Request
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Request deletion of your personal data in accordance with privacy regulations (GDPR, CCPA, etc.)
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
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error submitting request
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {getFieldError('general')}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Contact Information
          </h3>
          
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

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                getFieldError('fullName') ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Your full name"
              aria-describedby={getFieldError('fullName') ? 'fullName-error' : undefined}
            />
            {getFieldError('fullName') && (
              <p id="fullName-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                {getFieldError('fullName')}
              </p>
            )}
          </div>
        </div>

        {/* Request Type */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Type of Request
          </h3>
          <div className="space-y-3">
            {REQUEST_TYPES.map((type) => (
              <label key={type.id} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="requestType"
                  value={type.id}
                  checked={formData.requestType === type.id}
                  onChange={(e) => handleInputChange('requestType', e.target.value)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {type.label}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {type.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Data Types (for specific deletion) */}
        {formData.requestType === 'specific_data' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Data to Delete *
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
                    <div className="font-medium text-gray-900 dark:text-white">
                      {dataType.label}
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

        {/* Reason (optional) */}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Reason for Request (Optional)
          </label>
          <textarea
            id="reason"
            value={formData.reason}
            onChange={(e) => handleInputChange('reason', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            placeholder="Optional: Provide additional context for your request"
          />
        </div>

        {/* Confirmation Dialog */}
        {showConfirmation && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Confirm Deletion Request
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  {formData.requestType === 'full_deletion' 
                    ? 'This will permanently delete all data associated with your account. This action cannot be undone.'
                    : 'This will delete the selected data types from your account. This action cannot be undone.'
                  }
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                  You will receive an email confirmation and verification instructions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          )}
          
          {showConfirmation && (
            <button
              type="button"
              onClick={() => setShowConfirmation(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
            >
              Back to Edit
            </button>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Processing...
              </span>
            ) : showConfirmation ? (
              'Confirm Deletion Request'
            ) : (
              'Submit Request'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function SuccessMessage({ 
  request, 
  onClose 
}: { 
  request: DataDeletionRequest; 
  onClose: () => void; 
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
          Deletion Request Submitted
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Your data deletion request has been successfully submitted.
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
              <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">
                Pending Verification
              </span>
            </div>
          </div>
        </div>

        <div className="text-left bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 mb-6">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Next Steps:
          </h3>
          <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
            <li>Check your email for a verification message</li>
            <li>Click the verification link to confirm your identity</li>
            <li>We will process your request within 30 days</li>
            <li>You will receive updates on the request status</li>
          </ol>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}