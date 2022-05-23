const debug = require('debug')('fantasy-f1-analyzer-configuration');
debug('Entry: [%s]', __filename);

// Command line options parser
var argv = require('yargs')
    .help(false)
    .argv;

// Initialise console colours
const chalk = require('chalk');

/* Endpoints we'll be interrogating
https://fantasy-api.formula1.com/f1/2022/teams
https://fantasy-api.formula1.com/f1/2022/players
https://fantasy-api.formula1.com/f1/2022/circuits
 */

function getSettings() {
    debug('Entry::getSettings()');

    // Get the year, which features in the endpoint's URL path
    let date = new Date().getFullYear();

    let settings = {
        baseUrl: 'https://fantasy-api.formula1.com/f1/',
        year: date.toString(),
        budgetCap: 100,
        verbose: false,
        httpMethod: 'GET',
        httpOptions: {}
    };

    try {
        // Check command line parameters for overrides...
        debug('Looking for overrides to default settings');

        // Override the year (season)
        if (argv.year) {
            // Validate that an integer was specified
            if (Number.isInteger(argv.year)) {
                settings.year = argv.year;
                debug('Year set to %s', settings.year);
            } else {
                console.log(chalk.blue('Ignoring "--year %s" because the year must be an integer. Using the default "%s" instead'), argv.year, settings.iterations);
            }
        }

        // Check for '--verbose' argument
        if (argv.verbose) {
            settings.verbose = true;
        }

        return settings;

    } catch (error) {
        console.error('An error occurred in getSettings(): %O', error);
        return (settings);
    }
}

module.exports = { getSettings };
