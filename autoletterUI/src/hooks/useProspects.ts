import { useState, useEffect, useMemo } from 'react';
import { api } from '../lib/api';
import { Prospect, ProspectFilters } from '../lib/types';

export const useProspects = (filters: ProspectFilters = {}) => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

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
      const errorMessage = err instanceof Error ? err.message : 'Failed to load prospects';
      setError(errorMessage);
      setProspects([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProspects();
  }, [filters.tag, filters.source, filters.opened, retryCount]);

  const retry = () => {
    setRetryCount(prev => prev + 1);
  };

  return { prospects, loading, error, total, retry };
};