const debug = require('debug')('fantasy-f1-analyzer-statistics');
debug('Entry: [%s]', __filename);

function init() {
   // Initialise a statistics object
   let statisticsObject = {
      counters: {
         totalTeams: 0,
         overBudget: 0
      }
   };

   // Return the statistics object
   return (statisticsObject);
}

function incrementTotalTeams(statisticsObject) {
   // Increment the `totalTeams` counter by one
   statisticsObject.counters.totalTeams = + 1;
   debug('TotalTeams count incremented by 1 to %i', statisticsObject.counters.totalTeams);
   // Return the update statistics object
   return (statisticsObject);
}

function incrementOverBudget(statisticsObject) {
   // Increment the `total` counter by one
   statisticsObject.counters.overBudget = + 1;
   debug('OverBudget count incremented by 1 to %i', statisticsObject.counters.overBudget);
   // Return the update statistics object
   return (statisticsObject);
}

function getTotal(statisticsObject) {
   // Return the `total`
   return (statisticsObject.counters.total);
}

function getOverBudget(statisticsObject) {
   // Return the `total`
   return (statisticsObject.counters.overBudget);
}

module.exports = { init, incrementTotalTeams, incrementOverBudget, getTotal, getOverBudget };
