const debug = require('debug')('fantasy-f1-analyzer-summary');
debug('Entry: [%s]', __filename);

// Formatting of text to F1 constructor team colours
const formatting = require('./formatting');

// Console output formatting for columns and colours
const columnify = require('columnify');

// Platform independent end-of-line character
const EOL = require('os').EOL;

function displayCurrentStandings(f1DataSet) {
    debug('displayCurrentStandings() :: Entry');

    // Extract both Drivers & Constructors lists and sort them
    let drivers = formatting.sortByPoints(f1DataSet.drivers);
    let constructors = formatting.sortByPoints(f1DataSet.constructors);

    // Initialise the object we're going to store the Summary in
    let summary = [];

    // Loop through the Drivers & Constructors creating two columns (for the first 10 rows, then we run out of Constructors)
    for (let i = 0; i < drivers.length - 1; i++) {
        let row = {
            constructor: formatting.applyTeamColours(constructors[i]?.display_name, constructors[i]?.team_abbreviation),
            constructorPoints: formatting.applyTeamColours(constructors[i]?.season_score, constructors[i]?.team_abbreviation),
            driver: formatting.applyTeamColours(drivers[i].display_name, drivers[i].team_abbreviation),
            driverPoints: formatting.applyTeamColours(drivers[i].season_score, drivers[i].team_abbreviation)
        }

        summary.push(row);
    }

    // Display summary of current standing
    let columns = columnify(summary, {
        columnSplitter: ' | ',
        config: {
            constructorPoints: {
                headingTransform: () => {return('POINTS')}
            },
            driverPoints: {
                headingTransform: () => {return('POINTS')}
            }
        }
    });
    console.log(EOL + columns + EOL);
}

module.exports = { displayCurrentStandings };