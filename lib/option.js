
// hasOwnProperty shorthand
var hasop = Object.prototype.hasOwnProperty;

/**
 * Retreive a value from an object safely with default parameter when key does not exist
 * @param {Object} object   The object to get the key from
 * @param {String} key      The key to get
 * @param mixed def         Default value when the key is not found
 * @return mixed            The value from the key or the default value when the key is not found
 */
function getValue(object, key, def) {
    return hasop.call(object, key) ? object[key] : def;
}

/**
 * Prefix a value with dashes
 * @param {String} value    The value to prefix with dashes
 * @param {Number} amount   The number of dashes to prefix the value with
 */
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
 * Strip a value of leading dashes
 * @param {String} value    The value to strip the dashes from
 * @return String           The value stripped of dashes
 */
function stripLeadingDashes(value) {
    while('-' === value.charAt(0)) {
        value = value.substring(1);
    }
    return value;
}

/**
 * Command Option
 *
 * Configuration parameters:
 *  name  - the name for the Option. Will override constructor `name` parameter
 *  description - Description for the Option. Will appear in help messages
 *  short       - Short version for the Option
 *  long        - Long version for the Option
 *  type        - The type fot the Option. One of: string, bool(ean)
 *
 * @param {String} name     The name for the Option
 * @param {Object} config   The configuration for the Option
 */
function Option(name, config) {
    this.name        = '';
    this.description = '';
    this.shortOpt    = null;
    this.longOpt     = '';
    this.type        = 'boolean';
    this.default     = undefined;

    if ('object' === typeof name && !config) {
        config = name;
    } else {
        this.name = name;
        if (!config.name || 0 > config.name.length) {
            config.name = name;
        }
    }

    if (config) {
        this.configure(config);
    }
}

/**
 * Configure the Option. See `constructor` for possible values.
 * @param {Object} config
 */
Option.prototype.configure = function(config) {
    // The name is required
    this.name        = getValue(config, 'name', '');
    if (0 === this.name.length) {
        throw new Error('Name is required for an Option');
    }
    this.description = getValue(config, 'description', '');
    this.type        = getValue(config, 'type', 'boolean').toLowerCase();
    this.default     = getValue(config, 'default', undefined);

    // Get short and correct dashes
    this.shortOpt = getValue(config, 'short', null);
    if (this.shortOpt && 0 < this.shortOpt.length) {
        this.shortOpt = prefixWithDashes(this.shortOpt, 1);
    }

    // Get long option and correct dashes.
    // If no long option is given we take the name of the option
    this.longOpt = getValue(config, 'long', this.name.toLowerCase());
    this.longOpt = prefixWithDashes(this.longOpt, 2);
};

/**
 * Check if the Option has a default value
 * @return Boolean
 */
Option.prototype.hasDefault = function() {
    return undefined !== this.default;
};

/**
 * Get the long version for the Option. If `stripDashes` is set to true the 
 * long version will be returned without leading dashes.
 * @param {Boolean} stripDashes     If leading dashes should be stripped. Default: false
 * @return String                   The long version for the Option
 */
Option.prototype.getLongOpt = function(stripDashes) {
    var longOpt = this.longOpt;
    if (stripDashes) {
        longOpt = stripLeadingDashes(longOpt);
    }
    return longOpt;
};

/**
 * Get the short version for the Option. If `stripDashes` is set to true the 
 * short version will be returned without leading dashes.
 * @param {Boolean} stripDashes     If leading dashes should be stripped. Default: false
 * @return String                   The short version for the Option
 */
Option.prototype.getShortOpt = function(stripDashes) {
    var shortOpt = this.shortOpt;
    if (stripDashes) {
        shortOpt = stripLeadingDashes(shortOpt);
    }
    return shortOpt;
};

/**
 * Returns the Option signatiure for nopt
 * @return
 */
Option.prototype.signatures = function() {
    // Long signature
    var longSig = [this.getLongOpt(true)];
    switch(this.type) {
        case 'string':
            longSig.push(String);
            break;
        case 'boolean':
        case 'bool':
            longSig.push(Boolean);
            break;
        default:
            longSig.push(Boolean);
        break;
    }

    // Short signature
    var shortSig = null;
    if (this.getShortOpt()) {
        shortSig = [this.getShortOpt(true), this.getLongOpt()];
    }

    return [longSig, shortSig];
};

// Our awsome export products
exports = module.exports = {
    Option: Option,
    createOption: function(name, config) {
        return new Option(name, config);
    }
};
