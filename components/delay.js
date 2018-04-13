
export default async function delay() {
  let interval = await this.input("INTVL").receiveContents();
  let inPort = this.input("IN");
  let outPort = this.output("OUT");
  let ip;
  while ((ip = await inPort.receive()) !== null) {
    await Promise.delay(interval);
    await outPort.send(ip);
  }
}
