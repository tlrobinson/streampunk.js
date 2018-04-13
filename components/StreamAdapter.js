import { Transform } from "stream";

export default function StreamAdapter(stream, encoding) {
  return function streamAdapter() {
    if (stream.writable) {
      this.input("IN")
        .pipe(new UnwrapIP(this))
        .pipe(stream);
    }
    if (stream.readable) {
      if (encoding != null) {
        stream.setEncoding(encoding);
      }
      stream.pipe(new WrapIP(this)).pipe(this.output("OUT"));
    }
  };
}

export class UnwrapIP extends Transform {
  constructor(proc) {
    super({ allowHalfOpen: false, objectMode: true });
    this._proc = proc;
  }
  _transform(ip, encoding, callback) {
    this._proc.drop(ip);
    callback(null, ip.contents());
  }
}

export class WrapIP extends Transform {
  constructor(proc) {
    super({ allowHalfOpen: false, objectMode: true });
    this._proc = proc;
  }
  _transform(data, encoding, callback) {
    callback(null, this._proc.createIP(data));
  }
}
