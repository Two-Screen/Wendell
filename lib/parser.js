/**
 * wendell.js
 *
 *  Sergeant Wendell Sovens was an early Crucio siege tank operator, and installed a sophisticated
 *  surround-sound system into his tank. As a result, he was cut off and surrounded when he failed
 *  to hear the command to fall back. [1]
 *
 * [1](http://starcraft.wikia.com/wiki/CommandParser_Sovens)
 *
 * @author      Mattijs Hoitink <mattijs@monkeyandmachine.com>
 * @copyright   2012, Two Screen
 * @license     MIT License
 */

var util    = require('util'),
    path    = require('path'),
    _       = require('underscore'),
    Command = require('./command').Command;

/**
 * Wendell CommandParser
 *
 * Options:
 *  bin     - Name of the binary. This will show up in help messages as the executable name
 *  title   - Title to print when executing a command
 *  usage   - Usage message for the CommandParser
 *  version - Version for the CommandParser
 *
 * @param {Object} options Options for the Argument Parser
 */
function CommandParser(options) {
    options = options || {};

    // Unset "options"
    delete options['options'];
    options['options'] = {
        "version": { "description": "Show version information"},
        "help":    {}
    };

    // Call super
    Command.call(this, options);

    this.commands   = {};

    this.name    = options.name   || path.basename(process.argv[1]);
    this.title   = options.title || "";
    this.usage   = options.usage || this.name + " [-h, --help] [-v, --version] COMMAND [OPTIONS] [ARG, ...]";
    this.versionNumber = "1.0.0";
    this.setup   = options.setup;
    this.prefix   = options.prefix || false;
}
util.inherits(CommandParser, Command);

/**
 * Print one or multiple lines.
 *
 * @param {String} message  The message to print
 * @return {CommandParser}        Fluent interface
 */
CommandParser.prototype.print = function(lines, prefix) {
    if (!_.isArray(lines)) {
        lines = [lines];
    }
    // Assume any arguments except the lines to be the prefix switch
    prefix = arguments.length <= 1;

    if (!Array.isArray(lines)) {
        throw new Error('Lines must be an Array or String');
    }

    // Do we need to prefix the line?
    if (prefix && this.prefix && typeof(this.prefix) === 'function') {
        lines = lines.map(this.prefix.bind(this));
    }

    // Print each line
    lines.forEach(function(line) {
        console.log(line);
    });

    return this;
};

/**
 * Execute a registered command
 *
 * @param {String} command      The name of the Command to execute
 * @param {Object} options      Options to pass to the Command's callback
 * @param {Array} arguments     Arguments to pass to the Command's callback
 * @throws Error                When the command does not exist
 */
CommandParser.prototype.execute = function(command, args) {
    if (!this.commands[command]) {
        throw new Error("Command '" + command + "' not found. Registered commands: " + Object.keys(this.commands).join(', '));
    }

    // Get the command to execute
    var cmd = this.commands[command];

    // Apply the arguments to the command `exec` function
    cmd.execute(args);
};

/**
 * Start parsing with the given arglist. If no arglist is specified process.argv will be used. 
 * The fist two parameters will be sliced of process.argv.
 *
 * The special options `-h`, `--help`, `-v` and `--version` can be specified before 
 * a command to print CommandParser's help and version information.
 */
CommandParser.prototype.parse = function(arglist) {
    arglist = arglist || process.argv.slice(2);

    var parsed  = Command.prototype.parse.call(this, arglist);

    // TODO: process options
    if (parsed.data.version) {
        console.log(this.name + " version " + this.versionNumber);
    }
    else if (parsed.data.help) {
        // Check for command and display help
        this.help(parsed.next);
    }
    else {
        // TODO: Check if the command exists
        if (undefined === parsed.next) {
            // No command given
            console.log("No command given or command does not exist");
            this.help();
            return;
        }

        // Call setup with parser specific options?
        if (this.setup) {
            this.setup.call(this, parsed.data);
        }

        // Execute the command
        this.execute(parsed.next, parsed.args);
    }
};

/**
 * Print the help message. If no command is given the general help message is shown else the
 * commandlist will be consulted for the commands usage information.
 *
 * @param {String} command      Optional command to show help message for.
 */
CommandParser.prototype.help = function(command) {
    var lines = [];

    // Title?
    if (this.title && 0 < this.title.length) {
        lines.push(this.title, '');
    }

    if (command) {
        // Command specific usage
        var cmd = this.commands[command];
        lines.push("Usage: " + this.name + " " + (cmd.usage || cmd.name), "");
    }
    else {
        // General usage
        lines.push('Usage: ' + this.usage, '');

        // Check if we need to add commands to the help output
        var commands    = this.commands;
        var commandKeys = Object.keys(this.commands);
        if (0 < commandKeys.length) {
            lines.push('Commands:');
            commandKeys.forEach(function(key) {
                var command = commands[key];
                var line = '    ' + key;
                if (command.description) {
                    line += '     # ' + command.description;
                }
                lines.push(line);
            });

            lines.push('', "Use '" + this.name + " --help <command>' for command specific help");
        }
    }

    this.print(lines, false);
};

/**
 * Print the version information.
 */
CommandParser.prototype.version = function() {
    this.print(this.bin + ' version ' + this.versionNumber);
};

// Our awesome exports
exports = module.exports = CommandParser;
