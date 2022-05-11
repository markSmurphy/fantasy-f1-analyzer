function init() {
   // Initialise a statistics object
   let statisticsObject = {
      counters : {
         total: 0,
         overBudget: 0
      }
   };

   // Return the statistics object
   return(statisticsObject);
}

function incrementTotal(statisticsObject) {
   // Increment the `total` counter by one
   statisticsObject.counters.total =+ 1;
   // Return the update statistics object
   return(statisticsObject);
}

function incrementOverBudget(statisticsObject) {
   // Increment the `total` counter by one
   statisticsObject.counters.overBudget =+ 1;
   // Return the update statistics object
   return(statisticsObject);
}

function getTotal(statisticsObject) {
   // Return the `total`
   return(statisticsObject.counters.total);
}

function getOverBudget(statisticsObject) {
   // Return the `total`
   return(statisticsObject.counters.overBudget);
}

module.exports = {init, incrementTotal, incrementOverBudget, getTotal, getOverBudget};
