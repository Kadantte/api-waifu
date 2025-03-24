import createError from 'http-errors';
import uwuify from 'owoify-js';
import Stats from '../../../models/schemas/Stat.js';
const generateText = uwuify.default;

/**
 * Route handler to get UwUified text.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const getUwuifyText = async (req, res, next) => {
  try {
    // Extract text from query parameters
    const { text } = req.query;

    // Validate text input
    if (!text) {
      throw createError(400, 'Invalid text input.');
    }

    // UwUify the text and send the response
    res.status(200).json({
      text: generateText(text, 'uwu'),
    });

    // Increment the UwUify counter in the stats
  } catch (error) {
    // Increment failed requests counter in the stats and pass the error to the next middleware

    next(error);
  }
};

export default getUwuifyText;
