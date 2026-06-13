import { createTheme, Typography } from "@mui/material";

export const STATUS = {
  OPEN: { label: 'Open', bg: '#F8FAFC', color: '#6D6B77', border: '#e0e0e0', dot: '#7D7f85' },
  IN_PROGRESS: { label: 'In Progress', bg: '#EFF6FF', color: '#7367f0', border: '#DEDAFE', dot: '#7367f0' },
  TESTING: { label: 'Testing', bg: '#FFFBEB', color: '#D97706', border: '#FDE68A', dot: '#F59E0B' },
  CLOSED: { label: 'Closed', bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0', dot: '#22C55E' },
  REOPENED: { label: 'Reopened', bg: '#FFF1F2', color: '#E11D48', border: '#FECDD3', dot: '#F43F5E' },
};

export const PRIORITY = {
  LOW: { bg: '#F8FAFC', color: '#6D6B77', label: 'Low' },
  MEDIUM: { bg: '#EFF6FF', color: '#7367f0', label: 'Medium' },
  HIGH: { bg: '#FFFBEB', color: '#D97706', label: 'High' },
  CRITICAL: { bg: '#FFF1F2', color: '#E11D48', label: 'Critical' },
};

/**
 * Parses a date value safely.
 * @param {Date|string|number} value - Date input value
 * @returns {Date|null} Parsed date or null when invalid
 */
export const parseDateValue = (value) => {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

/**
 * Formats date time to human readable format
 * @param {Date|string} d - Date object or string
 * @param {object} options - Intl formatting options
 * @returns {string} Formatted date time
 */
export const formatDateTime = (d, options = {}) => {
  const date = parseDateValue(d);
  if (!date) return '';
  const { locale = 'en-US' } = options;
  const timeZone = 'UTC';
  const now = new Date();
  const dateDay = date.toLocaleDateString(locale, { timeZone });
  const todayDay = now.toLocaleDateString(locale, { timeZone });
  const yesterday = new Date(now);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayDay = yesterday.toLocaleDateString(locale, { timeZone });
  const time = date.toLocaleTimeString(locale, {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  if (dateDay === todayDay) {
    return `Today at ${time}`;
  }
  if (dateDay === yesterdayDay) {
    return `Yesterday at ${time}`;
  }
  return `${date.toLocaleDateString(locale, {
    timeZone,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })} · ${time}`;
};

/**
 * Formats date to simple format (no time)
 * @param {Date|string} d - Date object or string
 * @returns {string} Formatted date
 */
export const formatDate = (d) => {
  if (!d || d === 'Not set') return 'Not set';
  const date = parseDateValue(d);
  if (!date || date.getFullYear() === 1900) return 'Not set';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatCommentDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);

  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC', // remove if you want IST
  });
};

/**
 * Generates a consistent background and text color for an avatar based on a string (e.g., name or email).
 * @param {string} name - The name or identifier to generate a color for.
 * @returns {object} - Object containing bgColor and textColor.
 */
export const getAvatarColor = (name = '') => {
  const colors = [
    { bg: '#EEF2FF', text: '#4F46E5' }, // Indigo
    { bg: '#F0FDF4', text: '#16A34A' }, // Green
    { bg: '#FEF2F2', text: '#DC2626' }, // Red
    { bg: '#FFFBEB', text: '#D97706' }, // Amber
    { bg: '#FAF5FF', text: '#9333EA' }, // Purple
    { bg: '#F0FDFA', text: '#0D9488' }, // Teal
    { bg: '#EFF6FF', text: '#2563EB' }, // Blue
    { bg: '#FFF7ED', text: '#EA580C' }, // Orange
  ];

  if (!name || typeof name !== 'string') return colors[0];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * Returns initials from a name (e.g., "John Doe" -> "JD").
 * @param {string} name 
 * @returns {string}
 */
export const getInitials = (name = '') => {
  if (!name || typeof name !== 'string') return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

/**
 * Handles image loading errors by setting a fallback "no-media" image.
 * Ensures proper error handling and prevents infinite loops.
 * @param {Event} event - The error event from the img tag.
 */
export const handleImageError = (event) => {
  const target = event.target;

  // Prevent infinite loop if already showing fallback
  if (target.src.includes('no-media.jpg')) {
    target.onerror = null;
    return;
  }

  // Set fallback image
  target.src = '/no-media.jpg';
  target.alt = 'Media unavailable';

  // Add styling to ensure fallback displays properly
  target.style.objectFit = 'contain';
  target.style.padding = '8px';

  // Prevent infinite loop if fallback image also fails
  target.onerror = null;
};

/**
 * Validates if an image URL is accessible and valid.
 * @param {string} url - The image URL to validate.
 * @returns {Promise<boolean>} - Returns true if image is valid, false otherwise.
 */
export const isValidImageUrl = async (url) => {
  if (!url || typeof url !== 'string') return false;

  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return response.ok && contentType && contentType.startsWith('image/');
  } catch (error) {
    console.warn('Image validation failed:', url, error);
    return false;
  }
};

/**
 * Gets a safe image source with fallback.
 * @param {string} url - The image URL.
 * @param {string} fallback - The fallback URL (default: '/no-media.svg').
 * @returns {string} - Returns the URL or fallback.
 */
export const getSafeImageSrc = (url, fallback = '/no-media.svg') => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return fallback;
  }
  return url;
};

