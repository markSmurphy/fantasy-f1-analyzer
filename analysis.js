const debug = require('debug')('fantasy-f1-analyzer-analysis');
debug('Entry: [%s]', __filename);


// Import terminal spinner library
const ora = require('ora');

// Extract all Constructors from the raw data
function getConstructors(data) {
   debug('getConstructors::Entry');
   // Initialise constructors array
   let constructors = [];

   // Iterate through *all* data elements
   data.players.forEach(element => {
      // If it's a constructor then add it to the array
      if (element.is_constructor === true) {
         constructors.push(element);
      }
   });
   debug('getConstructors() found %s constructors', constructors.length);
   return (constructors);
}

// Extract all Drivers from the raw data
function getDrivers(data) {
   debug('getDrivers::Entry');
   // Initialise drivers array
   let drivers = [];

   // Iterate through *all* data elements
   data.players.forEach(element => {
      // If it's *not* a constructor then it's a drivers, so  add it to the array
      if (element.is_constructor === false) {
         drivers.push(element);
      }
   });
   debug('getDrivers() found %s drivers', drivers.length);
   return (drivers);
}

function initCurrentTeamObject() {
   // Create `Current Team` object
   let currentTeam = {
      constructor: {
         name: '',
         price: 0,
         points: 0,
         abbreviation: ''
      },
      drivers: []
   };

   return (currentTeam);
}

function assessCurrentTeam(currentTeam, budget) {
   // Add up total points and total price
   let totalPoints = currentTeam.constructor.points;
   let totalPrice = currentTeam.constructor.price;

   currentTeam.drivers.forEach(driver => {
      totalPoints += driver.points;
      totalPrice += driver.price;
   })

   let result = {
      totalPoints: totalPoints,
      totalPrice: totalPrice,
      overBudget: totalPrice > budget ? true : false
   }



   return (result);
}

function performAnalysis(fullDataset, settings) {
   const startTime = Date.now(); // Record the start time

   // Create and start the progress spinner
   const spinnerProgress = ora('Initialising ...').start();


   // Create a new Current Team object
   let currentTeam = initCurrentTeamObject();

   // Analyse each constructor against all driver lineups
   fullDataset.constructors.forEach(constructor => {

      // Populate constructor properties into Current Team
      currentTeam.constructor.name = constructor.display_name;
      currentTeam.constructor.price = constructor.price;
      currentTeam.constructor.points = constructor.season_score;
      currentTeam.constructor.abbreviation = constructor.team_abbreviation;

      // Add initial driver lineup (1 to 5) to current team
      for (let i = 0; i <= 4; i++) {
         let driver = {
            name: fullDataset.drivers[i].display_name,
            price: fullDataset.drivers[i].price,
            points: fullDataset.drivers[i].season_score
         }

         currentTeam.drivers.push(driver);
      }

      // Update progress text with current team being analysed
      spinnerProgress.text('Analysing [' + currentTeam.constructor.abbreviation + ': ' + currentTeam.drivers.join(' ! ') + ']');
      let result = assessCurrentTeam(currentTeam, settings.budget);

      console.log(result);

   });

   const endTime = Date.now(); // Record the end time
   const duration = Math.ceil((endTime - startTime)/1000); // Obtain the duration in seconds

   // Stop the progress spinner
   spinnerProgress.succeed('Analysis Completed in ' + duration + ' seconds');
}

module.exports = { getConstructors, getDrivers, performAnalysis };
