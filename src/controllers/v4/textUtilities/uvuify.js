import createError from 'http-errors';
import uvuify from 'owoify-js';
import Stats from '../../../models/schemas/Stat.js';
const generateText = uvuify.default;

/**
 * Route handler to get UvUified text.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const getUvuifyText = async (req, res, next) => {
  try {
    // Extract text from query parameters
    const { text } = req.query;

    // Validate text input
    if (!text) {
      return next(createError(400, 'Invalid text input.'));
    }

    // UvUify the text and send the response
    res.status(200).json({
      text: generateText(text, 'uvu'),
    });

    // Increment the UvUify counter in the stats
  } catch (error) {
    // Increment failed requests counter in the stats and pass the error to the next middleware

    return next(error);
  }
};

export default getUvuifyText;
