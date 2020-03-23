const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const path = require('path');

const { dynoUrl, privateVapidKey, publicVapidKey } = require('./config');
const env = process.env.NODE_ENV || 'dev'; //dev, production
var log = require('debug')('subscribe');
const helpers = require('./helpers');
const wakeUpDyno = require('./wakeUpDyno');

let app = express();
var subscriptions = [];
//Set static path
app.use(express.static(path.join(__dirname, 'public')));
app.disable('x-powered-by');
const port = process.env.PORT || 3000;
app.use(bodyParser.json());

//VapidKeys - identify who send push notification
webpush.setVapidDetails(
  'mailto:test@test.com',
  publicVapidKey,
  privateVapidKey
);

//Subscribe Route - sending notification to service worker
app.post('/subscribe', (req, res) => {
  // Get push subscription object
  const subscription = req.body;
  // console.log(subscription);
  // log(subscription);
  if (
    Object.keys(subscription).length === 0 &&
    subscription.constructor === Object
  ) {
    res.status(404).json({ message: 'No subscription passed' });
    // console.log();
    log('Empty Object passed to subscription');
  } else {
    const equalSub = subscriptions.filter(function(sub) {
      return (
        sub.endpoint === subscription.endpoint &&
        sub.expirationTime === subscription.expirationTime &&
        sub.keys.p256dh === subscription.keys.p256dh &&
        sub.keys.auth === subscription.keys.auth
      );
    });
    if (
      !(
        Object.keys(equalSub).length === 0 &&
        subscription.constructor === Object
      )
    ) {
      log('Subscription already added...');
    } else {
      log('subscriptions = ', subscriptions);
      subscriptions.push(subscription);
      log('Subscription added...');

      //Send 201 - resource created
      res.status(201).json({});
      sendNotification(
        'Obrigado pela sua preferência',
        'Serão enviadas notificações brevemente',
        subscription
      );
    }
  }
});

app.get('/home', (req, res) => {
  res.send('Utilize as nossas notificações');
});

function sendNotification(title, body, subscription) {
  //Create payload
  const payload = JSON.stringify({ title: title, body: body });

  //Pass object into sendNotification
  webpush
    .sendNotification(subscription, payload)
    .catch(err => console.log(err));
}

// setInterval(() => sendNotification('teste', subscriptions[0]), 4000);
/* const executeFunctions = () => {
  helpers.getActualState();
  helpers.getHistory();
};
executeFunctions(); */
// setInterval(
//   () => helpers.getActualState(sendNotification, subscriptions),
//   10000
// );

setTimeout(
  () => helpers.getActualState(sendNotification, subscriptions),
  120000
); //executes first time after 2 min

setInterval(
  () => helpers.getActualState(sendNotification, subscriptions),
  1200000
); //1 h=3600000 / 20 min=1200000

//Executes always at 20pm of the day
cron.schedule('0 20 * * *', () => {
  console.log('running a task');
  //ticks every 30 min
  var intervalId = setInterval(() => {
    if (helpers.getHistory(sendNotification, subscriptions)) {
      console.log('já terminou o set interval');
      clearInterval(intervalId);
    }
  }, 1800000);
});

app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
  if (env !== 'dev') {
    //In production
    wakeUpDyno(dynoUrl);
  }
});
