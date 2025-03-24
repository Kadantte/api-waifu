import createError from 'http-errors';
import Users from '../models/schemas/User.js';
import Stats from '../models/schemas/Stat.js';

/**
 * Middleware for handling user authentication and request validation.
 *
 * @function
 * @param {string} requiredRole - The required role to access the endpoint.
 * @returns {function} - Express middleware function.
 * @throws {Error} Throws an error if there is an issue with authentication or validation.
 *
 * @error {400} Bad Request - User has not provided a valid token.
 * @error {401} Unauthorized - User has provided an invalid API key.
 * @error {403} Forbidden - User is banned, request limit is exhausted, or insufficient privileges.
 */
const authorize = requiredRole => async (req, res, next) => {
  try {
    /**
     * Determine the endpoint based on the request URL.
     */
    const endpoint = getEndpointFromUrl(req.originalUrl);

    /**
     * Check if the requested endpoint is disabled.
     */
    const isEndpointEnabled = await isEndpointEnabledInStats(endpoint);

    if (!isEndpointEnabled) {
      return next(
        createError(
          403,
          `The endpoint '${endpoint}' is currently disabled. Go to https://discord.gg/yyW389c for support.`,
        ),
      );
    }

    /**
     * Extract API key from request headers.
     *
     * @type {string}
     */
    const key = req.headers.authorization;

    /**
     * Handle case where the user has not provided a valid token.
     */
    if (!key) {
      await incrementSystemStats({
        endpoints_requests: 1,
        daily_requests: 1,
      });
      return next(createError(400, 'Bad Request. Go to https://docs.waifu.it for more info.'));
    }

    /**
     * Verify if the API key exists in the database.
     *
     * @type {Object|null}
     */
    const userData = await Users.findOne({ token: key });

    /**
     * Update request quotas and count.
     *
     * @type {Object}
     */
    const updateData = {
      $inc: {
        req_quota: userData && userData.req_quota > 0 ? -1 : 0,
        req_consumed: userData && userData.req_quota > 0 ? 1 : 0,
        req_count: userData ? 1 : 0,
      },
    };
    await Users.updateOne({ token: key }, updateData);

    /**
     * Handle case where the user has not provided a valid token.
     */
    if (!userData) {
      await incrementSystemStats({
        failed_requests: 1,
        endpoints_requests: 1,
        daily_requests: 1,
      });
      return next(createError(401, 'Invalid API key. Go to https://docs.waifu.it for more info.'));
    }

    /**
     * Handle case where the user is banned.
     */
    if (userData.banned) {
      await incrementSystemStats({
        banned_requests: 1,
        endpoints_requests: 1,
        daily_requests: 1,
      });
      return next(createError(403, "You've been banned from using the API."));
    }

    /**
     * Handle case where the request limit is exhausted.
     */
    if (userData.req_quota <= 0) {
      return next(createError(403, "You've exhausted your request limits."));
    }

    /**
     * Check if the user has the required role.
     */
    if (!userData.roles.includes(requiredRole)) {
      return next(createError(403, 'Insufficient privileges to access this endpoint.'));
    }

    /**
     * Log the user request.
     */
    await logUserRequest(userData._id, endpoint);

    /**
     * Increment system stats for successful requests.
     */
    await incrementSystemStats({
      endpoints_requests: 1,
      success_requests: 1,
      daily_requests: 1,
    });

    /**
     * Call the next middleware.
     */
    return next();
  } catch (error) {
    /**
     * Pass any caught errors to the error handler.
     */
    return next(error);
  }
};

/**
 * Helper function to extract endpoint from the request URL.
 *
 * @param {string} url - The request URL.
 * @returns {string} - The extracted endpoint.
 */
const getEndpointFromUrl = url => {
  const urlSegments = url.split('?')[0].split('/').filter(Boolean); // Remove query & empty segments
  const versionIndex = urlSegments.findIndex(segment => /^v\d+$/.test(segment)); // Find "vX" (e.g., v3, v4, v5)

  return versionIndex !== -1 && versionIndex + 1 < urlSegments.length ? urlSegments[versionIndex + 1] : null;
};

/**
 * Helper function to check if the endpoint is enabled in the Stats collection.
 *
 * @param {string} endpoint - The endpoint to check.
 * @returns {Promise<boolean>} - Promise resolving to true if enabled, false otherwise.
 */
const isEndpointEnabledInStats = async endpoint => {
  try {
    // Assuming 'Stats' is the correct model for endpoint settings
    const settings = await Stats.findOne();

    // Handle case where settings are not found
    if (!settings) {
      return false;
    }

    // Check if endpoint exists in settings and isEnabled is defined
    if (settings[endpoint] && typeof settings[endpoint].isEnabled !== 'undefined') {
      return settings[endpoint].isEnabled;
    }

    // Default to true if isEnabled is not defined or endpoint doesn't exist
    return true;
  } catch (error) {
    console.error('Error fetching endpoint settings:', error);
    return true;
  }
};

/**
 * Increment the specified statistics in the system stats collection.
 *
 * @function
 * @param {Object} stats - Statistics to be incremented.
 * @returns {Promise<void>} - Resolves when the stats are updated.
 * @throws {Error} Throws an error if there is an issue with updating statistics.
 */
const incrementSystemStats = async stats => {
  await Stats.findByIdAndUpdate({ _id: 'system' }, { $inc: stats });
};

/**
 * Log the number of requests made by a user to a specific endpoint.
 *
 * @param {string} userId - The ID of the user.
 * @param {string} endpoint - The endpoint being accessed.
 * @returns {Promise<void>} - Resolves when the log is updated.
 */
const logUserRequest = async (userId, endpoint) => {
  try {
    // Find the user and update the request count for the specific endpoint
    await Users.findByIdAndUpdate(
      userId,
      {
        $inc: {
          [`statistics.requests.${endpoint}`]: 1,
        },
      },
      { new: true, upsert: true }, // Create a new document if it doesn't exist
    );
  } catch (error) {
    console.error('Error logging user request:', error);
  }
};

export default authorize;
