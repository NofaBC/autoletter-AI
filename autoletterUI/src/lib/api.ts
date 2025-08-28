import {
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
    try {
      const errorData = await response.json() as ErrorResponse;
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    } catch {
      throw new Error(`Request failed with status ${response.status}`);
    }
  }
  return response.json() as Promise<T>;
}

async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  });
  return handleResponse<T>(response);
}

// API Methods

export const api = {
  // GET /prospects
  getProspects: async (filters: ProspectFilters = {}): Promise<ProspectsResponse> => {
    const queryString = buildQueryString(filters);
    return fetchApi<ProspectsResponse>(`${BASE_URL}/prospects${queryString}`);
  },

  // POST /newsletter/test
  sendTestNewsletter: async (data: NewsletterTestRequest): Promise<NewsletterTestResponse> => {
    return fetchApi<NewsletterTestResponse>(`${BASE_URL}/newsletter/test`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // POST /newsletter/send
  sendNewsletter: async (data: NewsletterSendRequest): Promise<NewsletterSendResponse> => {
    return fetchApi<NewsletterSendResponse>(`${BASE_URL}/newsletter/send`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // GET /newsletter/status
  getNewsletterStatus: async (campaignId: string): Promise<NewsletterStatusResponse> => {
    return fetchApi<NewsletterStatusResponse>(
      `${BASE_URL}/newsletter/status?campaignId=${campaignId}`
    );
  }
};