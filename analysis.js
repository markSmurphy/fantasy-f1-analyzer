const debug = require('debug')('fantasy-f1-analyzer-analysis');
debug('Entry: [%s]', __filename);

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
   return(constructors);
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
   return(drivers);
}

module.exports = {getConstructors, getDrivers};