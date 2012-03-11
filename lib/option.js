
// hasOwnProperty shorthand
var hasop = Object.prototype.hasOwnProperty;

// Retreive a value from an object safely with default parameter when key does not exist
function getValue(object, key, def) {
    return hasop.call(object, key) ? object[key] : def;
}

// Prefix a value with dashes
function prefixWithDashes(value, amount) {
    // Remove any leading dashes
    value = value.replace(/^([\-]*)/, '');

    // Add the correct number of dashes
    var prefix = '', dash = '-';
    while (amount > 0) {
        if (amount & 1) prefix += dash;
        amount >>= 1, dash += dash;
    };

    return prefix + value;
}

/**
 * Command Option
 * @param {String} name
 * @param {Object} config
 */
function Option(name, config) {
    this.name        = '';
    this.description = '';
    this.short       = '';
    this.long        = '';
    this.action      = 'store_true';

    if ('object' === typeof name && !config) {
        config = name;
    } else {
        this.name = name;
    }

    if (config) {
        this.configure(config);
    }
}

/**
 * Configure the Option
 * @param {Object} config
 */
Option.prototype.configure = function(config) {
    // The name is required
    this.name        = getValue(config, 'name', '');
    if (0 === this.name.length) {
        throw new Error('Name is required for an Option');
    }
    this.description = getValue(config, 'description', '');
    this.action      = getValue(config, 'action', 'store_true');

    // Get short and correct dashes
    this.short = getValue(config, 'short', '');
    if (0 < this.short.length) {
        this.short = prefixWithDashes(this.short, 1);
    }

    // Get long option and correct dashes.
    // If no long option is given we take the name of the option
    this.long = getValue(config, 'long', this.name.toLowerCase());
    this.long = prefixWithDashes(this.long, 2);
};

// Our awsome exports
exports = module.exports = Option;
