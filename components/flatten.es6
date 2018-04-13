
export default async functionflatten() {
  let array;
  let input = this.input("IN");
  let output = this.output("OUT");
  while (array = await input.receive()) {
    for (let item of array) {
      await output.send(item);
    }
  }
}
