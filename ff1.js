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

// Initialise configuration and populate the global settings object
const config = require('./configuration');
global.settings = config.getSettings();

// Write Title to console
var figlet = require('figlet');

console.log(figlet.textSync('Fantasy F1 Analyser', {
    font: 'Standard',
    horizontalLayout: 'fitted'
}));


// Send HTTP request to 'players' endpoint which has all drivers and constructors
let url = `${global.settings.baseUrl}${global.settings.year}/players`

console.log(chalk.grey('Retrieving latest Fantasy F1 data [' + url + '] ...'));
needle(global.settings.httpMethod, url, global.settings.httpOptions)
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
    let f1dataset = {
        drivers: drivers,
        constructors: constructors
    };

    // Display summary of current standings
    let summary = require('./summary');
    summary.displayCurrentStandings(f1dataset);

    analysis.performAnalysis(f1dataset);
}