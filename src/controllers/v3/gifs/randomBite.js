import createError from 'http-errors';
import Bite from '../../../models/schemas/Bite.js';

// Get random Anime Bite
const getRandomBite = async (req, res, next) => {
  try {
    const [result] = await Bite.aggregate([
      // Select a random document from the results
      { $sample: { size: 1 } },
      { $project: { __v: 0, _id: 0 } },
    ]);

    if (!result) {
      return next(createError(404, 'Could not find any Bite Gif'));
    }

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

export default getRandomBite;
