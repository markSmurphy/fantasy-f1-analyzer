const debug = require('debug')('fantasy-f1-analyzer-summary');
debug('Entry: [%s]', __filename);

// Formatting of text to F1 constructor team colours
const formatting = require('./formatting');

// Console output formatting for columns and colours
const columnify = require('columnify');

// Initialise console colours
const chalk = require('chalk');

function displayCurrentStandings(data) {
    debug('displayCurrentStandings() :: Entry');
    let currentStandings = {
        drivers: [],
        constructors: []
    };

    // Iterate through Drivers
    data.drivers.forEach(element => {
        let details = {};
        details.driver = formatting.applyTeamColours(element.display_name, element.team_abbreviation);
        details.points = formatting.applyTeamColours(element.season_score, element.team_abbreviation);

        // Save details into Current Standing object
        currentStandings.drivers.push(details);
    });
    debug('Got %i drivers', currentStandings.drivers.length);

    // Iterate through Constructors
    data.constructors.forEach(element => {
        let details = {};
        details.constructor = formatting.applyTeamColours(element.display_name, element.team_abbreviation);
        details.points = formatting.applyTeamColours(element.season_score, element.team_abbreviation);

        // Save details into Current Standing object
        currentStandings.constructors.push(details);
    });
    debug('Got %i constructors', currentStandings.constructors.length);

    // Display summary of current standing
    console.log(chalk.whiteBright('---- Drivers ----\r\n'))
    let driversColumns = columnify(currentStandings.drivers, {
        columnSplitter: ' | ',
    });
    console.log(driversColumns + '\r\n\r\n');

    console.log(chalk.whiteBright('---- Constructors ----\r\n'))
    let constructorsColumns = columnify(currentStandings.constructors, {
        columnSplitter: ' | ',
    });
    console.log(constructorsColumns);
}

module.exports = { displayCurrentStandings };