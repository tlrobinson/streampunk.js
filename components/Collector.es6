
export default function Collector(callback) {
  return function collector() {
    return this.input("IN").on("data", callback);
  }
}
