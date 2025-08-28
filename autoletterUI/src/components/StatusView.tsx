import React from 'react';
import { useNewsletterStatus } from '../hooks/useNewsletterStatus';

interface StatusViewProps {
  campaignId: string;
  isScheduled: boolean;
}

export const StatusView: React.FC<StatusViewProps> = ({ campaignId, isScheduled }) => {
  const { status, loading, error } = useNewsletterStatus({
    campaignId,
    enabled: !isScheduled // Only poll for immediate sends
  });

  if (isScheduled) {
    return (
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-800 font-medium">Newsletter Scheduled</p>
            <p className="text-sm text-blue-600 mt-1">Campaign ID: {campaignId}</p>
          </div>
          <div className="text-blue-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !status) {
    return (
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-md p-4">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
          <p className="text-gray-700">Loading status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error loading status: {error}</p>
      </div>
    );
  }

  if (!status) return null;

  const getStatusIcon = () => {
    switch (status.state) {
      case 'queued':
        return (
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'sending':
        return (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        );
      case 'done':
        return (
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getStatusColor = () => {
    switch (status.state) {
      case 'queued': return 'yellow';
      case 'sending': return 'blue';
      case 'done': return 'green';
      default: return 'gray';
    }
  };

  const color = getStatusColor();

  return (
    <div className={`mt-6 bg-${color}-50 border border-${color}-200 rounded-md p-4`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            {getStatusIcon()}
            <h3 className={`ml-2 text-lg font-medium text-${color}-900`}>
              {status.state === 'queued' && 'Queued'}
              {status.state === 'sending' && 'Sending'}
              {status.state === 'done' && 'Completed'}
            </h3>
          </div>
          
          <p className={`text-sm text-${color}-700 mb-1`}>
            Campaign ID: {campaignId}
          </p>
          
          <div className={`text-sm text-${color}-800 space-y-1`}>
            <p>✓ Sent: {status.sent}</p>
            {status.failed > 0 && <p>✗ Failed: {status.failed}</p>}
          </div>

          {status.state === 'done' && (
            <a 
              href="#"
              className={`inline-block mt-3 text-sm text-${color}-600 hover:text-${color}-700 underline`}
              onClick={(e) => {
                e.preventDefault();
                alert('Campaign report view - coming soon!');
              }}
            >
              View campaign report →
            </a>
          )}
        </div>
      </div>
    </div>
  );
};