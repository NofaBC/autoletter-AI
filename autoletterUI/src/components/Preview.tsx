import React from 'react';
import DOMPurify from 'dompurify';
import { replaceVariables } from '../lib/utils';

interface PreviewProps {
  subject: string;
  fromName: string;
  fromEmail: string;
  previewText: string;
  bodyHtml: string;
}

export const Preview: React.FC<PreviewProps> = ({
  subject,
  fromName,
  fromEmail,
  previewText,
  bodyHtml
}) => {
  const processedBody = replaceVariables(bodyHtml);
  const sanitizedBody = DOMPurify.sanitize(processedBody, {
    ADD_ATTR: ['target', 'rel'] // Allow these attributes in addition to defaults
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview</h2>
      
      <div id="previewPanel" className="border border-gray-200 rounded-md overflow-hidden">
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <div className="text-sm text-gray-600 mb-1">From: {fromName} &lt;{fromEmail}&gt;</div>
          <div className="font-semibold text-gray-900">{subject || '(No subject)'}</div>
          {previewText && (
            <div className="text-sm text-gray-600 mt-1">{previewText}</div>
          )}
        </div>
        
        <div className="p-4">
          {bodyHtml ? (
            <div 
              dangerouslySetInnerHTML={{ __html: sanitizedBody }}
              className="prose prose-sm max-w-none whitespace-pre-wrap"
            />
          ) : (
            <p className="text-gray-400 italic">Start typing to see preview...</p>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 border-t border-gray-200 text-xs text-gray-500">
          <p>This is how your newsletter will appear to recipients.</p>
          <p className="mt-1">Variables like {'{{firstName}}'} will be replaced with actual values.</p>
        </div>
      </div>
    </div>
  );
};