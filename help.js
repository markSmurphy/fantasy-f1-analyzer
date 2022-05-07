const debug = require('debug')('fantasy-f1-analyzer-help');
debug('Entry: [%s]', __filename);

module.exports = {
    helpScreen: function (verbose) {
        // Platform independent end-of-line character
        const endOfLine = require('os').EOL;
        // console colours
        const chalk = require('chalk');
        // parse package.json for the version number
        const npmPackage = require('./package.json');

        // Display help screen
        console.log(chalk.blueBright(npmPackage.name));
        console.log(chalk.green('Read the docs: ') + npmPackage.homepage);
        console.log(chalk.magenta('Support & bugs: ') + npmPackage.bugs.url);
        console.log(endOfLine);
        console.log(chalk.grey('DESCRIPTION:'));
        console.log(chalk.italic('   %s'), npmPackage.description);
        console.log(endOfLine);
        console.log(chalk.grey('VERSION:'));
        console.log('   ' + npmPackage.version);
        console.log(endOfLine);
        console.log(chalk.grey('USAGE:'));
        console.log('   ' + 'node ff1.js [options]');
        console.log(endOfLine);
        console.log(chalk.grey('OPTIONS:'));
        console.log('   ' + '--verbose                     ' + chalk.grey('Enables verbose output'));
        console.log('   ' + '--debug                       ' + chalk.grey('Enables debugging output'));
        console.log('   ' + '--no-color                    ' + chalk.grey('Switches off colour output'));
        console.log('   ' + '--version                     ' + chalk.grey('Display version number'));
        console.log('   ' + '--help                        ' + chalk.grey('Display this help'));
        console.log(endOfLine);
        // Display more information if `verbose` is enabled
        if (verbose) {
            const os = require('os');
            const utils = require('./utils');
            console.log(endOfLine);
            console.log(chalk.grey('SYSTEM:'));
            console.log('   App Path           ' + chalk.blueBright(utils.getAppPath()));
            console.log('   Hostname           ' + chalk.blueBright(os.hostname()));
            console.log('   Uptime             ' + chalk.blueBright(utils.secondsToHms(os.uptime())));
            console.log('   Platform           ' + chalk.blueBright(os.platform()));
            console.log('   O/S                ' + chalk.blueBright(os.type()));
            console.log('   O/S release        ' + chalk.blueBright(os.release()));
            console.log('   CPU architecture   ' + chalk.blueBright(os.arch()));
            console.log('   CPU cores          ' + chalk.blueBright(os.cpus().length));
            console.log('   CPU model          ' + chalk.blueBright(os.cpus()[0].model));
            console.log('   Free memory        ' + chalk.blueBright(utils.formatBytes(os.freemem())));
            console.log('   Total memory       ' + chalk.blueBright(utils.formatBytes(os.totalmem())));
            console.log('   Home directory     ' + chalk.blueBright(os.homedir()));
            console.log('   Temp directory     ' + chalk.blueBright(os.tmpdir()));
            console.log('   Console width      ' + chalk.blueBright(process.stdout.columns));
            console.log('   Console height     ' + chalk.blueBright(process.stdout.rows));
            console.log('   Colour support     ' + chalk.blueBright(utils.getColourLevelDesc()));
        }
    }
};