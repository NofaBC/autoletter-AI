import React, { useState, useCallback } from 'react';
import { ProspectsTable } from '../components/ProspectsTable';
import { Filters } from '../components/Filters';
import { Editor } from '../components/Editor';
import { Preview } from '../components/Preview';
import { SendBar } from '../components/SendBar';
import { StatusView } from '../components/StatusView';
import { useProspects } from '../hooks/useProspects';
import { ProspectFilters } from '../lib/types';

const NewsletterPage: React.FC = () => {
  const [filters, setFilters] = useState<ProspectFilters>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { prospects, loading, error, total, retry } = useProspects(filters);

  const [subject, setSubject] = useState('');
  const [fromName, setFromName] = useState('AutoLetter Team');
  const [fromEmail] = useState('newsletter@autoletter.ai');
  const [previewText, setPreviewText] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [campaignScheduled, setCampaignScheduled] = useState(false);

  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  const handleFiltersChange = useCallback((newFilters: ProspectFilters) => {
    setFilters(newFilters);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">AutoLetter AI - Newsletter Manager</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Mailing List
          </h2>
          
          {selectedIds.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
              <p className="text-sm text-blue-800">
                {selectedIds.length} prospect{selectedIds.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}
          
          <Filters 
            filters={filters}
            prospects={prospects}
            onFiltersChange={handleFiltersChange} 
          />
          
          <ProspectsTable
            prospects={prospects}
            loading={loading}
            error={error}
            selectedIds={selectedIds}
            onSelectionChange={handleSelectionChange}
            onRetry={retry}
          />
          
          {!loading && !error && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {prospects.length} of {total} total prospects
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Editor
            subject={subject}
            fromName={fromName}
            fromEmail={fromEmail}
            previewText={previewText}
            bodyHtml={bodyHtml}
            onSubjectChange={setSubject}
            onFromNameChange={setFromName}
            onPreviewTextChange={setPreviewText}
            onBodyChange={setBodyHtml}
          />
          
          <Preview
            subject={subject}
            fromName={fromName}
            fromEmail={fromEmail}
            previewText={previewText}
            bodyHtml={bodyHtml}
          />
        </div>

        <SendBar
          subject={subject}
          fromName={fromName}
          previewText={previewText}
          bodyHtml={bodyHtml}
          selectedIds={selectedIds}
          filters={filters}
          onSendSuccess={(id, scheduled) => {
            setCampaignId(id);
            setCampaignScheduled(scheduled || false);
          }}
        />

        {campaignId && (
          <StatusView campaignId={campaignId} isScheduled={campaignScheduled} />
        )}
      </main>
    </div>
  );
};

export default NewsletterPage;