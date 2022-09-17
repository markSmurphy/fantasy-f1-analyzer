const debug = require('debug')('fantasy-f1-analyzer-validate');
debug('Entry: [%s]', __filename);

function validateDataset(dataset) {
   return new Promise((resolve, reject) => {
      dataset.players.forEach(element => {

         if (isNaN(element?.season_score) === true) {
            reject(`Unexpected API response. Expected 'season_score' to be a number but it's a ${typeof (element?.season_score)} instead. [e.g.: ${element?.season_score}]`);
         }

         if (isNaN(element?.price) === true) {
            reject(`Unexpected API response. Expected 'price' to be a number but it's a ${typeof (element?.price)} instead. [e.g.: ${element?.price}]`);
         }
      });

      resolve();
   });
}

module.exports = { validateDataset };