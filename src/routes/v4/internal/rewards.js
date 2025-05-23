import { Router } from 'express';
import { createReward, getRewards } from '../../../controllers/v4/internal/rewards.js';
import createRateLimiter from '../../../middlewares/rateLimit.js';

const router = Router();

router
  .route('/')
  /**
   * @api {get} v4/rewards Get All Rewards
   * @apiDescription Fetch all available rewards (coupons, vouchers, giftcards).
   * @apiName getRewards
   * @apiGroup Rewards
   * @apiPermission internal
   *
   * @apiHeader {String} Key Internal access token
   *
   * @apiSuccess {Array} rewards List of available rewards.
   * @apiError (Unauthorized 401) Unauthorized Invalid or missing access key.
   * @apiError (Internal Server Error 500) InternalServerError An error occurred while fetching rewards.
   */
  .get(createRateLimiter(), getRewards)
  /**
   * @api {post} v4/rewards Create a New Reward
   * @apiDescription Create a new reward entry for use as a giftcard, coupon, or voucher.
   * @apiName createReward
   * @apiGroup Rewards
   * @apiPermission admin
   *
   * @apiHeader {String} Key Internal access token
   *
   * @apiBody {String} _id Unique ID of the reward.
   * @apiBody {String} type Reward type (coupon, giftcard, voucher).
   * @apiBody {Object} discount Discount details.
   * @apiBody {Object} appliesTo (optional) Role/plan filters.
   * @apiBody {Object} usage (optional) Max usage/conditions.
   * @apiBody {Date} validFrom (optional) Validity start.
   * @apiBody {Date} validUntil (optional) Validity end.
   * @apiBody {Boolean} isActive Whether reward is currently active.
   *
   * @apiSuccess {Object} reward Created reward object.
   * @apiError (Bad Request 400) BadRequest Missing or invalid fields.
   * @apiError (Conflict 409) Conflict Reward with this ID already exists.
   * @apiError (Unauthorized 401) Unauthorized Invalid or missing access key.
   * @apiError (Internal Server Error 500) InternalServerError An error occurred while creating reward.
   */
  .post(createRateLimiter(), createReward);

router
  .route('/:id')
  /**
   * @api {get} v4/rewards/:id Get Specific Reward
   * @apiDescription Fetch a specific reward by its unique ID.
   * @apiName getSingleReward
   * @apiGroup Rewards
   * @apiPermission internal
   *
   * @apiHeader {String} Key Internal access token
   *
   * @apiParam {String} id Reward's unique identifier.
   *
   * @apiSuccess {Object} reward Reward details.
   * @apiError (Not Found 404) NotFound Reward with the given ID does not exist.
   * @apiError (Unauthorized 401) Unauthorized Invalid or missing access key.
   * @apiError (Internal Server Error 500) InternalServerError An error occurred while fetching reward.
   */
  .get(createRateLimiter(), getRewards);

router.route('/redeem');
/**
 * @api {post} v4/rewards/redeem Redeem a Reward
 * @apiDescription Redeem a reward using its unique ID.
 * @apiName redeemReward
 * @apiGroup Rewards
 * @apiPermission user
 *
 * @apiHeader {String} Key Internal access token
 *
 * @apiBody {String} id Unique ID of the reward to redeem.
 *
 * @apiSuccess {Object} result Redemption result.
 * @apiError (Bad Request 400) BadRequest Missing or invalid fields.
 * @apiError (Not Found 404) NotFound Reward with the given ID does not exist.
 * @apiError (Unauthorized 401) Unauthorized Invalid or missing access key.
 * @apiError (Internal Server Error 500) InternalServerError An error occurred while redeeming reward.
 */

export default router;
