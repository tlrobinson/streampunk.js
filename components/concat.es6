export default function* concat() {
  let array = this.inputArray('IN');
  let outPort = this.output("OUT");
  let ip;
  for (var i = 0; i < array.length; i++) {
    while ((ip = yield array[i].receive()) !== null) {
      yield outPort.send(ip);
    }
  }
}
