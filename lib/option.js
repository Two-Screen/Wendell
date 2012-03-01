
// hasOwnProperty shorthand
var hasop = Object.prototype.hasOwProperty;

/**
 * Command Option
 */
function Option(name, config) {
    this.name     = "";
    this.shortOpt = "";
    this.longOpt  = "";
    this.meta     = "";
}

/**
 * Configure the Option
 */
Option.prototype.configure = function(config) {
    var accepted = ['name', 'description', 'usage', 'callback'];
    for (var key in config) {
        if (!hasop.call(config, key)) continue;
        if (-1 === accepted.indexOf(key)) continue;

        this[key] = config[key];
    }
};

exports = module.exports = Option;
