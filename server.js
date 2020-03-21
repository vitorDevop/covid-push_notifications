const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const path = require('path');

const helpers = require('./helpers');

let app = express();
var subscriptions = [];
//Set static path
app.use(express.static(path.join(__dirname, 'public')));
app.disable('x-powered-by');
const port = process.env.PORT || 3000;
app.use(bodyParser.json());

const publicVapidKey =
  'BObq8X1-SPUeRd5BjXGib0Uue6JQZMSg-kqUclmlXGcsaEsyPYfZM14Ua5ZH1hmLRBTYKe6gdFRWrTLWljQ8VNQ';
const privateVapidKey = 'AX_8wHANZnW3nZH1yp9kzxLT1lmurygDLwGljvcts08';

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
  console.log(subscription);
  subscriptions.push(subscription);

  //Send 201 - resource created
  res.status(201).json({});
  sendNotification(
    'Obrigado pela sua preferência',
    'Serão enviadas notificações brevemente',
    subscription
  );
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

setInterval(
  () => helpers.getActualState(sendNotification, subscriptions),
  3600000
); //1 hora

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

app.listen(port, () => console.log(`Server started on port: ${port}`));
