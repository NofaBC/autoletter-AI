import { 
  ProspectsResponse, 
  NewsletterTestResponse, 
  NewsletterSendResponse, 
  NewsletterStatusResponse 
} from './types';
import { mockProspects } from './mockData';

// Track campaign states for mock progression
const campaignStates: Record<string, { 
  callCount: number; 
  startTime: number;
  totalRecipients?: number;
}> = {};

// Mock API service for development when real API is unavailable
export const mockApi = {
  getProspects: async (filters: any = {}): Promise<ProspectsResponse> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filtered = [...mockProspects];
    
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
  },

  sendTestNewsletter: async (): Promise<NewsletterTestResponse> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { status: 'ok' };
  },

  sendNewsletter: async (data: any): Promise<NewsletterSendResponse> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const campaignId = `cmp_${Date.now()}`;
    
    // Store the total recipients for this campaign
    campaignStates[campaignId] = { 
      callCount: 0, 
      startTime: Date.now(),
      totalRecipients: data.recipientIds.length 
    };
    
    return { 
      campaignId,
      queued: data.recipientIds.length 
    };
  },

  getNewsletterStatus: async (campaignId?: string): Promise<NewsletterStatusResponse> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const id = campaignId || 'default';
    
    // Initialize campaign state if not exists
    if (!campaignStates[id]) {
      campaignStates[id] = { callCount: 0, startTime: Date.now(), totalRecipients: 2 };
    }
    
    const campaign = campaignStates[id];
    campaign.callCount++;
    const total = campaign.totalRecipients || 2;
    
    // Progress through states based on call count
    if (campaign.callCount <= 2) {
      return { sent: 0, failed: 0, state: 'queued' };
    } else if (campaign.callCount <= 4) {
      // Gradually increase sent count during sending phase
      const sentCount = Math.min(Math.floor((campaign.callCount - 2) * total / 2), total);
      return { sent: sentCount, failed: 0, state: 'sending' };
    } else {
      // All sent when done
      return { sent: total, failed: 0, state: 'done' };
    }
  }
};