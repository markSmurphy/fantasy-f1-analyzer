const debug = require('debug')('fantasy-f1-analyzer-analysis');
debug('Entry: [%s]', __filename);

const chalk = require('chalk');
// Import terminal spinner library
const ora = require('ora');
// Create and start the progress spinner
const spinnerProgress = ora().start();

// Formatting of text to F1 constructor team colours
const formatting = require('./formatting');

// Platform independent end-of-line character
const newLine = require('os').EOL;

// Initialise statistics object
const statistics = require('./statistics');
const stats = statistics.initialise();

const bestTeam = {
   points: 0,
   teams: []
};

function getConstructors(f1data) { // Extract all Constructors from the raw data
   debug('getConstructors::Entry');
   // Initialise constructors array
   let constructors = [];

   // Iterate through *all* data elements
   f1data.players.forEach(element => {
      // If it's a constructor then add it to the array
      if (element.is_constructor === true) {
         constructors.push(element);
      }
   });
   debug('getConstructors() found %s constructors', constructors.length);
   return (constructors);
}

function getDrivers(f1data) { // Extract all Drivers from the raw data
   debug('getDrivers::Entry');
   // Initialise drivers array
   let drivers = [];

   // Iterate through *all* data elements
   f1data.players.forEach(element => {
      // If it's *not* a constructor then it's a drivers, so  add it to the array
      if (element.is_constructor === false) {
         drivers.push(element);
      }
   });
   debug('getDrivers() found %s drivers', drivers.length);
   return (drivers);
}

function initCurrentTeamObject() {
   // Return a new `Current Team` object
   let currentTeam = {
      constructor: {
         name: '',
         price: 0,
         points: 0,
         abbreviation: ''
      },
      drivers: Array(5)
   };

   return (currentTeam);
}

function doesArrayHaveDuplicates(sourceArray) {
   let duplicates = []; // Initialise array to hold copy of duplicates
   sourceArray.forEach((el, i) => { // Loop through array
      sourceArray.forEach((element, index) => { // Loop through whole array once per element in array
         if (i === index) return null; // Make sure we're not comparing the same element
         if (element.display_name === el.display_name) { // Elements are different, so do they share the same display name?
            if (!duplicates.includes(el)) duplicates.push(el); // The same display name occurs in two elements. Make a copy of the duplicate
         }
      });
   });

   return (duplicates.length > 0 ? true : false); // Return `true` if we have found any duplicates
}

function validateDrivers(drivers) {
   // Make sure that `drivers` is an array with five unique members
   if (Array.isArray(drivers)) {
      // It is an array ...
      if (drivers.length === 5) {
         // It does have five members
         if (doesArrayHaveDuplicates(drivers)) {
            // There are duplicate drivers
            return (false);
         } else {
            // There are *no* duplicates
            return (true);
         }
      } else {
         return (false);
      }
   } else {
      return (false);
   }
}

function tallyCurrentTeam(currentTeam) {
   // Add up total points and total price
   let totalPoints = currentTeam.constructor.season_score;
   let totalPrice = currentTeam.constructor.price;

   currentTeam.drivers.forEach(driver => {
      totalPoints += driver.season_score;
      totalPrice += driver.price;
   })

   let result = {
      totalPoints: totalPoints,
      totalPrice: totalPrice,
      overBudget: totalPrice > global.settings.budgetCap ? true : false
   }

   return (result);
}

function registerTeam(currentTeam) {
   // Check if we're replacing the existing best team, or joining it

   if (currentTeam.tallyResults.totalPoints === bestTeam.points) { // We have a team with an equal points total
      bestTeam.teams.push(currentTeam);                            // Append this team to the `teams` array
   }

   if (currentTeam.tallyResults.totalPoints > bestTeam.points) {   // We have a team with a better points total
      bestTeam.points = currentTeam.tallyResults.totalPoints;      // Replace the best points total
      bestTeam.teams = [];                                         // Remove existing best team(s)
      bestTeam.teams.push(currentTeam);                            // Record new best team
   }
}

