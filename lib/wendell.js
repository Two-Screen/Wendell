/**
 * wendell.js
 *
 * Sergeant Wendell Sovens was an early Crucio siege tank operator, and installed a sophisticated
 * surround-sound system into his tank. As a result, he was cut off and surrounded when he failed
 * to hear the order to fall back. [1]
 *
 * [1](http://starcraft.wikia.com/wiki/Wendell_Sovens)
 *
 * @author      Mattijs Hoitink <mattijs@monkeyandmachine.com>
 * @copyright   2012, Two Screen
 * @license     MIT License
 */

var path    = require('path'),
    command = require('./command'),
    option  = require('./option');

/**
 * Wendell class
 *
 * @param {Object} options
 */
function Wendell(options) {
    options = options || {};

    this.commands   = {};
    this.args       = [];

    this.bin     = options.bin   || path.basename(process.argv[1]);
    this.title   = options.title || "";
    this.usage   = options.usage || this.bin + " [-h, --help] [-v, --version] COMMAND [OPTIONS]";
    this.versionNumber = "1.0.0";
}

/**
 * Print one or multiple lines.
 *
 * @param {String} message  The message to print
 * @return {Wendell}        Fluent interface
 */
Wendell.prototype.print = function(lines, prefix) {
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
 * Execute a Wendell registered command
 *
 * @param {String} command      Command name
 * @param {Object} options      Parsed options
 * @param {Array} arguments     Parsed arguments
 * @throws Error                When the command does not exist
 */
Wendell.prototype.execute = function(command, opts, args) {
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
 * Order Wendell to run. Wendell will parse process.argv for commands and options.
 *
 * The special options `-h`, `--help`, `-v` and `--version` can be specified before 
 * a command to print Wendell's help and version information.
 */
Wendell.prototype.order = function() {
    var args    = process.argv.slice(2);
    var command = args.shift();
    var options = {};

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
Wendell.prototype.help = function(command) {
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
Wendell.prototype.version = function() {
    this.print(this.bin + ' version ' + this.versionNumber);
};

/**
 * Register a command with Wendell. If an Object is passed as the config
 * a new Command is constructed from this config.
 *
 * @param {String|Command} command  The command or its name
 * @param {Object} config           The command configuration
 * @return {Wendell}                Fluent interface
 */
Wendell.prototype.command = function(command, config) {
    // Convert command name + configuration to Command Object
    if (!(command instanceof Command)) {
        if (typeof config === 'function') {
            config = { "callback": config };
        }
        config['name'] = command;

        command = new Command(config);
    }

    this.commands[command['name']] = command;
    return this;
};

/**
 * Wendell Command
 */
function Command(config) {
    this.name        = "";
    this.description = "";
    this.usage       = "";
    this.options     = [];
    this.callback    = null;

    // Process config
    if (config) {
        this.configure(config);
    }
}

/**
 * Configure the command
 * @param {Object} config
 * @return {Command}        Fluent interface
 */
Command.prototype.configure = function(config) {
    var accepted = ['name', 'description', 'usage', 'options', 'callback'];
    for (var key in config) {
        if (!Object.prototype.hasOwnProperty.call(config, key)) continue;
        if (-1 === accepted.indexOf(key)) continue;

        this[key] = config[key];
    }
};

/**
 * Execute the command
 * @param {Array} arglist
 * @param {Object} this
 * @return {Command}        Fluent interface
 */
Command.prototype.execute = function(arglist, context) {
    context = context || this;
    this.callback.apply(context, arglist);
    return this;
};

function Option() {
    this.name     = "";
    this.shortOpt = "";
    this.longOpt  = "";
    this.meta     = "";
}



// Our awesome exports
exports = module.exports = {
    Wendell: Wendell,
    Command: Command,
    Option:  Option
};
