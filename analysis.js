const debug = require('debug')('fantasy-f1-analyzer-analysis');
debug('Entry: [%s]', __filename);

// console colours
const chalk = require('chalk');

// Import terminal spinner library
const ora = require('ora');

// Create the progress spinner
const spinnerProgress = ora();

// Formatting of text to F1 constructor team colours
const formatting = require('./formatting');

// Platform independent end-of-line character
const newLine = require('os').EOL;

// Import library of helper utilities
const utils = require('./utils');

// Console output formatting for columns and colours
const columnify = require('columnify');

// Initialise statistics object
const statistics = require('./statistics');
const { argv } = require('process');
const stats = statistics.initialise();

const bestTeam = {
   points: 0,
   teams: []
};

/* https://medium.com/swlh/how-to-round-to-a-certain-number-of-decimal-places-in-javascript-ed74c471c1b8 */
function round(number, decimalPlaces) { // Rounds a decimal number to a specified precision
   const factorOfTen = Math.pow(10, decimalPlaces);
   return (Math.round(number * factorOfTen) / factorOfTen);
}

function getConstructors(f1data) { // Extract all Constructors from the raw data
   debug('getConstructors()::Entry');
   // Initialise constructors array
   let constructors = [];

   // Iterate through *all* data elements
   f1data.players.forEach(element => {
      // If it's a constructor then add it to the array
      if (element.is_constructor === true) {
         constructors.push(element);
      }
   });
   debug(`getConstructors() found ${constructors.length} constructors`);
   return (constructors);
}

function getDrivers(f1data) { // Extract all Drivers from the raw data
   debug('getDrivers()::Entry');
   // Initialise drivers array
   let drivers = [];

   // Iterate through *all* data elements
   f1data.players.forEach(element => {
      // If it's *not* a constructor then it's a drivers, so  add it to the array
      if (element.is_constructor === false) {
         drivers.push(element);
      }
   });
   debug(`getDrivers() found ${drivers.length} drivers`);
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
   let response = false;
   if (Array.isArray(drivers)) {
      // It is an array ...
      if (drivers.length === 5) {
         // It does have five members
         if (doesArrayHaveDuplicates(drivers) === false) {
            // There are no duplicate drivers
            response = true;
         }
      }
   }
   // Return response
   return (response);
}

function tallyCurrentTeam(currentTeam, callback) {
   let prices = [];
   // Add up total points and total price
   let totalPoints = currentTeam.constructor.season_score;
   let totalPrice = currentTeam.constructor.price;
   prices.push(currentTeam.constructor.price);

   currentTeam.drivers.forEach(driver => {
      totalPoints = totalPoints + driver.season_score;
      totalPrice = totalPrice + driver.price;
      prices.push(driver.price);
   })

   // Round the total price to one decimal place
   let totalPriceRounded = round(totalPrice, 1);

   let result = {
      totalPoints: totalPoints,
      totalPrice: totalPriceRounded,
      totalPriceUnrounded: totalPrice,
      overBudget: totalPrice > global.settings.budgetCap ? true : false,
      prices: prices
   }

   callback(result);
}

function registerTeam(currentTeam) {
   debug('registerTeam():Entry');

   // Check if we're replacing the existing best team or adding this team to the list because they're tied on points
   if (currentTeam.tallyResults.totalPoints > bestTeam.points) {          // We have a team with a better points total
      debug(`new team with ${currentTeam.tallyResults.totalPoints} points is replacing the previous ${bestTeam.teams.length} which had ${bestTeam.points}`);
      bestTeam.points = currentTeam.tallyResults.totalPoints;             // Update the best points total
      bestTeam.teams = [];                                                // Remove existing best team(s)
      bestTeam.teams.push(currentTeam);                                   // Record new best team
   } else if (currentTeam.tallyResults.totalPoints === bestTeam.points) { // We have a team with an equal points total
      debug(`new team is being added to previous ${bestTeam.teams.length} as they share a points tally of ${currentTeam.tallyResults.totalPoints}`);
      bestTeam.teams.push(currentTeam);                                   // Append this team to the `teams` array
   }
}

function displayStatistics() {
   debug('displayStatistics()::Entry');
   console.log(chalk.underline('Statistics:'));

   let statisticsOutput = [
      {
         metric: chalk.grey('Analysed Teams'),
         value: stats.counters.analysedTeams
      },
      {
         metric: chalk.grey('Teams Over Budget Cap'),
         value: stats.counters.overBudget
      }
   ];

   let statisticsColumns = columnify(statisticsOutput, {
      showHeaders: false
   });

   console.log(statisticsColumns);
   console.log(newLine);
}

