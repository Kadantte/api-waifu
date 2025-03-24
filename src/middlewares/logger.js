import Stats from '../models/schemas/Stat.js';
import requestIp from 'request-ip';
import { Webhook } from 'discord-webhook-node';

const hook = new Webhook(process.env.DISCORD_WEBHOOK_URL);

const validEndpoints = new Set([
  'husbando',
  'waifu',
  'angry',
  'baka',
  'bite',
  'blush',
  'bonk',
  'bored',
  'bully',
  'bye',
  'chase',
  'cheer',
  'cringe',
  'cry',
  'cuddle',
  'dab',
  'dance',
  'die',
  'disgust',
  'facepalm',
  'feed',
  'glomp',
  'happy',
  'hi',
  'highfive',
  'hold',
  'hug',
  'kick',
  'kill',
  'kiss',
  'laugh',
  'lick',
  'love',
  'lurk',
  'midfing',
  'nervous',
  'nom',
  'nope',
  'nuzzle',
  'panic',
  'pat',
  'peck',
  'poke',
  'pout',
  'punch',
  'run',
  'sad',
  'shoot',
  'shrug',
  'sip',
  'slap',
  'sleepy',
  'smile',
  'smug',
  'stab',
  'stare',
  'suicide',
  'tease',
  'think',
  'thumbsup',
  'tickle',
  'triggered',
  'wag',
  'wave',
  'wink',
  'yes',
  'membership',
  'notification',
  'pages',
  'stats',
  'user',
  'fact',
  'listTags',
  'owoify',
  'password',
  'quote',
  'uvuify',
  'uwuify',
]);

export const requestLogger = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || 'Null Auth';
    const log = `${new Date()} - STATUS=${res.statusCode} - METHOD=${req.method} - IP=${
      req.ip
    } | ${requestIp.getClientIp(req)} - URL=${req.originalUrl} - ${auth}\n`;
    const now = new Date();
    const dateKey = now.toISOString().split('T')[0]; // "YYYY-MM-DD"
    const endpoint = req.path.split('/').pop(); // Extracts last part of the path

    const IMAGE_URL = 'https://i.imgur.com/c55SNmu.png';
    hook.setUsername('API Logger');
    hook.setAvatar(IMAGE_URL);
    hook.send(`\`${log}\``);
    console.log(log);

    // Ignore invalid endpoints
    if (!validEndpoints.has(endpoint)) return next();

    res.on('finish', async () => {
      const isSuccess = res.statusCode >= 200 && res.statusCode < 400;

      const update = {
        $inc: {
          total_requests: 1,
          [`daily.${dateKey}.total_requests`]: 1,
          [`daily.${dateKey}.${isSuccess ? 'success_requests' : 'failed_requests'}`]: 1,
          [`daily.${dateKey}.endpoints.${endpoint}`]: 1,

          // Increment the all-time count for this endpoint
          [`endpoints.${endpoint}`]: 1,
        },
      };

      await Stats.findOneAndUpdate({ _id: 'systemstats' }, update, { upsert: true });
    });

    next();
  } catch (error) {
    console.error('Request logging failed:', error);
    next();
  }
};
