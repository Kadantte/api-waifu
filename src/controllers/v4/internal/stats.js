import createError from 'http-errors';
import Stat from '../../../models/schemas/Stat.js';
import User from '../../../models/schemas/User.js';

// Helper function to parse the "top" query param (e.g., ?top=1, ?top=2-6)
const parseTopParam = top => {
  if (!top) return [0, 10]; // Default: Top 10
  const range = top.split('-').map(n => parseInt(n, 10));
  return range.length === 2 ? range : [0, range[0]];
};

// Get Most Popular Endpoints (Overall)
const getPopularEndpoints = async (req, res, next) => {
  try {
    const { top } = req.query;
    const [start, end] = parseTopParam(top);
    const key = req.headers.key;

    // Check for valid access key in headers
    if (!key || key !== process.env.ACCESS_KEY) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // ✅ Use .lean() to get a plain object
    const stats = await Stat.findOne({ _id: 'system' }, { endpoints: 1 }).lean();

    if (!stats || !stats.endpoints || Object.keys(stats.endpoints).length === 0) {
      return next(createError(404, 'No endpoint data found.'));
    }

    const sortedEndpoints = Object.entries(stats.endpoints)
      .sort((a, b) => b[1] - a[1]) // Sort by request count
      .slice(start, end); // Apply range filter

    res.status(200).json(Object.fromEntries(sortedEndpoints));
  } catch (error) {
    return next(error);
  }
};

// Get Top Endpoints for Today
const getTopEndpointsToday = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const { top } = req.query;
    const [start, end] = parseTopParam(top);
    const key = req.headers.key;

    // Check for valid access key in headers
    if (!key || key !== process.env.ACCESS_KEY) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // ✅ Use .lean() to get a plain object
    const stats = await Stat.findOne({ _id: 'system' }, { daily: 1 }).lean();

    // ✅ Correct way to check if today's data exists
    if (!stats || !stats.daily || !stats.daily[today]) {
      return next(createError(404, 'No endpoint data for today.'));
    }

    const dailyData = stats.daily[today]; // ✅ Correct access

    if (!dailyData.endpoints || Object.keys(dailyData.endpoints).length === 0) {
      return next(createError(404, 'No endpoint data for today.'));
    }

    // ✅ Sort and filter the endpoints
    const sortedEndpoints = Object.entries(dailyData.endpoints)
      .sort((a, b) => b[1] - a[1])
      .slice(start, end); // Apply range filter

    res.status(200).json(Object.fromEntries(sortedEndpoints));
  } catch (error) {
    return next(error);
  }
};

// Get Monthly Request Data (Last 5 Months)
const getMonthlyRequests = async (req, res, next) => {
  try {
    const now = new Date();
    const last5Months = [];
    const key = req.headers.key;

    // Check for valid access key in headers
    if (!key || key !== process.env.ACCESS_KEY) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    for (let i = 0; i < 5; i++) {
      const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1)); // Ensure UTC consistency
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format (YYYY-MM)
      const monthName = date.toLocaleString('en-US', { month: 'short' }).toLowerCase(); // "mar"
      last5Months.push({ monthKey, monthName });
    }

    const stats = await Stat.findOne({ _id: 'system' }, { daily: 1 }).lean();

    if (!stats || !stats.daily || Object.keys(stats.daily).length === 0) {
      console.log('❌ No daily data found.');
      return next(createError(404, 'No daily data found.'));
    }

    const monthlyData = last5Months.reduce((acc, { monthKey, monthName }) => {
      const datesInMonth = Object.keys(stats.daily).filter(date => date.startsWith(monthKey));

      acc[monthName] = datesInMonth.reduce((sum, date) => {
        const dailyRequests = stats.daily[date]?.total_requests || 0;
        return sum + dailyRequests;
      }, 0);

      return acc;
    }, {});

    res.status(200).json(monthlyData);
  } catch (error) {
    console.error('🔥 Error in getMonthlyRequests:', error);
    return next(error);
  }
};

// Middleware to Get Users by Type (Quota)
const getUsersStat = async (req, res, next) => {
  try {
    const { type, top } = req.query;
    const [start, end] = parseTopParam(top);

    // ✅ Validate Type
    if (!['quota', 'requests'].includes(type)) {
      return next(createError(400, 'Invalid type.'));
    }

    let users;

    switch (type) {
      case 'quota':
        users = await User.aggregate([
          {
            $project: {
              username: { $ifNull: ['$username', 'Anonymous'] },
              req_quota: 1,
            },
          },
          { $sort: { req_quota: -1 } },
          { $skip: start },
          { $limit: end - start },
        ]);

        break;

      case 'requests':
        // ✅ Fetch all users with request statistics
        users = await User.find({}, { username: 1, 'statistics.requests': 1 }).lean();

        // ✅ Process and sum up request counts
        users = users.map(user => {
          const totalRequests = Object.values(user.statistics?.requests || {}).reduce((sum, count) => sum + count, 0);
          return {
            _id: user._id,
            username: user.username || 'Anonymous',
            count: totalRequests,
          };
        });

        // ✅ Sort users by total requests (descending)
        users.sort((a, b) => b.count - a.count);

        // ✅ Apply pagination
        users = users.slice(start, end);
        break;
    }

    if (!users.length) {
      return next(createError(404, `No users found with ${type === 'quota' ? 'request quotas' : 'requests'}.`));
    }

    res.status(200).json(users);
  } catch (error) {
    return next(error);
  }
};

export { getPopularEndpoints, getTopEndpointsToday, getMonthlyRequests, getUsersStat };
