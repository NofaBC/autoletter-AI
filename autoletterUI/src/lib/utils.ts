export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateForAPI = (date: Date): string => {
  return date.toISOString();
};

export const isFutureDate = (date: Date): boolean => {
  return date > new Date();
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const replaceVariables = (content: string, sampleData?: Record<string, string>): string => {
  const defaultValues = {
    firstName: 'John',
    company: 'Acme Corp',
    lastSeen: '2 days ago',
    unsubscribeUrl: '#unsubscribe'
  };
  
  const values = { ...defaultValues, ...sampleData };
  
  let result = content;
  Object.entries(values).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  });
  
  return result;
};

export const getUniqueValues = <T>(items: T[], key: keyof T): string[] => {
  const values = new Set<string>();
  items.forEach(item => {
    const value = item[key];
    if (Array.isArray(value)) {
      value.forEach(v => values.add(String(v)));
    } else if (value !== null && value !== undefined) {
      values.add(String(value));
    }
  });
  return Array.from(values).sort();
};

export const getLastActivity = (prospectId: string): string => {
  // Use stable mock data instead of random generation
  const activityMap: Record<string, string> = {
    'p1': 'Opened newsletter - 2 hours ago',
    'p2': 'Subscribed - 1 day ago',
    'p3': 'Clicked link - 3 days ago',
    'p4': 'Updated profile - 1 week ago',
    'p5': 'Downloaded resource - 2 weeks ago'
  };
  
  return activityMap[prospectId] || 'No recent activity';
};