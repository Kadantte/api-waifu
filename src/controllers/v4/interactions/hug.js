import createError from 'http-errors';
import Hug from '../../../models/schemas/Hug.js';
import Stats from '../../../models/schemas/Stat.js';

// Get random Anime Hug
const getRandomHug = async (req, res, next) => {
  try {
    const [result] = await Hug.aggregate([
      // Select a random document from the results
      { $sample: { size: 1 } },
      { $project: { __v: 0, _id: 0 } },
    ]);

    if (!result) {
      return next(createError(404, 'Could not find any Hug Gif'));
    }

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

export default getRandomHug;
