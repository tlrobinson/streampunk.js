
import stream from "stream";
import Promise from "bluebird";

// Receives an IP, returning a Promise if no IPs are buffered
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

// Receives an IP, drops it, and returns the contents
// Convienent for IIPs, etc.
export function receiveContents() {
  return this.receive().then((ip) => {
    ip.drop();
    return ip.contents();
  });
}

// Sends an IP, return a promise which resolves when downstream port is available for writing
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
  stream.Readable.prototype.receiveContents = receiveContents;
  stream.Duplex.prototype.send = send;
  stream.Writable.prototype.send = send;
}

augementStream();
