import createError from 'http-errors';
import uwuify from 'owoify-js';
import Stats from '../../../models/schemas/Stat.js';

const getOwofiyText = async (req, res, next) => {
  try {
    const { text } = req.query;

    if (!text) {
      return next(createError(404, 'Invalid text input.'));
    }

    res.status(200).json({
      text: uwuify(text),
    });
  } catch (error) {
    return next(error);
  }
};

export default getOwofiyText;
