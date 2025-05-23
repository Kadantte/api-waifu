import System from '../../../models/schemas/System.js';
import User from '../../../models/schemas/User.js';

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

/**
 * Redeems a reward for a user if not already claimed.
 */
export const redeemReward = async (req, res) => {
  try {
    const key = req.headers.key;

    // Authorization check
    if (!key || key !== process.env.ACCESS_KEY) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { code } = req.body;
    const userId = req.headers.id; // Adjust based on how you auth

    if (!code || !userId) {
      return res.status(400).json({ message: 'Missing code or user ID' });
    }

    // Find the system document (assuming you have only one system doc)
    const system = await System.findById('system').select('rewards');
    if (!system) {
      return res.status(500).json({ message: 'System configuration not found for rewards' });
    }

    // Find the reward by _id (code)
    const reward = system.rewards.find(r => r._id.toLowerCase() === code.toLowerCase() && r.isActive);

    if (!reward) {
      return res.status(404).json({ message: 'Invalid or inactive reward code' });
    }

    // Check valid date range if set
    const now = new Date();
    if (reward.validFrom && now < reward.validFrom) {
      return res.status(400).json({ message: 'Reward is not yet valid' });
    }
    if (reward.validUntil && now > reward.validUntil) {
      return res.status(400).json({ message: 'Reward has expired' });
    }

    // Get user and check status_history
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const alreadyClaimed = user.status_history?.some(status => status.value === code.toUpperCase());
    if (alreadyClaimed) {
      return res.status(409).json({ message: 'Reward already claimed' });
    }

    // Add reward to user's history
    user.status_history.push({
      _id: user.status_history.length + 1,
      value: code.toUpperCase(),
      timestamp: new Date(),
      reason: 'Self Reward redeemed',
    });

    await user.save();

    return res.status(200).json({
      message: 'Reward redeemed successfully',
      reward: {
        name: reward.name,
        type: reward.type,
        value: reward.value,
      },
    });
  } catch (err) {
    console.error('Error redeeming reward:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
