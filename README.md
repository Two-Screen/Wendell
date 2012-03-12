# Wendell

> Sergeant Wendell Sovens was an early Crucio siege
> tank operator, and installed a sophisticated surround-sound system into his tank. As a result, he
> was cut off and surrounded when he failed to hear the order to fall back. [1]

[1] [http://starcraft.wikia.com/wiki/Wendell_Sovens](http://starcraft.wikia.com/wiki/Wendell_Sovens)


## Resources
- https://bitbucket.org/panzi/javascript-utils/src/a6e6d56d4227/optparse/optparse.js
- https://github.com/jpolo/node-argparse
- https://github.com/isaacs/arg-parse-js
- https://github.com/jfd/optparse-js
- https://gist.github.com/982499

## Description

Wendell lets you parse command line arguments based on commands with options.

## Synopsis

```javascript

var wendell = new Wendell({ "bin": "battlecruiser" });

wendell.command('start', function(options, component) {
    console.log('  -> Starting battlecruiser ' + component);
});

```

    $ battlecruiser --help
    Usage: battlecruiser [-h, --help] [-v, --version] COMMAND [OPTIONS]

    Commands:
        start     # start a battlecruiser component


    $ battlecruiser start engine
      -> Starting battlecruiser engine

## Install

    $ npm install wendell

## Tests

    $ npm install
    $ make test

## License

MIT License

Copyright (C) 2012, Two Screen

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
