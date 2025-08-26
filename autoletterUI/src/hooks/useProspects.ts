import { useState, useEffect } from 'react';
import { api } from '../lib/api';
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
        // API handles mock fallback internally
        const response = await api.getProspects(filters);
        setProspects(response.items);
        setTotal(response.total);
      } catch (err) {
        // This should rarely happen now since API has fallback
        setError('Failed to load prospects');
        setProspects([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProspects();
  }, [filters.tag, filters.source, filters.opened]);

  return { prospects, loading, error, total };
};