import Waifus from '../../../models/schemas/Waifu.js';
import Stats from '../../../models/schemas/Stat.js';

// Get a random waifu
const getRandomWaifu = async (req, res, next) => {
  try {
    const [result] = await Waifus.aggregate([
      // Select a random document from the results
      { $sample: { size: 1 } },
      { $project: { __v: 0 } },
    ]);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export default getRandomWaifu;
