const config = require('../../server/config');

const LOCAL_HOSTNAMES = (config.LOCAL_HOSTNAMES || "localhost,nzen,bugtracker.web").split(',');
const REPORT_ENDPOINT = config.REPORT_ENDPOINT || "/api/report";
const UPLOAD_ENDPOINT = config.UPLOAD_ENDPOINT || "/api/upload";
const REMOVE_FILE_ENDPOINT = config.REMOVE_FILE_ENDPOINT || "/api/removefile";
const API_VERSION = config.API_VERSION || "v1";
const API_ENVIRONMENT = config.API_ENVIRONMENT || "live";

const DOMAINS = {
  local: config.LOCAL_DOMAIN || "http://newnextjs.web",
  live: config.LIVE_DOMAIN || "https://apilx.optigoapps.com",
};

// Get current domain based on environment
const getCurrentDomain = () => {
  if (typeof window !== 'undefined') {
    const isLocal = LOCAL_HOSTNAMES.includes(window.location.hostname);
    if (isLocal) {
      return DOMAINS.local;
    }
  }
  return DOMAINS[API_ENVIRONMENT] || DOMAINS.live;
};

// Build API URLs
const buildApiUrl = (endpoint) => {
  return getCurrentDomain() + endpoint;
};

export const APIURL = buildApiUrl(REPORT_ENDPOINT);
export const UPLOAD_URL = buildApiUrl(UPLOAD_ENDPOINT);
export const REMOVE_FILE_URL = buildApiUrl(REMOVE_FILE_ENDPOINT);

// Utility function to get AuthData from both localStorage and sessionStorage
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

const getAuthData = () => {
  if (typeof window === 'undefined') return null;
  try {
    const authData = sessionStorage.getItem("AuthqueryParams");
    return authData ? JSON.parse(authData) : null;
  } catch (error) {
    console.error("Error parsing AuthData:", error);
    return null;
  }
};

export const getHeaders = (init = {}) => {
  const { version = API_VERSION, token = "", sp = "6" } = init;
  const AuthData = getAuthData();

  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'YearCode': AuthData?.yc ?? "",
    'version': version,
    'sv': AuthData?.sv ?? "0",
    'sp': sp,
    'Content-Type': 'application/json'
  };
};
