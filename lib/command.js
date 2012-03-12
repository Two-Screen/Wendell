var option = require('./option');

// hasOwnProperty shorthand
var hasop = Object.prototype.hasOwnProperty;

/**
 * Wendell Command
 */
function Command(name, config) {
    this.name        = "";
    this.description = "";
    this.usage       = "";
    this.options     = [];
    this.callback    = null;
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
 * Configure the command
 * @param {Object} config
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
 * Add a subcommand to this Command
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
 * Execute the command
 * @param {Array} arglist
 * @param {Object} this
 * @return {Command}        Fluent interface
 */
Command.prototype.execute = function(arglist, context) {
    context = context || this;
    if (this.callback) {
        this.callback.apply(context, arglist);
    }
    return this;
};

// Our awesome export products
exports = module.exports = {
    Command: Command,
    createCommand: function(name, config) {
        return new Command(name, config);
    }
};
