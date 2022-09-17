const debug = require('debug')('fantasy-f1-analyzer-formatting');
debug('Entry: [%s]', __filename);

// Terminal colour styling
const chalk = require('chalk');

function applyTeamColours(text, team_abbreviation) {
   // Handle missing team_abbreviation
   if (team_abbreviation === undefined) {
      return (text);
   } else {
      let response = '';

      switch (team_abbreviation.toUpperCase()) {
         case 'MER': {
            response = chalk.cyanBright(text);
            break;
         }

         case 'AST': {
            response = chalk.greenBright(text);
            break;
         }

         case 'RED': {
            response = chalk.blue(text);
            break;
         }

         case 'HAA': {
            response = chalk.whiteBright(text);
            break;
         }

         case 'ALP': {
            response = chalk.blueBright(text);
            break;
         }

         case 'FER': {
            response = chalk.red(text);
            break;
         }

         case 'ALT': {
            response = chalk.grey(text);
            break;
         }

         case 'WIL': {
            response = chalk.cyan(text);
            break;
         }

         case 'MCL': {
            response = chalk.yellow(text);
            break;
         }

         case 'ALF': {
            response = chalk.magenta(text);
            break;
         }

         default:
            // Return the original text unaltered by default
            response = text;
            break;
      }
      return (response);
   }
}

function sortByPoints(list) {
   list.sort((a, b) => {
      return (b.season_score - a.season_score);
   });

   return (list);
}

module.exports = { applyTeamColours, sortByPoints };