// API Types 

export interface Prospect {
  id: string;
  firstName: string;
  email: string;
  source: string;
  tags: string[];
  opened: boolean;
}

export interface ProspectsResponse {
  items: Prospect[];
  total: number;
}

export interface NewsletterTestRequest {
  subject: string;
  previewText: string;
  bodyHtml: string;
  variables: string[];
}

export interface NewsletterTestResponse {
  status: string;
}

export interface NewsletterSendRequest {
  segment: {
    tag?: string;
    source?: string;
    opened?: boolean;
  };
  recipientIds: string[];
  subject: string;
  previewText: string;
  bodyHtml: string;
  schedule: {
    when: 'now' | 'later';
    at?: string; // ISO date string
  };
}

export interface NewsletterSendResponse {
  campaignId: string;
  queued: number;
}

export interface NewsletterStatusResponse {
  sent: number;
  failed: number;
  state: 'queued' | 'sending' | 'done';
}

export interface ErrorResponse {
  error: string;
}

// Filters for prospects
export interface ProspectFilters {
  tag?: string;
  source?: string;
  opened?: boolean;
}