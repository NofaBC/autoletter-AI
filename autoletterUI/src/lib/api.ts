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
  retries: number = 3,
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
    const queryString = buildQueryString(filters);
    return fetchWithRetry<ProspectsResponse>(`${BASE_URL}/prospects${queryString}`);
  },

  // POST /newsletter/test
  sendTestNewsletter: async (data: NewsletterTestRequest): Promise<NewsletterTestResponse> => {
    return fetchWithRetry<NewsletterTestResponse>(`${BASE_URL}/newsletter/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },

  // POST /newsletter/send
  sendNewsletter: async (data: NewsletterSendRequest): Promise<NewsletterSendResponse> => {
    return fetchWithRetry<NewsletterSendResponse>(`${BASE_URL}/newsletter/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },

  // GET /newsletter/status
  getNewsletterStatus: async (campaignId: string): Promise<NewsletterStatusResponse> => {
    return fetchWithRetry<NewsletterStatusResponse>(
      `${BASE_URL}/newsletter/status?campaignId=${campaignId}`
    );
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