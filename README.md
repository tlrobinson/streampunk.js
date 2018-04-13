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

To try a browser example, run `make` then open "examples/browser/index.html" in the browser.

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

### Classical

    async function copier() {
      let ip;
      while ((ip = await this.input('IN').receive()) !== null) {
        await this.output('OUT').send(ip);
      }
    }

Note the use of a generator function, which allows `yield`ing of the Promises returned by `send` and `receive`. These methods use `Stream`'s backpressure facilities (`write()` returning false and the `drain` event) internally to pause execution. The process ends when the generator function returns (regardless of whether the output streams have been closed).

### Stream

Ports are just Node `Streams`, so you can pipe between them:

    function copier() {
      this.input("IN").pipe(this.output("OUT"));
    }

This uses `Stream`'s `pipe` API to pipe the input to the output (automatically handling back-pressure, and closing the output stream when the input stream ends)

The `StreamAdapter` component (and `WrapIP` and `UnwrapIP` Transform streams) can be used to adapt Node streams.

### Reactive

The following is much more verbose, but demonstrates using the raw EventEmitter/Stream API:

    function copier() {
      let IN = this.input("IN");
      let OUT = this.output("OUT");
      IN.on("data", (ip) => {
        if (OUT.write(ip) === false) {
          IN.pause();
        }
      });
      IN.on("finish", () => OUT.end());
      OUT.on("drain", () => IN.resume());
    }

Note this version must manually handle back-pressure via the input port's `pause()` and `resume()` functions, and the output port's `write()` return value and `drain` event.

Example Networks
----------------

    function delay_example() {
      let sender0   = this.proc(Emitter(["a","b","c"]), "sender0");
      let delay0    = this.proc(delay, "delay0", { "INTVL": 1000 });
      let receiver0 = this.proc(StreamAdapter(process.stdout), "receiver0");

      this.connect(sender0.output("OUT"), delay0.input("IN"));
      this.connect(delay0.output("OUT"), receiver0.input("IN"));
    }

This network defines 3 processes, a sender which simply sends 3 hard-coded IPs, a delay componenent which delays IPs for 1 second (configured with the INTVL port), and a receiver which sends the IPs' contents to the `stdout` stream.

TODO
----

* deadlock detection
* back pressure support is experimental/work-in-progress
