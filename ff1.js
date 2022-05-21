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

// Initialise 'needle' HTTP client
const needle = require('needle');

// Initialise configuration and populate the settings object
const config = require('./configuration');
var settings = config.getSettings();

// Write Title to console
var figlet = require('figlet');

console.log(figlet.textSync('Fantasy F1 Analyser', {
    font: 'Standard',
    horizontalLayout: 'fitted'
}));


// Send HTTP request to 'players' endpoint which has all drivers and constructors
let url = `${settings.baseUrl}${settings.year}/players`

console.log(chalk.grey('Retrieving latest Fantasy F1 data [' + url + '] ...'));
needle(settings.httpMethod, url, settings.httpOptions)
    .then(function (response) {
        debug('HTTP response %s for [%s] received', response.status, url);
        return processResponse(response.body);
    })
    .catch(function (error) {
        console.error('An error occurred while processing Fantasy F1 data');
        console.error('%s returned: %O', url, error);
    })


function processResponse(data) {

    let analysis = require('./analysis');

    // Get details of constructors and drivers
    let constructors = analysis.getConstructors(data);
    let drivers = analysis.getDrivers(data);

    // Compile detailed F1 dataset
    let f1Dataset = {
        drivers: drivers,
        constructors: constructors
    };

    // Display summary of current standings
    let summary = require('./summary');
    summary.displayCurrentStandings(f1Dataset);

    analysis.performAnalysis(f1Dataset, settings);
}