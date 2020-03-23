const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  dynoUrl: process.env.DYNO_URL,
  publicVapidKey: process.env.PUBLIC_VAPID_KEY,
  privateVapidKey: process.env.PRIVATE_VAPID_KEY
};
