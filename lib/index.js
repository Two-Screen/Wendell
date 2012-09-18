
/**
 * Default bin + date prefix method. This methode is
 * called within the CommanParser scope.
 * @param {String} line
 * @return {String}
 */
var datePrefix = function(line) {
    // Format date and time
    var date = new Date();
    var time = [date.getHours(), date.getMinutes(), date.getSeconds()].join(':');

    // Prefix the line
    return '[' + this.name + '] ' + time + ' ' + line;
};

// Just because I'm lazy
exports = module.exports = {
    Option:         require('./option'),
    createOption:   require('./option').createOption,
    Command:        require('./command').Command,
    createCommand:  require('./command').createCommand,
    CommandParser:  require('./parser'),
    prefixer:       datePrefix
};
