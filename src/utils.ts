// Format ISO 8601 strings to ensure reliable parsing
export const formatISOString = (dateStr: string): string => {
  // Convert format like "20250228T060000Z" to "2025-02-28T06:00:00Z"
  return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(
    6,
    8,
  )}T${dateStr.slice(9, 11)}:${dateStr.slice(11, 13)}:${dateStr.slice(
    13,
    15,
  )}Z`;
};
