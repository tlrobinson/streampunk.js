
import Promise from "bluebird";

export default function Emitter(contents) {
  return function* emitter() {
    let outPort = this.output("OUT");
    for (let content of contents) {
      yield outPort.send(this.createIP(content));
    }
    outPort.end();
  }
}
