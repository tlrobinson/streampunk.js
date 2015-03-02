
import Promise from "bluebird";

export default function Emitter(ips) {
  return function* emitter() {
    let outPort = this.output("OUT");
    for (let ip of ips) {
      yield outPort.send(ip);
    }
    outPort.end();
  }
}