export const colors = [
  "#FF5722", "#4CAF50", "#2196F3", "#FFC107", "#E91E63", "#9C27B0", "#3F51B5", "#00BCD4",
  "#FF9800", "#9E9E9E", "#795548", "#607D8B", "#8BC34A", "#FFEB3B", "#FF4081", "#673AB7",
  "#ff7f50", "#F44336", "#3F51B5", "#CDDC39", "#03A9F4", "#9C27B0", "#FF1744", "#00E5FF",
  "#9E9E9E", "#4CAF50", "#00BCD4", "#8B4513", "#6A5ACD", "#F08080", "#32CD32", "#FF6347"
];

export const getRandomAvatarColor = (name) => {
  if (!name || typeof name !== 'string') return colors[0];
  const charSum = name
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[charSum % colors.length];
};

// Common TextField style properties
export const commonTextFieldProps = {
  fullWidth: true,
  size: "small",
  className: "textfieldsClass",
};

export const ImageUrl = (data) => {
  if (typeof sessionStorage === 'undefined') return null;
  const init = JSON.parse(sessionStorage.getItem('taskInit'));
  if (data && init) {
    const url = `${init.url_path}/${init.ukey}/${data.empphoto}`;
    return url;
  }
  return null;
};


export const statusColors = {
  "initialized": {
    color: "#1e88e5", // Blue - just added
    backgroundColor: "#bbdefb",
  },
  "completed": {
    color: "#388e3c", // Green - task done
    backgroundColor: "#dcedc8",
  },
  "running": {
    color: "#0277bd", // Blue - active
    backgroundColor: "#b3e5fc",
  },
  "meetings-srd": {
    color: "#3949ab", // Indigo - meeting-related
    backgroundColor: "#c5cae9",
  },
  "started": {
    color: "#6a1b9a", // Purple - process started
    backgroundColor: "#e1bee7",
  },
  "prototype": {
    color: "#00796b", // Teal - design phase
    backgroundColor: "#b2dfdb",
  },
  "selected": {
    color: "#8e24aa", // Purple - shortlisted
    backgroundColor: "#f3e5f5",
  },
  "srs": {
    color: "#5d4037", // Brown - documentation
    backgroundColor: "#d7ccc8",
  },
  "pending": {
    color: "#ffa000", // Amber - waiting
    backgroundColor: "#ffecb3",
  },
  "dev": {
    color: "#1976d2", // Blue - development
    backgroundColor: "#bbdefb",
  },
  "hold": {
    color: "#ef6c00", // Orange - paused
    backgroundColor: "#ffe0b2",
  },
  "beta-run uat": {
    color: "#0288d1", // Light Blue - testing
    backgroundColor: "#b3e5fc",
  },
  "hold-on-challenge": {
    color: "#f57c00", // Deep orange - challenge
    backgroundColor: "#ffe0b2",
  },
  "delivery": {
    color: "#43a047", // Green - deliverable
    backgroundColor: "#c8e6c9",
  },
  "cancelled": {
    color: "#d32f2f", // Red - removed  
    backgroundColor: "#ffcdd2",
  },
  "reschedule": {
    color: "#00796b", // Teal - design phase
    backgroundColor: "#b2dfdb",
  },
  "delayed": {
    color: "#d32f2f", // Red - removed  
    backgroundColor: "#ffcdd2",
  },
  "feedback": {
    color: "#3949ab", // Indigo - awaiting response
    backgroundColor: "#c5cae9",
  },
  "New": {
    color: "#6D6B77",
    backgroundColor: "#fafafa",
  },
  "Assigned": {
    color: "#6D6B77",
    backgroundColor: "#fafafa",
  },
  "In Progress": {
    color: "#1e88e5", // Blue - in progress
    backgroundColor: "#bbdefb",
  },
  "Fixed": {
    color: "#43a047", // Green - fixed
    backgroundColor: "#c8e6c9",
  },
  "Ready For Test": {
    color: "#6a1b9a", // Purple - ready for test
    backgroundColor: "#e1bee7",
  },
  "Verified": {
    color: "#CFE8E1", // Purple - verify
    backgroundColor: "#2F7D6D",
  },
  "Closed": {
    color: "#616161", // Gray - closed
    backgroundColor: "#eeeeee",
  },
  "Reopen": {
    color: "#f57c00", // Deep orange - challenge
    backgroundColor: "#ffe0b2",
  },
  "Rejected": {
    color: "#d32f2f", // Red - rejected
    backgroundColor: "#ffcdd2",
  }
};

