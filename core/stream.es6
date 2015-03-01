
import stream from "stream";
import Promise from "bluebird";

export function receive(size) {
  let data = this.read();
  if (data === null) {
    if (this._readableState.ended) {
      return Promise.resolve(null);
    } else {
      return new Promise((resolve, reject) => {
        this.once("readable", () => resolve(this.read()));
        this.once("end", () => resolve(null));
        // this.once("end", () => reject(new Error("Stream closed")));
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
      this.once("drain", () => resolve());
      this.once("end", () => reject("Stream ended"));
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
