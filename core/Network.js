import Process from "./Process";

export default class Network extends Process {
  constructor(func, name, parent) {
    super(func, name, parent);

    this._procs = [];
  }

  proc(component, name, initializations) {
    let proc = new Process(component, name, this);
    this._addProc(proc, initializations);
    return proc;
  }

  net(func, name, initializations) {
    let proc = new Network(func, name, this);
    this._addProc(proc, initializations);
    return proc;
  }

  _addProc(proc, initializations) {
    for (let input in initializations) {
      this.initialize(proc, input, initializations[input]);
    }
    this._procs.push(proc);
  }

  initialize(proc, port, value) {
    proc._inputs.port(port).send(this.createIP(value));
  }

  connect(sourcePort, destinationPort, capacity) {
    sourcePort.pipe(destinationPort);
    if (arguments.length > 2) {
      // destinationPort._writableState.highWaterMark = capacity
      // destinationPort._readableState.highWaterMark = capacity
      sourcePort._writableState.highWaterMark = capacity
      sourcePort._readableState.highWaterMark = capacity
    }
  }

  async run() {
    let self = this;
    let promise = super.run();

    await Promise.all(self._procs.map((proc) => proc.run()));

    // log IPs that haven't been dropped
    self._procs.forEach((proc) => {
      proc.ownedIPs().forEach((ip) => self.warn(proc.name() + " still owns IP " + ip.contents()));
    });

    await Promise.resolve(promise);
  }

  static run(func) {
    return new Network(func).run();
  }
}
