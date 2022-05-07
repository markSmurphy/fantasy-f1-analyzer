const debug = require('debug')('fantasy-f1-analyzer-help');
debug('Entry: [%s]', __filename);

// Terminal colour styling
const chalk = require('chalk');

function getConstructors(data) {
   debug('getConstructors::Entry');
   let constructors = [];
   data.players.forEach(element => {
      if (element.is_constructor === true) {
         constructors.push(element);
      }
   });
   debug('getConstructors() found %s constructors', constructors.length);
   return(constructors);
}

function getDrivers(data) {
   debug('getDrivers::Entry');
   let drivers = [];
   data.players.forEach(element => {
      if (element.is_constructor === false) {
         drivers.push(element);
      }
   });
   debug('getDrivers() found %s drivers', drivers.length);
   return(drivers);
}

function applyTeamColours(text, team_abbreviation) {
   let response = '';

   switch (team_abbreviation.toUpperCase()) {
      case 'MER':
            response = chalk.cyanBright(text);
         break;

      case 'AST':
            response = chalk.greenBright(text);
         break;

      case 'RED':
            response = chalk.blue(text);
         break;

      case 'HAA':
            response = chalk.whiteBright(text);
         break;

      case 'ALP':
            response = chalk.blueBright(text);
         break;

      case 'FER':
            response = chalk.red(text);
         break;

      case 'ALT':
            response = chalk.grey(text);
         break;

      case 'WIL':
            response = chalk.cyan(text);
         break;

      case 'MCL':
            response = chalk.yellow(text);
      break;

      case 'ALF':
            response = chalk.magenta(text);
         break;

      default:
            // Return the original text unaltered by default
            response = text;
         break;
   }

   return(response);
}

module.exports = {getConstructors, getDrivers, applyTeamColours};