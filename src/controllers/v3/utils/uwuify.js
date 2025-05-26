import createError from 'http-errors';
import uvuify from 'owoify-js';
import Stats from '../../../models/schemas/Stat.js';

const getOwofiyText = async (req, res, next) => {
  try {
    const { text } = req.query;

    if (!text) {
      throw createError(404, 'Invalid text input.');
    }

    res.status(200).json({
      text: uvuify(text),
    });
  } catch (error) {
    next(error);
  }
};

export default getOwofiyText;
