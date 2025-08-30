import React from 'react';
import { Prospect } from '../lib/types';
import { getLastActivity } from '../lib/utils';

interface ProspectRowProps {
  prospect: Prospect;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

export const ProspectRow = React.memo<ProspectRowProps>(({ 
  prospect, 
  isSelected, 
  onToggleSelect 
}) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(prospect.id)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          aria-label={`Select ${prospect.firstName}`}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {prospect.firstName}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{prospect.email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{prospect.source}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-wrap gap-1">
          {prospect.tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag}
            </span>
          ))}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {getLastActivity(prospect.id)}
      </td>
    </tr>
  );
});