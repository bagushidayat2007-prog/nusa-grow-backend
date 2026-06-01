/**
 * Format response success
 */
const responseSuccess = (res, { message = 'Success', data = null, statusCode = 200 }) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Format response error
 */
const responseError = (res, statusCode = 500, message = 'Internal server error', errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString()
  });
};

/**
 * Format response paginated
 */
const responsePaginated = (res, { data, pagination, message = 'Success', statusCode = 200 }) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  responseSuccess,
  responseError,
  responsePaginated
};