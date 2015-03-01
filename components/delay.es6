import Promise from "bluebird";

export default function* delay() {
  let interval = yield this.input("INTVL").receive();
  let inPort = this.input("IN");
  let outPort = this.output("OUT");
  let ip;
  while ((ip = yield inPort.receive()) !== null) {
    yield Promise.delay(interval);
    yield outPort.send(ip);
  }
}
