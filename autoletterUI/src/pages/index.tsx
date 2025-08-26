import React, { useState } from 'react';
import { ProspectsTable } from '../components/ProspectsTable';
import { Filters } from '../components/Filters';
import { useProspects } from '../hooks/useProspects';
import { ProspectFilters } from '../lib/types';

const NewsletterPage: React.FC = () => {
  const [filters, setFilters] = useState<ProspectFilters>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { prospects, loading, total } = useProspects(filters);

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
            onFiltersChange={setFilters} 
          />
          
          <ProspectsTable
            prospects={prospects}
            loading={loading}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
          
          {!loading && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {prospects.length} of {total} total prospects
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default NewsletterPage;