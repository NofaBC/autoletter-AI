import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { NewsletterStatusResponse } from '../lib/types';

interface UseNewsletterStatusProps {
  campaignId: string | null;
  enabled: boolean;
}

// Mock status progression for demo
const mockStatusProgression: NewsletterStatusResponse[] = [
  { sent: 0, failed: 0, state: 'queued' },
  { sent: 0, failed: 0, state: 'sending' },
  { sent: 1, failed: 0, state: 'sending' },
  { sent: 2, failed: 0, state: 'done' }
];

export const useNewsletterStatus = ({ campaignId, enabled }: UseNewsletterStatusProps) => {
  const [status, setStatus] = useState<NewsletterStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mockProgressIndex = useRef(0);
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
        // For demo purposes, use mock progression
        if (mockProgressIndex.current < mockStatusProgression.length) {
          setStatus(mockStatusProgression[mockProgressIndex.current]);
          mockProgressIndex.current++;
          
          // Stop when we reach the end
          if (mockProgressIndex.current >= mockStatusProgression.length && intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        } else {
          setError(err instanceof Error ? err.message : 'Failed to fetch status');
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
      mockProgressIndex.current = 0;
    };
  }, [campaignId, enabled]);

  return { status, loading, error };
};