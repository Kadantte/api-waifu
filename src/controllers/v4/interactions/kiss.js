import createError from 'http-errors';
import Kissu from '../../../models/schemas/Kissu.js';
import Stats from '../../../models/schemas/Stat.js';

// Get random Anime Kiss
const getRandomKiss = async (req, res, next) => {
  try {
    const [result] = await Kissu.aggregate([
      // Select a random document from the results
      { $sample: { size: 1 } },
      { $project: { __v: 0, _id: 0 } },
    ]);

    if (!result) {
      return next(createError(404, 'Could not find any Kiss Gif'));
    }

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

export default getRandomKiss;
