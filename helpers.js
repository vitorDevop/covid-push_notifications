const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('cases.db', err => {
  if (err) return console.log(err.message);
});

db.serialize(function() {
  db.run(
    'CREATE TABLE if not exists COVID_CASES (id INTEGER PRIMARY KEY AUTOINCREMENT, cases INTEGER, deaths INTEGER, recovered INTEGER, active INTEGER, critical INTEGER)'
  );
});

function getActualState(sendNotification, subscriptions) {
  axios
    .get('https://corona.lmao.ninja/countries/portugal')
    .then(function(response) {
      console.log(response.data);
      const data = response.data;
      //if not have record with that data insert it
      //and send web push notifications
      db.serialize(function() {
        db.all(
          `SELECT * FROM COVID_CASES WHERE cases = ${data.cases} AND deaths = ${data.deaths} AND recovered = ${data.recovered} AND active = ${data.active} AND critical = ${data.critical}`,
          function(err, row) {
            if (row.length == 0) {
              console.log('ultima atualização nao registada');
              console.log('a registar...');
              db.run(
                `INSERT INTO COVID_CASES (cases, deaths, recovered, active, critical) VALUES (${response.data.cases}, ${response.data.deaths}, ${response.data.recovered}, ${response.data.active}, ${response.data.critical})`
              );
              console.log('send push notification...');
              if (subscriptions.length > 0) {
                subscriptions.forEach(subscriber => {
                  sendNotification(
                    'Novos dados - Evolução do Covid-19 Portugal',
                    `casos: ${response.data.cases} \nmortes: ${response.data.deaths} \nrecuperados: ${response.data.recovered} \ncasos ativos: ${response.data.active} \nestado critico: ${response.data.critical}`,
                    subscriber
                  );
                });
              }
            }
          }
        );
      });
      return response.data;
    })
    .catch(function(err) {
      console.log(err);
    })
    .finally(function() {
      console.log('getActualState() executed');
    });
}

function getHistory(sendNotification, subscriptions) {
  axios
    .get('https://corona.lmao.ninja/historical')
    .then(function(response) {
      //   console.log(response.data);
      const data = response.data;

      data.forEach(countryData => {
        if (countryData.country === 'Portugal') {
          console.log(countryData);

          const portugalData = countryData;
          const casesHistory = portugalData.timeline.cases;
          const deathsHistory = portugalData.timeline.deaths;
          const recoveredHistory = portugalData.timeline.recovered;
          //   console.log(recoveredHistory['3/20/20']);
          const date = new Date();

          const year = date
            .getFullYear()
            .toString()
            .slice(0, 2);
          const month = date.getUTCMonth() + 1;
          const day = date.getUTCDate();
          const date_srt = `${month}/${day}/${year}`;

          //   console.log(casesHistory['3/20/20']);
          //   console.log(date_srt);
          if (casesHistory[date_srt] !== undefined) {
            console.log('já existem registos para hoje');
            const yesterdayCases = casesHistory[`${month}/${day - 1}/${year}`];
            const todayCases = casesHistory[date_srt];
            const newCases = todayCases - yesterdayCases;

            const yesterdayDeaths =
              deathsHistory[`${month}/${day - 1}/${year}`];
            const todayDeaths = deathsHistory[date_srt];
            const newDeads = todayDeaths - yesterdayDeaths;

            const yesterdayRecovered =
              recoveredHistory[`${month}/${day - 1}/${year}`];
            const todayRecovered = recoveredHistory[date_srt];
            const newRecovered = todayRecovered - yesterdayRecovered;

            console.log(`${newCases} novos casos`);
            console.log(`${newDeads} novas mortes`);
            console.log(`${newRecovered} pessoas recuperadas`);
            console.log('send push notification...');
            if (subscriptions.length > 0) {
              subscriptions.forEach(subscriber => {
                sendNotification(
                  'Evolução do covid-19 Portugal',
                  `${newCases} novos casos \n${newDeads} novas mortes \n${newRecovered} pessoas recuperadas`,
                  subscriber
                );
              });
            }
            return true;
          } else {
            console.log('Ainda não existem registos para hoje');
            return false;
          }
        }
      });

      //if new data for today show
      //send push notifications
      //Evolução do covid-19:
      //15 novos casos
      //20 novas mortes
      //15 pessoas recuperadas
      //Total: 1020 casos

      return response.data;
    })
    .catch(function(err) {
      console.log(err);
    })
    .finally(function() {
      console.log('getHistory() executed');
    });
}
/* db.close(err => {
    if (err) return console.error(err.message);
  }); */
module.exports = {
  getActualState,
  getHistory
};
// module.exports.getHistory = getHistory;
