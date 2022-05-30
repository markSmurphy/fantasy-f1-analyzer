const debug = require('debug')('fantasy-f1-analyzer-summary');
debug('Entry: [%s]', __filename);

// Formatting of text to F1 constructor team colours
const formatting = require('./formatting');

// Console output formatting for columns and colours
const columnify = require('columnify');

function displayCurrentStandings(f1DataSet) {
    debug('displayCurrentStandings() :: Entry');

    let drivers = formatting.sortByPoints(f1DataSet.drivers);
    let constructors = formatting.sortByPoints(f1DataSet.constructors);

    let currentStandings = {
        drivers: [],
        constructors: []
    };

    // Iterate through Drivers
    drivers.forEach(element => {
        let details = {};
        details.driver = formatting.applyTeamColours(element.display_name, element.team_abbreviation);
        details.points = formatting.applyTeamColours(element.season_score, element.team_abbreviation);

        // Save details into Current Standing object
        currentStandings.drivers.push(details);
    });
    debug('Got %i drivers', currentStandings.drivers.length);

    // Iterate through Constructors
    constructors.forEach(element => {
        let details = {};
        details.constructor = formatting.applyTeamColours(element.display_name, element.team_abbreviation);
        details.points = formatting.applyTeamColours(element.season_score, element.team_abbreviation);

        // Save details into Current Standing object
        currentStandings.constructors.push(details);
    });
    debug('Got %i constructors', currentStandings.constructors.length);

    // Display summary of current standing
    let driversColumns = columnify(currentStandings.drivers, {
        columnSplitter: ' | ',
    });
    console.log(driversColumns + '\r\n\r\n');

    let constructorsColumns = columnify(currentStandings.constructors, {
        columnSplitter: ' | ',
    });
    console.log(constructorsColumns);
}

module.exports = { displayCurrentStandings };