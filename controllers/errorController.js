const statusCodes = require("http-status-codes");

module.exports = {
  // Responds with an error page for a "not found" error
  respondSourceNotFound: (req, res) => {
    let errorCode = statusCodes.NOT_FOUND;
    res.status(errorCode);
    res.render(`common/error`, {
      errorCode: errorCode,
      errorMessage: "Sorry, the page you are looking for could not be found.",
      layout: false,
    });
  },
  // Responds with an error page for an internal server error
  respondInternalError: (error, req, res, next) => {
    let errorCode = statusCodes.INTERNAL_SERVER_ERROR;
    res.status(errorCode);
    res.render(`common/error`, {
      layout: false,
      errorCode: errorCode,
      errorMessage:
        "We're sorry, something went wrong on our end. Please try again later.",
    });
  },
};