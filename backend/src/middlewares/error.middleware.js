function errorMiddleware(error, _request, response, _next) {
  if (response.headersSent) {
    return;
  }

  const status = Number.isInteger(error.status) ? error.status : 500;
  response.status(status).json({
    message: status === 500 ? "Internal server error." : error.message,
  });
}

module.exports = errorMiddleware;