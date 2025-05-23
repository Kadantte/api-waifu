import System from '../../../models/schemas/System.js';

/**
 * Fetches rewards/rewards from the system.
 * Supports:
 * - All rewards
 * - Filtering by type (coupon, giftcard, voucher)
 * - Fetching a specific reward by its ID/code
 */
export const getRewards = async (req, res) => {
  try {
    const key = req.headers.key;
    const { id } = req.params;
    const { type } = req.query;

    // Authorization check
    // if (!key || key !== process.env.ACCESS_KEY) {
    //   return res.status(401).json({ message: 'Unauthorized' });
    // }

    // Fetch only the rewards field
    const system = await System.findById('system').select('rewards');

    if (!system || !Array.isArray(system.rewards)) {
      return res.status(404).json({ message: 'No rewards found' });
    }

    // If an ID is provided, return that specific reward
    if (id) {
      const reward = system.rewards.find(r => r._id === id);
      if (!reward) {
        return res.status(404).json({ message: 'Reward not found' });
      }
      return res.status(200).json(reward);
    }

    // Otherwise, return all (optionally filtered by type)
    let rewards = system.rewards.filter(r => r.isActive);
    if (type) {
      rewards = rewards.filter(r => r.type === type);
    }

    return res.status(200).json({
      count: rewards.length,
      rewards,
    });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Creates a new reward (giftcard, coupon, voucher) and adds it to the system.
 */
export const createReward = async (req, res) => {
  try {
    const key = req.headers.key;

    // Authorization check
    if (!key || key !== process.env.ACCESS_KEY) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id, type, description, discount, appliesTo, usage, validFrom, validUntil, isActive = true } = req.body;

    if (!id || !type || !discount || !discount.type || discount.value === undefined) {
      return res.status(400).json({ message: 'Missing required reward fields' });
    }

    const system = await System.findById('system');
    if (!system) {
      return res.status(404).json({ message: 'System not found' });
    }

    // Check for existing reward with same ID
    const exists = system.rewards.find(r => r._id === id);
    if (exists) {
      return res.status(409).json({ message: 'Reward with this ID already exists' });
    }

    const newReward = {
      _id: id,
      type,
      description,
      discount,
      appliesTo: appliesTo || {},
      usage: usage || {},
      validFrom,
      validUntil,
      isActive,
    };

    system.rewards.push(newReward);
    await system.save();

    return res.status(201).json({
      message: 'Reward created successfully',
      reward: newReward,
    });
  } catch (error) {
    console.error('Error creating reward:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
