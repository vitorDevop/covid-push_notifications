const axios = require('axios');

//interval in minutes
const wakeUpDyno = (url, interval = 25, callback) => {
  const milliseconds = interval * 60000;
  setTimeout(() => {
    try {
      console.log('setTimout called.');
      axios
        .get(url)
        .then(function(response) {
          console.log(`Taking HTTP GET request to ${url}...`);
        })
        .catch(function(err) {
          console.log(
            `Error fetching ${url}: ${err}, Will try again in ${interval} minutes...`
          );
        });
    } catch (err) {
      console.log(
        `Error fetching ${url}: ${err}, Will try again in ${interval} minutes...`
      );
    } finally {
      try {
        callback();
      } catch (e) {
        callback ? console.log('Callback failed: ' + e.message) : null;
      } finally {
        wakeUpDyno(url, interval, callback);
      }
    }
  }, milliseconds);
};

module.exports = wakeUpDyno;
