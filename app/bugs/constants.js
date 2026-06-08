import { formatDateTime as formatDateTimeFromGlobal, formatDate as formatDateFromGlobal } from '@/utils/glocalfunc';

export const STATUS = {
  OPEN: { label: 'Open', bg: '#EFF6FF', color: '#6366F1', border: '#C7D2FE', dot: '#6366F1' },
  IN_PROGRESS: { label: 'In Progress', bg: '#FEF3C7', color: '#D97706', border: '#FDE68A', dot: '#F59E0B' },
  TESTING: { label: 'Testing', bg: '#DBEAFE', color: '#2563EB', border: '#BFDBFE', dot: '#3B82F6' },
  CLOSED: { label: 'Closed', bg: '#DCFCE7', color: '#16A34A', border: '#BBF7D0', dot: '#22C55E' },
  REOPENED: { label: 'Reopened', bg: '#FEE2E2', color: '#DC2626', border: '#FECACA', dot: '#EF4444' },
};

export const PRIORITY = {
  LOW: { bg: '#f5f5f5', color: 'var(--text-2nd-color)', label: 'Low' },
  MEDIUM: { bg: '#E0E7FF', color: '#6366F1', label: 'Medium' },
  HIGH: { bg: '#FEE2E2', color: '#DC2626', label: 'High' },
  CRITICAL: { bg: '#FEF2F2', color: '#DC2626', label: 'Critical' },
};

export const slimScroll = {
  '&::-webkit-scrollbar': {
    width: '6px',
    height: '6px',
  },
  '&::-webkit-scrollbar-track': {
    bgcolor: '#fafafa',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#e0e0e0',
    borderRadius: '10px',
    border: '1px solid #fafafa',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#d0d0d0',
  },
  scrollbarWidth: 'thin',
  scrollbarColor: '#e0e0e0 #fafafa',
};

export function formatDateTime(d) {
  return formatDateTimeFromGlobal(d);
}

export function formatDate(d) {
  return formatDateFromGlobal(d);
}