export const priorityColors = {
  low: {
    color: "#4caf50",
    backgroundColor: "#e8f5e9",
  },
  medium: {
    color: "#ff9800",
    backgroundColor: "#fff3e0",
  },
  high: {
    color: "#f44336",
    backgroundColor: "#ffebee",
  },
  'very high': {
    color: "#f44336",
    backgroundColor: "#ffebee",
  },
  urgent: {
    color: "#d32f2f",
    backgroundColor: "#ffcccb",
  },
  critical: {
    color: "#ffffff",
    backgroundColor: "#b71c1c",
  },
  normal: {
    color: "#212529",
    bgcolor: "#e2e6ea"
  },
};

/**
 * Status Badge React Component
 * @param {string} status - Bug status
 * @returns {JSX.Element} Status badge component
 */
export const StatusBadge = ({ status }) => {
  // If status is already a normalized object, use it directly
  if (status && typeof status === 'object' && status.label) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: `${status.color}0A`,
        border: `1px solid ${status.color}20`,
        borderRadius: '8px',
        padding: '4px 10px',
        boxShadow: `0 1px 3px ${status.color}10`,
      }}>
        <div style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          backgroundColor: status.color,
          boxShadow: `0 0 0 3px ${status.color}15`
        }} />
        <span style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          color: status.color,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          lineHeight: 1.3
        }}>
          {status.label?.replace(/_/g, ' ')}
        </span>
      </div>
    );
  }

  // Fallback for legacy string values
  const s = STATUS[status] || STATUS.OPEN;
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      backgroundColor: `${s.color}0A`,
      border: `1px solid ${s.color}20`,
      borderRadius: '8px',
      padding: '4px 10px',
      boxShadow: `0 1px 3px ${s.color}10`,
    }}>
      <div style={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        backgroundColor: s.color,
        boxShadow: `0 0 0 3px ${s.color}15`
      }} />
      <span style={{
        fontSize: '0.72rem',
        fontWeight: 700,
        color: s.color,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        lineHeight: 1.3
      }}>
        {String(status || '').replace(/_/g, ' ')}
      </span>
    </div>
  );
};

/**
 * Priority Badge React Component
 * @param {string} priority - Bug priority
 * @returns {JSX.Element} Priority badge component
 */
export const PriorityBadge = ({ priority }) => {
  const p = PRIORITY[priority] || PRIORITY.MEDIUM;
  const color = p.color;
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      backgroundColor: `${color}0A`,
      border: `1px solid ${color}20`,
      borderRadius: '8px',
      padding: '4px 10px',
      boxShadow: `0 1px 3px ${color}10`,
    }}>
      <span style={{
        fontSize: '0.72rem',
        fontWeight: 800,
        color: color,
        lineHeight: 1.3,
        letterSpacing: '0.04em'
      }}>
        {p.label}
      </span>
    </div>
  );
};


/**
 * Generates export filename in format: [initials]_[taskno]_[date].[extension]
 * Example: vs_tt001_06052026.png
 * @param {string} username - Full username (e.g., "Vidhi Shah")
 * @param {string} taskNo - Task number (e.g., "TT001")
 * @param {string} extension - File extension (e.g., "png", "svg")
 * @returns {string} Formatted filename
 */
export const generateExportFileName = (username = '', taskNo = '', extension = 'png') => {
  const initials = getInitials(username).toLowerCase();
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  const dateStr = `${day}${month}${year}`;
  const cleanTaskNo = taskNo ? taskNo.toLowerCase().replace(/[^a-z0-9]/g, '') : 'task';
  return `${initials}_${cleanTaskNo}_${dateStr}.${extension}`;
};

