const ApiError = require('../utils/ApiError');

// Pass an array of roles, e.g. authorize('superAdmin', 'owner')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `User role '${req.user.role}' is not authorized to access this route`)
      );
    }
    next();
  };
};

module.exports = { authorize };
