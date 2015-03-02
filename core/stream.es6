
import stream from "stream";
import Promise from "bluebird";

export function receive() {
  let data = this.read();
  if (data === null) {
    if (this._readableState.ended) {
      return Promise.resolve(null);
    } else {
      return new Promise((resolve, reject) => {
        let readableListener = () => { cleanup(); resolve(this.receive()); }
        let endListener = () => { cleanup(); resolve(null); } // reject(new Error("Stream closed"))
        let cleanup = () => { this.removeListener("readable", readableListener); this.removeListener("end", endListener); }
        this.on("readable", readableListener);
        this.on("end", endListener);
      });
    }
  } else {
    return Promise.resolve(data);
  }
}

export function send(ip) {
  let result = this.write(ip);
  if (result === false) {
    return new Promise((resolve, reject) => {
      let drainListener = () => { cleanup(); resolve(); }
      let endListener = () => { cleanup(); reject(new Error("Stream ended")); }
      let cleanup = () => { this.removeListener("drain", drainListener); this.removeListener("end", endListener); }
      this.on("drain", drainListener);
      this.on("end", endListener);
    });
  } else {
    return Promise.resolve();
  }
}

export function augementStream() {
  stream.Readable.prototype.receive = receive;
  stream.Duplex.prototype.send = send;
  stream.Writable.prototype.send = send;
}

augementStream();
