/**
 * Format an ISO date string as a relative date.
 * Returns "Today", "Yesterday", or "Mar 11" etc.
 */
const formatRelativeDate = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  return `${month} ${date.getDate()}`;
};

/**
 * Format duration in seconds as "X min".
 */
const formatDuration = (seconds: number): string => {
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
};

/**
 * Format a timestamp as a time string like "2:30 PM".
 */
const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = String(minutes).padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${ampm}`;
};

/**
 * Get the ISO week date range string for the current week.
 * e.g., "Mar 9 -- Mar 15"
 */
const getWeekRangeLabel = (): string => {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monMonth = months[monday.getMonth()];
  const sunMonth = months[sunday.getMonth()];

  if (monMonth === sunMonth) {
    return `${monMonth} ${monday.getDate()} -- ${sunday.getDate()}`;
  }
  return `${monMonth} ${monday.getDate()} -- ${sunMonth} ${sunday.getDate()}`;
};

/**
 * Group an array of items by a key extracted via keyFn.
 * Preserves insertion order.
 */
const groupBy = <T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> => {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const existing = map.get(key);
    if (existing) {
      existing.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  return map;
};

/**
 * Get a human-readable day header from an ISO date string.
 * Returns "Today", "Yesterday", or "Mar 11" etc.
 */
const getDayHeader = (isoString: string): string => formatRelativeDate(isoString);

export { formatRelativeDate, formatDuration, formatTime, getWeekRangeLabel, groupBy, getDayHeader };
