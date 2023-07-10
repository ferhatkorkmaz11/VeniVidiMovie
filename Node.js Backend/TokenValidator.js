const jwt = require("jsonwebtoken");

// Function to validate the bearer token
function tokenValidator(token) {
  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    return true;
  } catch (error) {
    // Token verification failed
    return false;
  }
}

module.exports = {
  tokenValidator,
};
