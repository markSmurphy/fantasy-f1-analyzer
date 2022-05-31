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

if (argv.help) {
    // Show help screen
    const help = require('./help');
    help.helpScreen(argv.verbose);
    process.exit();
}
// Initialise console colours
const chalk = require('chalk');

// Initialise 'needle' HTTP client
const needle = require('needle');

// Initialise configuration and populate the global settings object
const config = require('./configuration');
global.settings = config.getSettings();
debug(`Using settings: ${global.settings}`);

// Write Title to console
var figlet = require('figlet');
console.log(figlet.textSync('Fantasy F1 Analyser', {
    font: 'Standard',
    horizontalLayout: 'fitted'
}));

// Send HTTP request to 'players' endpoint which has all drivers and constructors
let url = `${global.settings.baseUrl}${global.settings.year}/players`

console.log(chalk.whiteBright('Retrieving latest Fantasy F1 data …'));
console.log(chalk.grey(url));
needle(global.settings.httpMethod, url, global.settings.httpOptions)
    .then(function (response) {
        debug(`HTTP response ${response.status} for [${url}] received`);
        debug(response);
        return processResponse(response.body);
    })
    .catch(function (error) {
        console.error(`An error occurred while processing Fantasy F1 data: ${error.message}`);
        console.error(error);
    })

function processResponse(data) {
    debug('processResponse()::Entry');
    let analysis = require('./analysis');
    let summary = require('./summary');

    // Get details of constructors and drivers
    let constructors = analysis.getConstructors(data);
    let drivers = analysis.getDrivers(data);

    // Compile detailed F1 dataset
    let f1dataset = {
        drivers: drivers,
        constructors: constructors
    };

    // Display summary of current standings
    summary.displayCurrentStandings(f1dataset);

    // Analyse the latest Fantasy F1 data
    analysis.performAnalysis(f1dataset);
}