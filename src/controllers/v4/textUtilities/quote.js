import createError from 'http-errors';
import Quotes from '../../../models/schemas/Quote.js';
import Stats from '../../../models/schemas/Stat.js';

/**
 * Gets a random anime quote with optional character filter and updates system statistics.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const getQuote = async (req, res, next) => {
  try {
    /**
     * Extract character parameter from the query
     * @type {string}
     */
    const { character, anime } = req.query;

    /**
     * Create a filter object based on the optional character parameter
     * @type {Object}
     */
    /**
     * Create a filter object based on the optional character and anime parameters
     * @type {Object}
     */
    const filter = {};
    if (character) {
      filter.author = { $regex: character, $options: 'i' };
    }
    if (anime) {
      filter.anime = { $regex: anime, $options: 'i' };
    }
    /**
     * Aggregate to match the filter, select a random quote, and project excluding version field
     * @type {Array<Object>}
     */
    const [result] = await Quotes.aggregate([
      { $match: filter }, // Apply filters (if any)
      { $sample: { size: 1 } }, // Select a random document from the results
      { $project: { __v: 0 } },
    ]);

    /**
     * If no quote is found, return a 404 error
     * @type {Object}
     */
    if (!result) {
      return next(createError(404, 'Could not find any matching Quote'));
    }

    /**
     * Respond with the random quote
     * @type {Object}
     */
    return res.status(200).json(result);

    /**
     * Update system statistics for quotes
     * @type {Object}
     */
  } catch (error) {
    /**
     * Update system statistics for failed requests
     * @type {Object}
     */

    return next(error);
  }
};

export default getQuote;
