This project is an experimental "classical" Flow-based programming-like system for JavaScript, providing an idiomatic JavaScript API requiring minimal boilerplate, implemented using standard JavaScript constructs. It aims to support major JavaScript platforms, including Node.js and browsers.

The core API uses [Streams](http://nodejs.org/api/stream.html) (and eventually [here](https://streams.spec.whatwg.org/)) and [Promises](https://promisesaplus.com/). It also supports [coroutines](https://github.com/petkaantonov/bluebird/blob/master/API.md#promisecoroutinegeneratorfunction-generatorfunction---function) via ECMAScript 6 generator functions and `yield`, providing a style familiar to users of other classical-FBP systems.

It is implemented in ECMAScript 6, via [Babel](https://babeljs.io/).

This project is inspired by J. Paul Morrison's [jsfbp](https://github.com/jpaulm/jsfbp) project, and, of course, his larger body of work on FBP.

Usage
-----
    
    npm install
    npm test

    npm install -g babel
    babel-node examples/reverse.es6
    
Features
--------

* "classical mode" components: traditional FBP `send` and `recieve` API (returns a promise, which can be `yield`ed in a generator function)
* "reactive mode"  components: Node.js Stream API (e.x. `pipe`, `.on("data", ...)`, `.write(...)`, etc)
* mix and match classical and reactive components.
* compatibility with Node.js text/binary streams via `StreamAdapter`
* array ports, as well as named and nested ports
* rich object IPs (e.x. all types supported by JSON: strings, numbers, boolean, array, object)

Example Components
------------------

The following are examples of a trivial "copier" component written in 3 different styles:

### Stream

    function copier() {
      this.input("IN").pipe(this.output("OUT"));
    }

This uses `Stream`'s `pipe` API to pipe the input to the output (automatically handling back-pressure, and closing the output stream when the input stream ends)

### Classical

    function* copier() {
      let ip;
      while ((ip = yield this.input('IN').receive()) !== null) {
        yield this.output('OUT').send(ip);
      }
    }

Note the use of a generator function, which allows `yield`ing of the Promises returned by `send` and `receive`. These methods use `Stream`'s backpressure facilities (`write()` returning false and the `drain` event) internally to pause execution. The process ends when the generator function returns (regardless of whether the output streams have been closed).

### Reactive

    function copier() {
      this.input("IN").on("data", (ip) => {
        if (this.output("OUT").write(ip) === false) {
          this.input("IN").pause();
        }
      });
      this.input("IN").on("finish", () => {
        this.output("OUT").end();
      });
      this.output("OUT").on("drain", () => {
        this.input("IN").resume();
      });
    }

Note this version must manually handle back-pressure via the input port's `pause()` and `resume()` functions, and the output port's `write()` return value and `drain` event.

Caveats
-------

While there is no reason this project can't support them, it does not yet support the following:

* tracking IPs from creation through destruction
* bracket IPs and substreams
* deadlock detection
