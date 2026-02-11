const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logFile = path.join(logsDir, 'app.log');
const errorLogFile = path.join(logsDir, 'error.log');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const getTimestamp = () => {
  return new Date().toISOString();
};

const formatLogMessage = (level, message, data = null) => {
  const timestamp = getTimestamp();
  const baseMessage = `[${timestamp}] [${level}] ${message}`;
  return data ? `${baseMessage} ${JSON.stringify(data)}` : baseMessage;
};

const logger = {
  // Info level logging
  info: (message, data = null) => {
    const logMessage = formatLogMessage('INFO', message, data);
    console.log(`${colors.blue}${logMessage}${colors.reset}`);
    fs.appendFileSync(logFile, logMessage + '\n');
  },

  // Warning level logging
  warn: (message, data = null) => {
    const logMessage = formatLogMessage('WARN', message, data);
    console.log(`${colors.yellow}${logMessage}${colors.reset}`);
    fs.appendFileSync(logFile, logMessage + '\n');
  },

  // Error level logging
  error: (message, data = null) => {
    const logMessage = formatLogMessage('ERROR', message, data);
    console.error(`${colors.red}${logMessage}${colors.reset}`);
    fs.appendFileSync(logFile, logMessage + '\n');
    fs.appendFileSync(errorLogFile, logMessage + '\n');
  },

  // Success level logging
  success: (message, data = null) => {
    const logMessage = formatLogMessage('SUCCESS', message, data);
    console.log(`${colors.green}${logMessage}${colors.reset}`);
    fs.appendFileSync(logFile, logMessage + '\n');
  },

  // HTTP request logging
  http: (method, url, statusCode, duration = null) => {
    const durationStr = duration ? ` (${duration}ms)` : '';
    const statusColor = statusCode >= 400 ? colors.red : colors.green;
    const message = `${statusColor}${method} ${url} - ${statusCode}${durationStr}${colors.reset}`;
    console.log(message);
    fs.appendFileSync(logFile, `[${getTimestamp()}] [HTTP] ${method} ${url} - ${statusCode}${durationStr}\n`);
  },

  // Debug level logging
  debug: (message, data = null) => {
    const logMessage = formatLogMessage('DEBUG', message, data);
    console.log(`${colors.cyan}${logMessage}${colors.reset}`);
    fs.appendFileSync(logFile, logMessage + '\n');
  },
};

module.exports = logger;
