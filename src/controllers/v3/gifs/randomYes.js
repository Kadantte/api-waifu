import createError from 'http-errors';
import Yesh from '../../../models/schemas/Yesh.js';
import Stats from '../../../models/schemas/Stat.js';

// Get random Anime Yes
const getRandomYes = async (req, res, next) => {
  try {
    const [result] = await Yesh.aggregate([
      // Select a random document from the results
      { $sample: { size: 1 } },
      { $project: { __v: 0, _id: 0 } },
    ]);

    if (!result) {
      return next(createError(404, 'Could not find any Yes Gif'));
    }

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

export default getRandomYes;
