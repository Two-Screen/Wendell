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

var path    = require('path'),
    _       = require('underscore'),
    command = require('./command'),
    parse   = require('./parser').parse;

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

    this.commands   = {};

    this.bin     = options.bin   || path.basename(process.argv[1]);
    this.title   = options.title || "";
    this.usage   = options.usage || this.bin + " [-h, --help] [-v, --version] COMMAND [OPTIONS] [ARG, ...]";
    this.versionNumber = "1.0.0";
}

/**
 * Print one or multiple lines.
 *
 * @param {String} message  The message to print
 * @return {CommandParser}        Fluent interface
 */
CommandParser.prototype.print = function(lines, prefix) {
    if (typeof lines === 'string') {
        lines = [lines];
    }

    if (!Array.isArray(lines)) {
        throw new Error('Lines must be an Array or String');
    }

    // Do we need to prefix the line?
    prefix = 'undefined' !== typeof prefix ? prefix : true;

    var date, time, bin = this.bin;
    lines.forEach(function(line) {
        if (true === prefix) {
            date = new Date();
            time = [date.getHours(), date.getMinutes(), date.getSeconds()].join(':');
            line = '[' + bin + '] ' + time + ' ' + line;
        }

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
CommandParser.prototype.execute = function(command, opts, args) {
    if (!this.commands[command]) {
        throw new Error("Command '" + command + "' not found. Registered commands: " + Object.keys(this.commands).join(', '));
    }

    // Get the command to executer
    var cmd = this.commands[command];

    // Gather arguments to pass
    // Options are always the first argument, the other args are passed as positional arguments.
    args = [opts].concat(args);

    // Apply the arguments to the command `exec` function
    cmd.execute(args, this);
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
    //var command = args.shift();
    //var options = {};

    var parsed  = parse(arglist, [], _(this.commands).toArray()),
        command = null;
    while(parsed.next) {
        console.log(parsed);
        var next = parsed.next;

        command = this.getCommand(next);
        if (command) {
            parsed = parse(parsed.args, command.options, _(command.commands).toArray());
        }
    }

    // Check for help and version options, these are special cases
    if (0 <= ['-h', '--help'].indexOf(command)) {
        return this.help(args.shift());
    }
    else if (0 <= ['-v', '--version'].indexOf(command)) {
        return this.version();
    }

    // Check for proper usage
    if (!command) {
        this.print(['No command given.', '']);
        return this.help(args.shift());
    }
    else if (0 === command.indexOf('-')) {
        this.print(['Options must be specified after the command.', '']);
        return this.help(args.shift());
    }
    else if (!this.commands[command]) {
        this.print(['Command "' + command + '" not understood.', '']);
        return this.help(args.shift());
    }

    return this.execute(command, options, args);
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
        lines.push("Usage: " + this.bin + " " + (cmd.usage || cmd.name), "");
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

            lines.push('', "Use '" + this.bin + " --help <command>' for command specific help");
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

/**
 * Register a command with CommandParser. If an Object is passed as the config
 * a new Command is constructed from this config.
 *
 * @param {String|Command} cmd  The command or its name
 * @param {Object} config       The command configuration
 * @return {CommandParser}      Fluent interface
 */
CommandParser.prototype.command = function(cmd, config) {
    // Convert command name + configuration to Command Object
    if (!(command instanceof Command)) {
        command = command.createCommand(command, config);
    }

    this.commands[command.name] = command;
    return this;
};

/**
 * Remove a Command from the CommandParser
 * @param {String} name     The name of the Command or the Command object to remove
 * @return CommandParser    Fluent interface
 */
CommandParser.prototype.removeCommand = function(name) {
    if (name instanceof Command) {
        name = name.name;
    }

    delete this.commands[name];
    return this;
};

/**
 * Get a Command from the CommandParser
 * @param {String} name     The name of the command
 * @return Command          The Command or NULL when it is not found
 */
CommandParser.prototype.getCommand = function(name) {
    return _(this.commands).has(name) ? this.commands[name] : null;
};

// Our awesome exports
exports = module.exports = CommandParser;
