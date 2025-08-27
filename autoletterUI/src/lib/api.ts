import {
  Prospect,
  ProspectsResponse,
  NewsletterTestRequest,
  NewsletterTestResponse,
  NewsletterSendRequest,
  NewsletterSendResponse,
  NewsletterStatusResponse,
  ErrorResponse,
  ProspectFilters
} from './types';
import { logger } from './logger';

const BASE_URL = 'https://mock.autol.ai/api';

const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json() as ErrorResponse;
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  retries: number = 2,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      return await handleResponse<T>(response);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

// API Methods

export const api = {
  // GET /prospects
  getProspects: async (filters: ProspectFilters = {}): Promise<ProspectsResponse> => {
    try {
      const queryString = buildQueryString(filters);
      return await fetchWithRetry<ProspectsResponse>(`${BASE_URL}/prospects${queryString}`);
    } catch (error) {
      // For development, return filtered mock data
      logger.log('API not available, using mock data');
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
      
      return {
        items: filtered,
        total: filtered.length
      };
    }
  },

  // POST /newsletter/test
  sendTestNewsletter: async (data: NewsletterTestRequest): Promise<NewsletterTestResponse> => {
    try {
      return await fetchWithRetry<NewsletterTestResponse>(`${BASE_URL}/newsletter/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      // Mock response for UI testing
      logger.log('API not available, returning mock success');
      return { status: 'ok' };
    }
  },

  // POST /newsletter/send
  sendNewsletter: async (data: NewsletterSendRequest): Promise<NewsletterSendResponse> => {
    try {
      return await fetchWithRetry<NewsletterSendResponse>(`${BASE_URL}/newsletter/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      // Mock response for UI testing
      logger.log('API not available, returning mock campaign ID');
      return { 
        campaignId: `cmp_${Date.now()}`,
        queued: data.recipientIds.length 
      };
    }
  },

  // GET /newsletter/status
  getNewsletterStatus: async (campaignId: string): Promise<NewsletterStatusResponse> => {
    try {
      return await fetchWithRetry<NewsletterStatusResponse>(
        `${BASE_URL}/newsletter/status?campaignId=${campaignId}`
      );
    } catch (error) {
      // Mock response for UI testing - simulate progression
      logger.log('API not available, returning mock status');
      return {
        sent: 2,
        failed: 0,
        state: 'sending' as const
      };
    }
  },
};

// Mock data 
export const mockData = {
  prospects: [
    {
      id: 'p1',
      firstName: 'Ava',
      email: 'ava@example.com',
      source: 'JudyVA',
      tags: ['beta'],
      opened: true
    },
    {
      id: 'p2',
      firstName: 'Liam',
      email: 'liam@example.com',
      source: 'PH',
      tags: ['press'],
      opened: false
    },
    {
      id: 'p3',
      firstName: 'Emma',
      email: 'emma@example.com',
      source: 'JudyVA',
      tags: ['beta', 'vip'],
      opened: true
    },
    {
      id: 'p4',
      firstName: 'Noah',
      email: 'noah@example.com',
      source: 'Manual',
      tags: ['press'],
      opened: false
    },
    {
      id: 'p5',
      firstName: 'Olivia',
      email: 'olivia@example.com',
      source: 'PH',
      tags: ['beta'],
      opened: true
    },
  ] as Prospect[]
};