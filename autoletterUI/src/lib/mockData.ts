import { Prospect } from './types';

// Stable mock data - no random generation
export const mockProspects: Prospect[] = [
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
];

// Stable last activity data - no random generation
export const lastActivityMap: Record<string, string> = {
  'p1': 'Opened newsletter - 2 hours ago',
  'p2': 'Subscribed - 1 day ago',
  'p3': 'Clicked link - 3 days ago',
  'p4': 'Updated profile - 1 week ago',
  'p5': 'Downloaded resource - 2 weeks ago'
};