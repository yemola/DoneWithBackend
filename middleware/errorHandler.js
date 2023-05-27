const Sentry = require("@sentry/node");

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err); // Log the error for debugging purposes
  Sentry.captureException(err); // Capture the exception with Sentry
  res.status(500).json({ message: "Internal server error" });
};

module.exports = errorHandler;
