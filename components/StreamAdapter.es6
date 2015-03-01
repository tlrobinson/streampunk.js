
export default function StreamAdapter(stream, encoding) {
  return function streamAdapter() {
    if (stream.writable) {
      this.input("IN").pipe(stream);
    }
    if (stream.readable) {
      if (encoding != null) {
        stream.setEncoding(encoding);
      }
      stream.pipe(this.output("OUT"));
    }
  }
}
