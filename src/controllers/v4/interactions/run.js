import createError from 'http-errors';
import Run from '../../../models/schemas/Run.js';
import Stats from '../../../models/schemas/Stat.js';

// Get random Anime Run
const getRandomRun = async (req, res, next) => {
  try {
    const [result] = await Run.aggregate([
      // Select a random document from the results
      { $sample: { size: 1 } },
      { $project: { __v: 0, _id: 0 } },
    ]);

    if (!result) {
      return next(createError(404, 'Could not find any Run Gif'));
    }

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

export default getRandomRun;
