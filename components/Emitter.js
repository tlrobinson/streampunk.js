export default function Emitter(contents) {
  return async function emitter() {
    let outPort = this.output("OUT");
    for (let content of contents) {
      await outPort.send(this.createIP(content));
    }
    outPort.end();
  };
}
