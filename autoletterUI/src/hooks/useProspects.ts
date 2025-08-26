import { useState, useEffect } from 'react';
import { api, mockData } from '../lib/api';
import { Prospect, ProspectFilters } from '../lib/types';

export const useProspects = (filters: ProspectFilters = {}) => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchProspects = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.getProspects(filters);
        setProspects(response.items);
        setTotal(response.total);
      } catch (err) {
        console.log('Using mock data as fallback');
        
        let filtered = [...mockData.prospects];
        
        if (filters.tag) {
          filtered = filtered.filter(p => p.tags.includes(filters.tag!));
        }
        if (filters.source) {
          filtered = filtered.filter(p => p.source === filters.source);
        }
        if (filters.opened !== undefined) {
          filtered = filtered.filter(p => p.opened === filters.opened);
        }
        
        setProspects(filtered);
        setTotal(filtered.length);
      } finally {
        setLoading(false);
      }
    };

    fetchProspects();
  }, [filters.tag, filters.source, filters.opened]);

  return { prospects, loading, error, total };
};