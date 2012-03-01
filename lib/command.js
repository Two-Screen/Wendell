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

module.exports = exports = {
    Command: Command,
    Option:  Option
};
