const debug = require('debug')('fantasy-f1-analyzer-statistics');
debug('Entry: [%s]', __filename);

function initialise() {
   // Initialise a statistics object
   let statisticsObject = {
      counters: {
         totalTeams: 0,
         overBudget: 0,
         invalidTeams: 0,
         analysedTeams: 0
      }
   };

   // Return the statistics object
   return (statisticsObject);
}

module.exports = { initialise };
