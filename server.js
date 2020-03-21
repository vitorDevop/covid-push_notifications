const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const path = require('path');

let app = express();
//Set static path
app.use(express.static(path.join(__dirname, 'public')));
app.disable('x-powered-by');
const port = process.env.PORT || 3000;
app.use(bodyParser.json());

const publicVapidKey =
  'BObq8X1-SPUeRd5BjXGib0Uue6JQZMSg-kqUclmlXGcsaEsyPYfZM14Ua5ZH1hmLRBTYKe6gdFRWrTLWljQ8VNQ';
const privateVapidKey = 'AX_8wHANZnW3nZH1yp9kzxLT1lmurygDLwGljvcts08';
const helpers = require('./helpers');

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

  //Send 201 - resource created
  res.status(201).json({});

  //Create payload
  const payload = JSON.stringify({ title: 'Push Test' });

  //Pass object into sendNotification
  webpush
    .sendNotification(subscription, payload)
    .catch(err => console.log(err));
});

/* const executeFunctions = () => {
  helpers.getActualState();
  helpers.getHistory();
};
executeFunctions(); */

setInterval(() => helpers.getActualState(), 3600000); //1 hora

//Executes always at 20pm of the day
cron.schedule('0 20 * * *', () => {
  console.log('running a task');
  //ticks every 30 min
  var intervalId = setInterval(() => {
    if (helpers.getHistory()) {
      console.log('já terminou o set interval');
      clearInterval(intervalId);
    }
  }, 1800000);
});

app.listen(port, () => console.log(`Server started on port: ${port}`));
