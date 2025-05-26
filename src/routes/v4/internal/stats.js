import { Router } from 'express';
import {
  getPopularEndpoints,
  getTopEndpointsToday,
  getMonthlyRequests,
  getUsersStat,
} from '../../../controllers/v4/internal/stats.js';
import createRateLimiter from '../../../middlewares/rateLimit.js';

const router = Router();

router
  .route('/')
  /**
   * @api {get} v4/stats Get Statistics
   * @apiDescription Get overall system statistics.
   * @apiName getStats
   * @apiGroup Statistics
   * @apiPermission user
   *
   * @apiHeader {String} Authorization System access token.
   *
   * @apiSuccess {Object} stats System statistics or status.
   *
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can access the data.
   * @apiError (Forbidden 403) Forbidden Only authorized users can access the data.
   * @apiError (Too Many Requests 429) TooManyRequests The client has exceeded the allowed number of requests within the time window.
   * @apiError (Internal Server Error 500) InternalServerError An error occurred while processing the request.
   */
  .get(createRateLimiter(), getPopularEndpoints);

router
  .route('/popular')
  /**
   * @api {get} v4/stats/popular Get Most Popular Endpoints
   * @apiDescription Retrieve the most requested API endpoints.
   * @apiName getPopularEndpoints
   * @apiGroup Statistics
   * @apiPermission user
   *
   * @apiHeader {String} Authorization System access token.
   *
   * @apiQuery {String} [top] Range for top endpoints (e.g., `?top=5`, `?top=2-10`).
   *
   * @apiSuccess {Object} popular_endpoints List of most requested API endpoints.
   */
  .get(createRateLimiter(), getPopularEndpoints);

router
  .route('/today')
  /**
   * @api {get} v4/stats/today Get Top Endpoints for Today
   * @apiDescription Retrieve today's most requested API endpoints.
   * @apiName getTopEndpointsToday
   * @apiGroup Statistics
   * @apiPermission user
   *
   * @apiHeader {String} Authorization System access token.
   *
   * @apiQuery {String} [top] Range for top endpoints (e.g., `?top=5`, `?top=2-10`).
   *
   * @apiSuccess {Object} top_endpoints_today List of today's most requested API endpoints.
   */
  .get(createRateLimiter(), getTopEndpointsToday);

router
  .route('/monthly')
  /**
   * @api {get} v4/stats/monthly Get Monthly Request Data
   * @apiDescription Retrieve system request statistics for the last 5 months.
   * @apiName getMonthlyRequests
   * @apiGroup Statistics
   * @apiPermission user
   *
   * @apiHeader {String} Authorization System access token.
   *
   * @apiSuccess {Object} last_5_months Request count per month for the last 5 months.
   */
  .get(createRateLimiter(), getMonthlyRequests);

router
  .route('/users')
  /**
   * @api {get} v4/users Get User Statistics
   * @apiDescription Retrieve user statistics, including request quotas.
   * @apiName getUsersStat
   * @apiGroup Users
   * @apiPermission user
   *
   * @apiHeader {String} Authorization System access token.
   *
   * @apiSuccess {Object[]} users List of users with request quotas.
   * @apiSuccess {String} users.username The username (or "Anonymous" if missing).
   * @apiSuccess {Number} users.req_quota The request quota of the user.
   */
  .get(createRateLimiter(), getUsersStat);

// Export the router
export default router;
