var Option = require('./option');

// hasOwnProperty shorthand
var hasop = Object.prototype.hasOwnProperty;


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

            // Get the option config
            var optionConfig = config['options'][key];
            if (!optionConfig['name']) {
                optionConfig['name'] = key;
            }

            // Save the option
            this.options.push(new Option(optionConfig));
        }
    }
};

Command.prototype.parse = function(arglist) {
    arglist = arglist || process.argv.slice(2);

    console.log('parsing arglist');
    console.log(arglist);

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

// Our awesome exports
exports = module.exports = Command;
