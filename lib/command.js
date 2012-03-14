var _      = require('underscore'),
    nopt   = require('nopt'),
    option = require('./option');

// hasOwnProperty shorthand
var hasop = Object.prototype.hasOwnProperty;

/**
 * Command for the Wendell CommandParser
 *
 * This creates a new Command that can be executed with a list of arguments. The contstuctor 
 * takes the name of the Command and/or a list of options.
 *
 * Configuration options:
 *   name        - The name for the Command
 *   description - Description for the Command. This will show up in the help
 *   usage       - Usage description for the Command. This will show up in the help
 *   options     - List of Options for the Command. See Command.prototype.option for
 *                 instructions on adding Options.
 *   callback    - The callback function when the Command is executed
 *   commands    - List of sub-commands for the Command. See Command.prototype.command for
 *                 instructions on adding commands.
 *
 * When only an object is passed in it is assumed this is the configuration. The name option 
 * from the configuration will override the name parameter from the constructor.
 *
 * name   - The name for the Command. Overridden by config.name when present
 * config - List of configuration options for the Command.
 *
 * Examples:
 *   var command = new Command('start', {
 *     'description': 'Start a riot',
 *     'callback': function(options) {
 *       console.log('Starting a riot');
 *     }
 *   }
 *
 * Returns a Command instance
 */
function Command(name, config) {
    this.name        = "";
    this.description = "";
    this.usage       = "";
    this.options     = [];
    this.callback    = undefined;
    this.commands    = {};

    if ('object' === typeof name && !config) {
        config = name;
    } else {
        this.name = name;
    }

    // Process config
    if (config) {
        this.configure(config);
    }
}

/**
 * Configure the Command. See the constructor documentation for possible options.
 *
 * @param {Object} config   The configuration object for the Command
 * @return {Command}        Fluent interface
 */
Command.prototype.configure = function(config) {
    var accepted = ['name', 'description', 'usage', 'callback'];
    for (var key in config) {
        if (!hasop.call(config, key)) continue;
        if (-1 === accepted.indexOf(key)) continue;

        this[key] = config[key];
    }

    // Check for options
    if (hasop.call(config, 'options')) {
        for (var key in config['options']) {
            if (!hasop.call(config['options'], key)) continue;
            if ('object' !== typeof config['options'][key]) continue;

            this.options.push(new option.createOption(key, config['options'][key]));
        }
    }
};

/**
 * Add a option to this Command
 * @param {String} name
 * @param {Object} config
 * @return Command          Fluent interface
 */
Command.prototype.option = function(name, config) {
    var option = option.createOption(name, config);
    return this.addOption(option);
};

/**
 * Add an Option to the Command
 * @param {Option} option
 * @return Command          Fluent interface
 */
Command.prototype.addOption = function(option) {
    this.options[option.name] = option;
    return this;
};

/**
 * Remove an Option from the Command
 * @param {String} name     The Option name or Option object to remove
 * @return Command          Fluent interface
 */
Command.prototype.removeOption = function(name) {
    if (name instanceof Option) {
        name = name.name;
    }

    delete this.options[name];
    return this;
};

/**
 * Register a sub-command. If an Object is passed as the config
 * a new Command is constructed from this config.
 *
 * @param {String} name_or_command   The command or its name
 * @param {Object} config The command configuration
 * @return {Command}      Fluent interface
 */
Command.prototype.command = function(name_or_command, config_or_callback) {
    if ('function' === typeof config_or_callback) {
        config_or_callback = { 'callback': config_or_callback };
    }

    // Convert command name + configuration to Command Object
    if (!(name_or_command instanceof Command)) {
        name_or_command = new Command(name_or_command, config_or_callback);
    }


    return this.addCommand(name_or_command);
};

/**
 * Add a sub-Command to this Command
 * @param {Command} command
 * @return Command
 */
Command.prototype.addCommand = function(command) {
    this.commands[command.name] = command;
    return this;
};

/**
 * Remove a Command from the Parser
 * @param {String} name     The name of the Command or the Command object to remove
 * @return Command          Fluent interface
 */
Command.prototype.removeCommand = function(name) {
    if (name instanceof Command) {
        name = command.name;
    }

    delete this.commands[name];
    return this;
};

/**
 * Get a Command by name
 * @param {String} name     The name of the command
 * @return Command          The Command or NULL when it is not found
 */
Command.prototype.getCommand = function(name) {
    return _(this.commands).has(name) ? this.commands[name] : null;
};

/**
 * Execute the command
 * @param {Array} arglist
 * @param {Object} this
 * @return {Command}        Fluent interface
 */
Command.prototype.execute = function(arglist, context) {
    context = context || this;

    // Parse arglist
    var parsed = this.parse(arglist);

    // Save arguments we received

    // Chain to the next command
    if (parsed.next) {
        var cmd = this.commands[parsed.next];
        cmd.execute(parsed.args);
    }
    // Execute our own callback if we have one
    else if (this.callback) {
        // Make sure the options data is the first parameter
        var args = [parsed.data].concat(parsed.args);
        this.callback.apply(context, args);
    }

    return this;
};

Command.prototype.parse = function(arglist) {
    // Get any known sub commands
    var commandNames = Object.keys(this.commands);

    // Get a (possible) position on the next command
    // Use for-loop so we can break out of it and not loop the entire list
    var argRegex = /^[^\-]+/, nextCommand = null, nextCommandIndex = null;
    for (var index = 0; index < arglist.length; index++) {
        var arg = arglist[index];
        if (argRegex.test(arg) && -1 < commandNames.indexOf(arg)) {
            // TODO: add check to see if this is the value for a possible previous option
            // TODO: add support for --
            nextCommand      = arg;
            nextCommandIndex = index;
            break;
        }
    }

    // Slice off the part that contains the options
    var optionArgs;
    if (null === nextCommandIndex) {
        // No command was found, all arguments are possible options
        optionArgs = arglist;
    }
    else if (0 === nextCommandIndex) {
        // The next command was the first argument so it has no options
        optionArgs = [];
    }
    else {
        // Only the arguments before the next command index can be options
        optionArgs = arglist.slice(0, nextCommandIndex);
    }

    // Prepare the arglist for the next command if there is one
    var nextCommandArgs = 0 <= nextCommandIndex ? arglist.slice(nextCommandIndex + 1) : [];

    // Create signature for the options
    var longOpts = {}, shortOpts = {}, defaults = {};
    this.options.forEach(function(option) {
        var signature = option.signatures();
        var longOpt = signature.shift();
        longOpts[longOpt.shift()] = longOpt.shift();

        var shortOpt = signature.shift();
        if (shortOpt) {
            shortOpts[shortOpt.shift()] = shortOpt.shift();
        }

        // Store option default
        if (option.hasDefault()) {
            defaults[option.name] = option.default;
        }
    });

    var parsed = nopt(longOpts, shortOpts, optionArgs, 0);

    // Get remaining arguments and delete the rest
    var args = parsed.argv.remain;
    delete parsed['argv'];

    // Merge parsed values with defaults
    parsed = _(parsed).defaults(defaults);

    // Give some feedback :P
    return {
        next: nextCommand,
        data: parsed,
        args: args.concat(nextCommandArgs)
    };
};



// Our awesome export products
exports = module.exports = {
    Command: Command,
    createCommand: function(name, config) {
        return new Command(name, config);
    }
};
