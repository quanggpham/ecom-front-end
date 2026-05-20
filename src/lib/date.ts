const APP_TIME_ZONE = 'Asia/Ho_Chi_Minh';

const hasExplicitTimeZone = (value: string) => /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value.trim());

const parseVietnamWallTime = (value: string) => {
  const normalized = value.trim().replace(' ', 'T');
  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?)?$/
  );

  if (!match) return null;

  const [, year, month, day, hour = '00', minute = '00', second = '00'] = match;
  return new Date(Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour) - 7,
    Number(minute),
    Number(second)
  ));
};

export const formatDateTime = (
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {}
) => {
  if (!value) return '-';

  const date = hasExplicitTimeZone(value)
    ? new Date(value)
    : parseVietnamWallTime(value) ?? new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(date);
};

export const formatDateOnly = (
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {}
) => formatDateTime(value, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: undefined,
  minute: undefined,
  ...options,
});