function analyseTeam(currentTeam) {
   // Increment total count
   stats.counters.totalTeams++;

   // Update progress text with current team being analysed
   let currentConstructor = formatting.applyTeamColours(currentTeam.constructor.display_name, currentTeam.constructor.team_abbreviation);
   let spinnerText = spinnerProgress.text = 'Analysing ' + currentConstructor + ': ' + currentTeam.drivers.map(e => e.last_name).join(' | ');
   spinnerProgress.text = spinnerText;
   spinnerProgress.render();

   // Ensure the team's driver lineup is valid
   if (validateDrivers(currentTeam.drivers)) {
      stats.counters.analysedTeams++;
      let tallyResults = tallyCurrentTeam(currentTeam);

      if (tallyResults.overBudget) { // Check if the team was over budget
         stats.counters.overBudget++;
      } else {
         // Team is within budget
         if (tallyResults.totalPoints >= bestTeam.points) {
            // We've got a contender for best team. Append the results and process its potential
            currentTeam.tallyResults = tallyResults;
            registerTeam(currentTeam);
         }
      }
   } else {
      // Team drivers are invalid (i.e. not enough of them or contains duplicates)
      stats.counters.invalidTeams++;
   }

}

function displayBestTeam(){
   console.log(chalk.underline('Optimal team:'));
   bestTeam.teams.forEach(team => {
      console.log(newLine);
      console.log(`Constructor: ${formatting.applyTeamColours(team.constructor.display_name)}`);
      console.log(`Drivers:     ${formatting.applyTeamColours(team.drivers[0].display_name)}`);
      console.log(`             ${formatting.applyTeamColours(team.drivers[1].display_name)}`);
      console.log(`             ${formatting.applyTeamColours(team.drivers[2].display_name)}`);
      console.log(`             ${formatting.applyTeamColours(team.drivers[3].display_name)}`);
      console.log(`             ${formatting.applyTeamColours(team.drivers[4].display_name)}`);
   });
}

function performAnalysis(f1data) {
   const startTime = Date.now(); // Record the start time

   // Create a new Current Team object
   let currentTeam = initCurrentTeamObject();

   // Analyse each constructor against all driver lineups
   f1data.constructors.forEach(constructor => {

      // Populate constructor properties into Current Team
      currentTeam.constructor = constructor;
      // Initialise array of team drivers
      currentTeam.drivers = [];

      for (let driver1 = 0; driver1 <= 15; driver1++) {
         // Populate each driver in turn into the first driver slot
         currentTeam.drivers[0] = f1data.drivers[driver1];
         analyseTeam(currentTeam);

         for (let driver2 = driver1 + 1; driver2 <= 16; driver2++) {
            currentTeam.drivers[1] = f1data.drivers[driver2];
            analyseTeam(currentTeam);

            for (let driver3 = driver2 + 1; driver3 <= 17; driver3++) {
               currentTeam.drivers[2] = f1data.drivers[driver3];
               analyseTeam(currentTeam);

               for (let driver4 = driver3 + 1; driver4 <= 18; driver4++) {
                  currentTeam.drivers[3] = f1data.drivers[driver4];
                  analyseTeam(currentTeam);

                  for (let driver5 = driver4 + 1; driver5 <= 19; driver5++) {
                     currentTeam.drivers[4] = f1data.drivers[driver5];
                     analyseTeam(currentTeam);
                  }
               }
            }
         }
      }
   });

   const endTime = Date.now(); // Record the end time
   const durationSeconds = Math.ceil((endTime - startTime) / 1000); // Obtain the duration in seconds
   //const duration = utils.secondsToHms(durationSeconds);

   // Stop the progress spinner
   spinnerProgress.succeed(`Analysed ${stats.counters.analysedTeams} team combinations in ${durationSeconds} seconds`);

   displayBestTeam(bestTeam);
}

module.exports = { getConstructors, getDrivers, performAnalysis };