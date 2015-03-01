
export default function *flatten() {
  let array;
  let input = this.input("IN");
  let output = this.output("OUT");
  while (array = yield input.receive()) {
    for (let item of array) {
      yield output.send(item);
    }
  }
}
