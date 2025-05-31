// src/lib/utils/response-utils.js

/**
 * Create a standardized success response
 * 
 * @param {any} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {object} Lambda response object
 */
function successResponse(data, statusCode = 200) {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        data,
        timestamp: new Date().toISOString()
      })
    };
  }
  
  /**
   * Create a standardized error response
   * 
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {any} details - Additional error details (optional)
   * @returns {object} Lambda response object
   */
  function errorResponse(statusCode, message, details = null) {
    const response = {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify({
        success: false,
        error: {
          message,
          code: statusCode,
          timestamp: new Date().toISOString()
        }
      })
    };
  
    // Add details if provided
    if (details) {
      const body = JSON.parse(response.body);
      body.error.details = details;
      response.body = JSON.stringify(body);
    }
  
    return response;
  }
  
  /**
   * Handle CORS preflight requests
   * 
   * @returns {object} Lambda response object for OPTIONS requests
   */
  function corsResponse() {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Max-Age': '86400'
      },
      body: ''
    };
  }
  
  /**
   * Validate and parse JSON body from Lambda event
   * 
   * @param {object} event - Lambda event object
   * @returns {object} Parsed JSON or empty object
   */
  function parseJsonBody(event) {
    try {
      return JSON.parse(event.body || '{}');
    } catch (error) {
      throw new Error('Invalid JSON in request body');
    }
  }
  
  /**
   * Extract path parameters safely
   * 
   * @param {object} event - Lambda event object
   * @param {string} paramName - Parameter name to extract
   * @returns {string|null} Parameter value or null
   */
  function getPathParameter(event, paramName) {
    return event.pathParameters?.[paramName] || null;
  }
  
  /**
   * Extract query parameters safely
   * 
   * @param {object} event - Lambda event object
   * @param {string} paramName - Parameter name to extract
   * @returns {string|null} Parameter value or null
   */
  function getQueryParameter(event, paramName) {
    return event.queryStringParameters?.[paramName] || null;
  }
  
  /**
   * Log request details for debugging
   * 
   * @param {object} event - Lambda event object
   * @param {string} handlerName - Name of the handler function
   */
  function logRequest(event, handlerName) {
    console.log(`[${handlerName}] Request:`, {
      httpMethod: event.httpMethod,
      path: event.path,
      pathParameters: event.pathParameters,
      queryStringParameters: event.queryStringParameters,
      headers: event.headers,
      bodyLength: event.body?.length || 0
    });
  }
  
  module.exports = {
    successResponse,
    errorResponse,
    corsResponse,
    parseJsonBody,
    getPathParameter,
    getQueryParameter,
    logRequest
  };