export type IDateFormat = 'long' | 'short' | 'file' | 'iso' | 'postCard' | 'newChat';

export const DateFormat: Record<IDateFormat, string> = {
  long: 'YYYY. MM. DD. dddd a h시 m분',
  short: 'YYYY-MM-DD',
  file: 'YYMMDD_HHmmss',
  iso: 'YYYY-MM-DDTHH:mm',
  postCard: 'YYYY/MM/DD a hh:mm',
  newChat: 'MM/DD a hh:mm',
};
