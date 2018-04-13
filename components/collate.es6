export default async function collate() {
  let ctlfields = this.input('CTLFIELDS');
  let inportArray = this.inputArray('IN');
  let outport = this.output('OUT');

  let fields = await ctlfields.receiveContents();
  let totalFieldLength = fields.reduce((acc, n) => acc + n, 0);

  let portCount = inportArray.length;
  let ips = [];
  for (let portIndex = 0; portIndex < portCount; portIndex++) {
    ips[portIndex] = await inportArray[portIndex].receive();
    if (ips[portIndex] === null) {
      portCount--;
    }
  }

  while (portCount) {
    let lowestIndex = 0;
    let lowestKey = "\uffff";
    for (let portIndex = 0; portIndex < ips.length; portIndex++) {
      if (ips[portIndex] !== null) {
        let key = ips[portIndex].contents().substring(0, totalFieldLength);
        if (key < lowestKey) {
          lowestKey = key;
          lowestIndex = portIndex;
        }
      }
    }

    await outport.send(ips[lowestIndex]);

    ips[lowestIndex] = await inportArray[lowestIndex].receive();
    if (ips[lowestIndex] === null) {
      portCount--;
    }
  }
}
