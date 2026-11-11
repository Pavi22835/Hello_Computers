function errorMiddleware(error, _request, response, _next) {
  if (response.headersSent) {
    return;
  }

  const prismaStatus = {
    P2002: 409,
    P2025: 404,
    P2003: 400,
  }[error.code];
  const status = Number.isInteger(error.status) ? error.status : (prismaStatus || 500);
  if (status >= 500) console.error(error);
  response.status(status).json({
    message: status === 500 ? "Internal server error." :
      (error.code === "P2002" ? "A record with that value already exists." :
        error.code === "P2025" ? "The requested record was not found." :
          error.code === "P2003" ? "This record is referenced by other data." : error.message),
  });
}

module.exports = errorMiddleware;