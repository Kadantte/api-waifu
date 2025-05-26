import createError from 'http-errors';
import Bully from '../../../models/schemas/Bully.js';
import Stats from '../../../models/schemas/Stat.js';

// Get random Anime Bully
const getRandomBully = async (req, res, next) => {
  try {
    const [result] = await Bully.aggregate([
      // Select a random document from the results
      { $sample: { size: 1 } },
      { $project: { __v: 0, _id: 0 } },
    ]);

    if (!result) {
      return next(createError(404, 'Could not find any Bully Gif'));
    }

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

export default getRandomBully;