//Selectmenu custom styles
export const commonSelectProps = {
  select: true,
  fullWidth: true,
  size: "small",
  sx: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      "& fieldset": {
        borderRadius: "8px",
      },
    },
  },
  SelectProps: {
    MenuProps: {
      PaperProps: {
        sx: {
          borderRadius: "8px",
          "& .MuiMenuItem-root": {
            fontFamily: '"Public Sans", sans-serif',
            color: "#444050",
            margin: "5px 10px",
            "&:hover": {
              borderRadius: "8px",
              backgroundColor: "#7367f0",
              color: "#fff",
            },
            "&.Mui-selected": {
              backgroundColor: "#80808033",
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "#7367f0",
                color: "#fff",
              },
            },
          },
        },
      },
    },
  },
};


export const bugstatusColor = {
  "new": {
    "bgColor": "#CFE8E1",
    "textColor": "#2F7D6D"
  },
  "assigned": {
    "bgColor": "#F6E2C8",
    "textColor": "#B06A1B"
  },
  "in_progress": {
    "bgColor": "#DCD9F8",
    "textColor": "#5A54B3"
  },
  "fixed": {
    "bgColor": "#DCD9F8",
    "textColor": "#5A54B3"
  },
  "ready_for_test": {
    "bgColor": "#CFE8E1",
    "textColor": "#2F7D6D"
  },
  "verified": {
    "bgColor": "#CFE8E1",
    "textColor": "#2F7D6D"
  },
  "closed": {
    "bgColor": "#E5E2DC",
    "textColor": "#6E6A63"
  },
  "reopened": {
    "bgColor": "#CFE8E1",
    "textColor": "#2F7D6D"
  },
  "deferred": {
    "bgColor": "#F6E2C8",
    "textColor": "#B06A1B"
  },
  "rejected": {
    "bgColor": "#E5E2DC",
    "textColor": "#6E6A63"
  }
}


export const Datetheme = createTheme({
  palette: {
    primary: {
      main: "#7367f0",
    },
    secondary: {
      main: "#f50057",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    color: "#fff !important",
    fontFamily: '"Public Sans", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 1,
          boxShadow: "rgba(90, 90, 90, 0.1) 0px 4px 12px",
          border: "1px solid rgba(90, 90, 90, 0.1)",
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent", // Almost invisible track
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0, 0, 0, 0.1)", // Very light thumb
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.15)", // Slightly visible on hover
          },
          "&::-webkit-scrollbar-thumb:active": {
            backgroundColor: "rgba(0, 0, 0, 0.2)", // Slightly darker when dragging
            color: "#fff",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "capitalize",
        },
        containedPrimary: {
          background: "linear-gradient(270deg, rgba(115, 103, 240, 0.7) 0%, #7367f0 100%)", // Button color
          "&:hover": {
            background: "linear-gradient(270deg, rgba(115, 103, 240, 0.7) 0%, #7367f0 100%)",
          },
          color: "white",
        },
        textSecondary: {
          background: "#ebebed", // Button color
          "&:hover": {
            backgroundColor: "#ebebed",
          },
          color: "#7D7f85",
        }
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Applies border radius to the entire TextField
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#d1d5db", // Default border color (gray)
            },
            "&:hover fieldset": {
              borderColor: "black", // Darker border on hover
            },
            "&.Mui-focused fieldset": {
              borderColor: "#685dd8", // Default MUI blue when focused
            },
            "&.Mui-disabled fieldset": {
              borderColor: "#d1d5db", // Light gray when disabled
            },
            "&.Mui-error fieldset": {
              borderColor: "#d32f2f", // Red border when there's an error
            },
          },
          "& .MuiInputBase-input": {
            padding: "10px 14px", // Padding inside the input field
          },
          "& .MuiInputLabel-root": {
            color: "gray", // Default label color
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#685dd8", // Label color when focused
          },
          "& .MuiInputLabel-root.Mui-error": {
            color: "#d32f2f", // Label color when there's an error
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          maxHeight: "200px", // Fixed height for the dropdown list
          overflowY: "auto", // Enable vertical scrolling if content exceeds height
          zIndex: 1300, // Ensure proper z-index for overlay elements
        },
      },
    },
  },
});

export function SectionLabel({ children }) {
  return (
    <Typography sx={{
      fontSize: '0.72rem',
      fontWeight: 500,
      color: 'var(-text-2nd-color)',
      letterSpacing: '0.08em',
      textTransform: 'uppercase'
    }}>
      {children}
    </Typography>
  );
}


export const getClientIpAddress = async () => {
  try {
    const cachedIp = sessionStorage.getItem("clientIpAddress");
    if (cachedIp) return cachedIp;

    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    const ip = data?.ip || "";

    sessionStorage.setItem("clientIpAddress", ip);
    return ip;
  } catch (error) {
    console.error("Error fetching IP address:", error);
    return "";
  }
};
