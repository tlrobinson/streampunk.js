
import Promise from "bluebird";
import Process from "./process";

export default class Network extends Process {
  constructor(func, name, parent) {
    super(func, name, parent);

    this._procs = [];
  }

  proc(func, name, initializations) {
    let proc = new Process(func, name, this);

    for (let input in initializations) {
      this.initialize(proc, input, initializations[input]);
    }
    this._procs.push(proc);

    return proc;
  }

  initialize(proc, port, value) {
    proc._inputs.port(port).write(value);
  }

  connect(sourcePort, destPort) {
    sourcePort.pipe(destPort);
  }

  run() {
    let self = this;
    return Promise.coroutine(function*() {
      var promise = super.run();
      yield Promise.all(self._procs.map((proc) => proc.run()));
      yield Promise.resolve(promise);
    })();
  }

  static run(func) {
    return new Network(func).run();
  }
}
