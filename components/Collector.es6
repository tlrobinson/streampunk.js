
export default function Collector(callback) {
  return function collector() {
    return this.input("IN").on("data", (ip) => {
      ip.drop();
      callback(ip.contents());
    });
  }
}
