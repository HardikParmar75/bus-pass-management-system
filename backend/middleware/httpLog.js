const logger = require('../utils/logger.js');

// HTTP request logging middleware
const httpLog = (req, res, next) => {
  const startTime = Date.now();

  // Store the original send function
  const originalSend = res.send;

  // Override the send function to log when response is sent
  res.send = function (data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    logger.http(req.method, req.originalUrl, statusCode, duration);

    // Log request body for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      if (req.body && Object.keys(req.body).length > 0) {
        logger.debug(`Request body:`, req.body);
      }
    }

    // Call the original send function
    res.send = originalSend;
    return originalSend.call(this, data);
  };

  next();
};

module.exports = httpLog;
