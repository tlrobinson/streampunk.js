
export default async function concat() {
  let array = this.inputArray('IN');
  let outPort = this.output("OUT");
  let ip;
  for (var i = 0; i < array.length; i++) {
    while ((ip = await array[i].receive()) !== null) {
      await outPort.send(ip);
    }
  }
}
