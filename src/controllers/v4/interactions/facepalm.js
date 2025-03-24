import createError from 'http-errors';
import Facepalm from '../../../models/schemas/Facepalm.js';
import Stats from '../../../models/schemas/Stat.js';

// Get random Anime Facepalm
const getRandomFacepalm = async (req, res, next) => {
  try {
    const [result] = await Facepalm.aggregate([
      // Select a random document from the results
      { $sample: { size: 1 } },
      { $project: { __v: 0, _id: 0 } },
    ]);

    if (!result) {
      return next(createError(404, 'Could not find any Facepalm Gif'));
    }

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

export default getRandomFacepalm;
