import React from 'react';
import { ProspectFilters } from '../lib/types';
import { mockData } from '../lib/api';
import { getUniqueValues } from '../lib/utils';

interface FiltersProps {
  filters: ProspectFilters;
  onFiltersChange: (filters: ProspectFilters) => void;
}

export const Filters = React.memo<FiltersProps>(({ filters, onFiltersChange }) => {
  const allTags = getUniqueValues(mockData.prospects, 'tags');
  const allSources = getUniqueValues(mockData.prospects, 'source');

  const handleFilterChange = (key: keyof ProspectFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' ? undefined : value
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="filterTag" className="block text-sm font-medium text-gray-700 mb-1">
            Tag
          </label>
          <select
            id="filterTag"
            value={filters.tag || ''}
            onChange={(e) => handleFilterChange('tag', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filterSource" className="block text-sm font-medium text-gray-700 mb-1">
            Source
          </label>
          <select
            id="filterSource"
            value={filters.source || ''}
            onChange={(e) => handleFilterChange('source', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Sources</option>
            {allSources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filterOpened" className="block text-sm font-medium text-gray-700 mb-1">
            Has Opened Before
          </label>
          <select
            id="filterOpened"
            value={filters.opened === undefined ? '' : filters.opened.toString()}
            onChange={(e) => handleFilterChange('opened', e.target.value === '' ? undefined : e.target.value === 'true')}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>
    </div>
  );
});