// Server Configuration
// This file replaces the .env file for configuration management

const config = {
  // Domain Configuration
  LOCAL_DOMAIN: 'http://newnextjs.web',
  LIVE_DOMAIN: 'https://apilx.optigoapps.com',

  // API Endpoints
  REPORT_ENDPOINT: '/api/report',
  UPLOAD_ENDPOINT: '/api/upload',
  REMOVE_FILE_ENDPOINT: '/api/removefile',

  // API Version
  API_VERSION: 'v6',

  // Local Development Hostnames (comma-separated)
  LOCAL_HOSTNAMES: 'nzen,bugtracker.web',

  // Default API Environment (testing, live, backup_live)
  API_ENVIRONMENT: 'live',

  // App Version
  APP_VERSION: 'bugtracker_V1_27042026'
};

module.exports = config;
