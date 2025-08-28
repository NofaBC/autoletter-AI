import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { NewsletterStatusResponse } from '../lib/types';

interface UseNewsletterStatusProps {
  campaignId: string | null;
  enabled: boolean;
}

export const useNewsletterStatus = ({ campaignId, enabled }: UseNewsletterStatusProps) => {
  const [status, setStatus] = useState<NewsletterStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!campaignId || !enabled) {
      return;
    }

    const fetchStatus = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.getNewsletterStatus(campaignId);
        setStatus(response);
        
        // Stop polling if status is done
        if (response.state === 'done' && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch status');
        // Stop polling on error
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchStatus();

    // Set up polling interval (every 2 seconds)
    intervalRef.current = setInterval(fetchStatus, 2000);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [campaignId, enabled]);

  return { status, loading, error };
};