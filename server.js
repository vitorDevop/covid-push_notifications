const express = require('express');
let app = express();
const port = process.env.PORT || 3000;
const axios = require('axios');

const helpers = require('./helpers');

const executeFunctions = () => {
  //   helpers.getActualState();
  helpers.getHistory();
};
executeFunctions();
// setInterval(helpers.getActualState(), 3600000); //1 hora
// setInterval(helpers.getHistory(), 10800000); //3 horas
app.get('/', (req, res) => {
  //   res.send('home');
});

app.listen(port);
console.log(`listening on port: ${port}`);