function displayBestTeam() {
   if (bestTeam.teams.length > 1) {
      console.log(chalk.whiteBright(`There are ${bestTeam.teams.length} optimal teams:`));
   }

   bestTeam.teams.forEach(team => {
      let bestTeamOutput = []; // Initialise output array

      bestTeamOutput.push({ // Add Constructor
         name: formatting.applyTeamColours(team.constructor.display_name, team.constructor.team_abbreviation),
         points: formatting.applyTeamColours(team.constructor.season_score, team.constructor.team_abbreviation),
         cost: formatting.applyTeamColours(team.constructor.price, team.constructor.team_abbreviation)
      });

      team.drivers.forEach(driver => { // Add Drivers
         bestTeamOutput.push({ // Add Constructor
            name: formatting.applyTeamColours(driver.display_name, driver.team_abbreviation),
            points: formatting.applyTeamColours(driver.season_score, driver.team_abbreviation),
            cost: formatting.applyTeamColours(driver.price, driver.team_abbreviation),
            qualifyingTop10Streak: formatting.applyTeamColours(driver.streak_events_progress.top_ten_in_a_row_qualifying_progress, driver.team_abbreviation),
            raceTop10Streak: formatting.applyTeamColours(driver.streak_events_progress.top_ten_in_a_row_race_progress, driver.team_abbreviation)
         });
      });

      // Add totals row
      bestTeamOutput.push({
         name: '',
         points: chalk.bold(team.tallyResults.totalPoints),
         cost: chalk.bold(team.tallyResults.totalPrice)
      });

      let bestTeamColumns = columnify(bestTeamOutput,{
         columnSplitter: ' | ',
         config: {
            qualifyingTop10Streak: {
                headingTransform: () => {return('QUALIFIED TOP 10 STREAK')},
                align: 'center'
            },
            raceTop10Streak: {
                headingTransform: () => {return('FINISHED TOP 10 STREAK')},
                align: 'center'
            }
        }
      });

      console.log(bestTeamColumns);
      console.log(newLine);
   });
}

function performAnalysis(f1data) {
   debug('performAnalysis()::Entry');
   const startTime = Date.now(); // Record the start time

   // Start the spinner if we're not showing debug output
   if (!debug.enabled) {
      spinnerProgress.start('Initialising ...');
   }

   // Analyse each constructor against all driver lineups
   for (let i = 0; i <= f1data.constructors.length - 1; i++) {


      for (let driver1 = 0; driver1 <= 15; driver1++) {
         // Iterate through each driver in turn

         for (let driver2 = driver1 + 1; driver2 <= 16; driver2++) {

            for (let driver3 = driver2 + 1; driver3 <= 17; driver3++) {

               for (let driver4 = driver3 + 1; driver4 <= 18; driver4++) {

                  for (let driver5 = driver4 + 1; driver5 <= 19; driver5++) {
                     // Create a new Current Team object
                     let currentTeam = initCurrentTeamObject();

                     // Populate constructor properties into Current Team
                     currentTeam.constructor = f1data.constructors[i];

                     currentTeam.drivers[0] = f1data.drivers[driver1]; // Add driver into 1st slot
                     currentTeam.drivers[1] = f1data.drivers[driver2]; // Add driver into 2nd slot
                     currentTeam.drivers[2] = f1data.drivers[driver3]; // Add driver into 3rd slot
                     currentTeam.drivers[3] = f1data.drivers[driver4]; // Add driver into 4th slot
                     currentTeam.drivers[4] = f1data.drivers[driver5]; // Add driver into 5th slot

                     /* Analyse the current team */

                     // Add the five indices that generate this team
                     //currentTeam.indices = `${driver1} ${driver2} ${driver3} ${driver4} ${driver5}`;

                     // Increment total count
                     stats.counters.totalTeams++;

                     // Update progress text with current team being analysed if we're not showing debug output
                     if (!debug.enabled) {
                        let currentConstructor = formatting.applyTeamColours(currentTeam.constructor.display_name, currentTeam.constructor.team_abbreviation);
                        let spinnerText = spinnerProgress.text = 'Analysing ' + currentConstructor + ': ' + currentTeam.drivers.map(e => e.last_name).join(' | ');
                        spinnerProgress.text = spinnerText;
                        spinnerProgress.render();
                     }

                     // Ensure the team's driver lineup is valid
                     if (validateDrivers(currentTeam.drivers)) {
                        stats.counters.analysedTeams++;
                        tallyCurrentTeam(currentTeam, (tallyResults) => {
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
                        });

                     } else { // The `drivers` array doesn't contain five unique drivers
                        stats.counters.invalidTeams++;
                     }
                  }
               }
            }
         }
      }
   }

   const endTime = Date.now(); // Record the end time
   const durationSeconds = Math.ceil((endTime - startTime) / 1000); // Obtain the duration in seconds
   const duration = utils.secondsToHms(durationSeconds);

   // Stop the progress spinner
   if (!debug.enabled) {
      spinnerProgress.succeed(`Analysed ${stats.counters.analysedTeams} team combinations in ${duration}`);
   }

   if (argv.verbose) {
      displayStatistics();
   }

   displayBestTeam();
}

module.exports = { getConstructors, getDrivers, performAnalysis };