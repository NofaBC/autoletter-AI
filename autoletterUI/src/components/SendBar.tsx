import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { ProspectFilters } from '../lib/types';
import { formatDateForAPI, isFutureDate } from '../lib/utils';

interface SendBarProps {
  subject: string;
  fromName: string;
  previewText: string;
  bodyHtml: string;
  selectedIds: string[];
  filters: ProspectFilters;
  onSendSuccess?: (campaignId: string, scheduled: boolean) => void;
}

export const SendBar: React.FC<SendBarProps> = ({
  subject,
  fromName,
  previewText,
  bodyHtml,
  selectedIds,
  filters,
  onSendSuccess
}) => {
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sendType, setSendType] = useState<'now' | 'later'>('now');
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  const isValid = subject && bodyHtml && selectedIds.length > 0;

  // Modal accessibility: Focus trap and ESC key handling
  useEffect(() => {
    if (showConfirmModal) {
      // Focus first element when modal opens
      if (firstFocusableRef.current) {
        firstFocusableRef.current.focus();
      }

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setShowConfirmModal(false);
        }
        
        // Basic focus trap
        if (event.key === 'Tab' && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
          
          if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [showConfirmModal]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const handleTestSend = async () => {
    if (!subject || !bodyHtml) {
      showToast('error', 'Subject and content are required');
      return;
    }

    setTestLoading(true);
    try {
      await api.sendTestNewsletter({
        subject,
        previewText,
        bodyHtml,
        variables: ['firstName', 'company', 'lastSeen']
      });
      showToast('success', 'Test email sent successfully!');
    } catch (error) {
      showToast('error', 'Failed to send test email');
    } finally {
      setTestLoading(false);
    }
  };

  const handleSendNow = () => {
    setSendType('now');
    setShowScheduler(false);
    setShowConfirmModal(true);
  };

  const handleSchedule = () => {
    setSendType('later');
    setShowScheduler(true);
  };

  const validateScheduleTime = () => {
    if (!scheduleDate || !scheduleTime) return false;
    const scheduled = new Date(`${scheduleDate}T${scheduleTime}`);
    return isFutureDate(scheduled);
  };

  // Validate schedule on change
  useEffect(() => {
    if (scheduleDate && scheduleTime) {
      if (!validateScheduleTime()) {
        setScheduleError('Schedule time must be in the future');
      } else {
        setScheduleError('');
      }
    } else {
      setScheduleError('');
    }
  }, [scheduleDate, scheduleTime]);

  const handleConfirmSend = async () => {
    if (!isValid) return;

    let scheduledAt: string | undefined;
    if (sendType === 'later') {
      if (!scheduleDate || !scheduleTime) {
        showToast('error', 'Please select date and time');
        return;
      }
      if (!validateScheduleTime()) {
        showToast('error', 'Schedule time must be in the future');
        return;
      }
      const scheduled = new Date(`${scheduleDate}T${scheduleTime}`);
      scheduledAt = formatDateForAPI(scheduled);
    }

    setLoading(true);
    try {
      const response = await api.sendNewsletter({
        segment: filters,
        recipientIds: selectedIds,
        subject,
        previewText,
        bodyHtml,
        schedule: {
          when: sendType,
          at: scheduledAt
        }
      });
      
      showToast('success', `Newsletter ${sendType === 'now' ? 'sent' : 'scheduled'} successfully!`);
      setShowConfirmModal(false);
      if (onSendSuccess) {
        onSendSuccess(response.campaignId, sendType === 'later');
      }
    } catch (error) {
      showToast('error', 'Failed to send newsletter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Send Options</h3>
            {selectedIds.length === 0 && (
              <p className="text-sm text-red-600 mt-1">Select recipients to enable sending</p>
            )}
            {(!subject || !bodyHtml) && (
              <p className="text-sm text-red-600 mt-1">Subject and content are required</p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              id="sendTestBtn"
              onClick={handleTestSend}
              disabled={testLoading || !subject || !bodyHtml || loading}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              aria-busy={testLoading}
            >
              {testLoading ? 'Sending...' : 'Send Test'}
            </button>
            
            <button
              id="sendNowBtn"
              onClick={handleSendNow}
              disabled={!isValid || loading || testLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              aria-busy={loading}
            >
              {loading && sendType === 'now' ? 'Processing...' : 'Send Now'}
            </button>
            
            <button
              id="scheduleBtn"
              onClick={handleSchedule}
              disabled={!isValid || loading || testLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              aria-busy={loading}
            >
              {loading && sendType === 'later' ? 'Processing...' : 'Schedule'}
            </button>
          </div>
        </div>

        {showScheduler && (
          <div id="schedulePicker" className="mt-4 p-4 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Schedule Newsletter</h4>
            <div className="flex gap-3">
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min={new Date().toISOString().split('T')[0]}
              />
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={!scheduleDate || !scheduleTime || !!scheduleError}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Confirm Schedule
              </button>
            </div>
            {scheduleError && (
              <p className="text-sm text-red-600 mt-2">{scheduleError}</p>
            )}
          </div>
        )}
      </div>

      {showConfirmModal && (
        <div 
          id="confirmSendModal" 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div ref={modalRef} className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 id="modal-title" className="text-lg font-semibold text-gray-900 mb-4">
              Confirm {sendType === 'now' ? 'Send' : 'Schedule'}
            </h3>
            
            <div className="space-y-2 mb-6">
              <p className="text-sm text-gray-600">
                <strong>Recipients:</strong> {selectedIds.length} selected
              </p>
              {filters.tag && (
                <p className="text-sm text-gray-600">
                  <strong>Tag filter:</strong> {filters.tag}
                </p>
              )}
              {filters.source && (
                <p className="text-sm text-gray-600">
                  <strong>Source filter:</strong> {filters.source}
                </p>
              )}
              {filters.opened !== undefined && (
                <p className="text-sm text-gray-600">
                  <strong>Has opened:</strong> {filters.opened ? 'Yes' : 'No'}
                </p>
              )}
              {sendType === 'later' && (
                <p className="text-sm text-gray-600">
                  <strong>Scheduled for:</strong> {scheduleDate} at {scheduleTime}
                </p>
              )}
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                ref={firstFocusableRef}
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSend}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Processing...' : `Confirm ${sendType === 'now' ? 'Send' : 'Schedule'}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          id="statusToast"
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-md shadow-lg z-50 ${
            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}

      {/* Hidden live region for loading announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {testLoading && 'Sending test email...'}
        {loading && sendType === 'now' && 'Sending newsletter...'}
        {loading && sendType === 'later' && 'Scheduling newsletter...'}
      </div>
    </>
  );
};