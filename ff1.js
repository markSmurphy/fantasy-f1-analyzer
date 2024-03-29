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

// API response validation functions
const validation = require('./validate');

// Write Title to console
var figlet = require('figlet');
console.log(figlet.textSync('Fantasy F1 Analyser', {
    font: 'Standard',
    horizontalLayout: 'fitted'
}));

// Send HTTP request to 'players' endpoint which has all drivers and constructors
let url = `${global.settings.baseUrl}${global.settings.year}/players`

console.log(chalk.whiteBright('Retrieving latest Fantasy F1 data …'));
console.log(chalk.blueBright(url));
needle(global.settings.httpMethod, url, global.settings.httpOptions)
    .then(function (response) {
        debug(`HTTP response ${response.statusCode} for [${url}] received`);
        debug(response);
        if (response.statusCode !== 200) {
            console.error(`${chalk.redBright(response.statusCode)} - ${chalk.redBright(response.statusMessage)}`);
            if (Object.prototype.hasOwnProperty.call(response.body, 'errors')) {
                console.error('The Fantasy F1 API returned an error: %O', response.body.errors);
            }
            // Exit as we didn't receive a good response from the API
            process.exit();

        } else {
            validation.validateDataset(response.body).then(() => {
                return processResponse(response.body);
            }).catch((error) => {
                console.error(chalk.red('Fatal Error:'));
                console.error(error);
            });
        }
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
    let results = analysis.performAnalysis(f1dataset);

    // Export to a file
    if (global.settings.export) {
        const exportResults = require('./export');
        exportResults.exportToFile(results.best, global.settings.exportFilename);
    }
}