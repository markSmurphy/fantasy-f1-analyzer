const debug = require('debug')('fantasy-f1-analyzer-export');
debug('Entry: [%s]', __filename);

// Library to convert JSON into CSV
const jsonexport = require('jsonexport');

// Initialise console colours
const chalk = require('chalk');

// Platform independent end-of-line character
const newLine = require('os').EOL;

// File System object
const fs = require('fs');

function extractDetails(dataset, callback) {
   dataset.teams.forEach(team => {
      let teamOutput = []; // Initialise output array

      teamOutput.push({ // Add Constructor
         name: team.constructor.display_name,
         points: team.constructor.season_score,
         cost: team.constructor.price
      });

      team.drivers.forEach(driver => { // Add Drivers
         teamOutput.push({
            name: driver.display_name,
            points: driver.season_score,
            cost: driver.price,
            qualifyingTop10Streak: driver.streak_events_progress.top_ten_in_a_row_qualifying_progress,
            raceTop10Streak: driver.streak_events_progress.top_ten_in_a_row_race_progress
         });
      });

      // Add totals row
      teamOutput.push({
         name: '',
         points: team.tallyResults.totalPoints,
         cost: team.tallyResults.totalPrice
      });

      callback(teamOutput);
   });
}

function exportToFile(dataset, filename) {
   // Check if the filename provided ends with ".csv"
   if (filename.substr(filename.length - 4).toLowerCase() !== '.csv') {
      // It doesn't end with ".csv" so appended the file extension
      filename = `${filename}.csv`;
   }

   extractDetails(dataset, (exportData) => {// Extract only relevant fields from the data
      jsonexport(exportData, (err, csv) => { // Convert JSON to CSV

         if (err) { // Check for an error
            console.error(`${chalk.redBright('An error occurred converting the results into a CSV format: ')}%O`, err);
         } else {
            // Write the results to file
            try {
               fs.writeFileSync(filename, csv);

               // Notify the user where the file is saved
               console.log(newLine); // New line
               console.log(chalk.cyan('Results written to [%s]'), filename);
               console.log(newLine); // New line
            } catch (error) {
               debug('An error occurred writing to results to disk.');
               console.error(`${chalk.redBright('An error occurred writing to the file [%s]: ')}%O`, filename, error);
            }
         }
      });
   });
}

module.exports = { exportToFile };
