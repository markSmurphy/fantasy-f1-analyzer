const debug = require('debug')('fantasy-f1-analyzer-analysis');
debug('Entry: [%s]', __filename);

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

module.exports = {getConstructors, getDrivers};