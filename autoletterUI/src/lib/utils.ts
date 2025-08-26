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

export const generateLastActivity = (): string => {
  const activities = [
    'Opened newsletter',
    'Clicked link',
    'Subscribed',
    'Updated profile',
    'Downloaded resource'
  ];
  const times = [
    '2 hours ago',
    '1 day ago',
    '3 days ago',
    '1 week ago',
    '2 weeks ago'
  ];
  
  const randomActivity = activities[Math.floor(Math.random() * activities.length)];
  const randomTime = times[Math.floor(Math.random() * times.length)];
  
  return `${randomActivity} - ${randomTime}`;
};