#!/usr/bin/env node

const debug = require('debug');
debug('Entry: [%s]', __filename);
debug('Command line arguments: %O', process.argv);

// Command line options parser
const argv = require('yargs')
.help(false)
.argv;

// check if "debug" mode is enabled via the command line
if (argv.debug) {
    debug.enable('*');
}

// Initialise console colours
const chalk = require('chalk');

// Console output formatting for columns and colours
const columnify = require('columnify');

// Initialise 'needle' HTTP client
const needle = require('needle');

// Initialise configuration and populate the settings object
const config = require('./configuration');
var settings = config.getSettings();



console.log(chalk.whiteBright('Fantasy F1 Analyser'));

// Send HTTP request to 'players' endpoint which has all drivers and constructors
let url = `${settings.baseUrl}${settings.year}/players`

console.log(chalk.grey('Retrieving latest Fantasy F1 data ...'));
needle(settings.httpMethod, url, settings.httpOptions)
    .then(function(response) {
        debug('HTTP response %s for [%s] received', response.status, url);
        return processResponse(response.body);
    })
    .catch(function(error) {
        console.error('An error occurred when querying the Fantasy F1 API');
        console.error('%s returned: %O', url, error);
    })


function processResponse(data) {

    let analysis = require('./analysis');
    let formatting = require('./formatting');

    // Get details of constructors and drivers
    let constructors = analysis.getConstructors(data);
    let drivers = analysis.getDrivers(data);

    // Compile details of current standing
    let currentStanding = {
        drivers: [],
        constructors: []
    };

    // Iterate through Drivers
    drivers.forEach(element => {
        let details = {};
        details.driver = formatting.applyTeamColours(element.display_name, element.team_abbreviation);
        details.points = formatting.applyTeamColours(element.season_score, element.team_abbreviation);

        // Save details into Current Standing object
        currentStanding.drivers.push(details);
    });

    // Iterate through Constructors
    constructors.forEach(element => {
        let details = {};
        details.constructor = formatting.applyTeamColours(element.display_name, element.team_abbreviation);
        details.points = formatting.applyTeamColours(element.season_score, element.team_abbreviation);

        // Save details into Current Standing object
        currentStanding.constructors.push(details);
    });


    // Display summary of current standing
    console.log(chalk.whiteBright('---- Drivers Standings ----\r\n'))
    let driversColumns = columnify(currentStanding.drivers, {
        columnSplitter: ' | ',
    });
    console.log(driversColumns + '\r\n\r\n');

    console.log(chalk.whiteBright('---- Constructors Standings ----\r\n'))
    let constructorsColumns = columnify(currentStanding.constructors, {
        columnSplitter: ' | ',
    });
    console.log(constructorsColumns);
}