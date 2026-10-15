function createNotImplementedHandler(resource) {
  return (_request, response) => {
    response.status(501).json({
      message: `${resource} is not implemented yet.`,
    });
  };
}

module.exports = createNotImplementedHandler;