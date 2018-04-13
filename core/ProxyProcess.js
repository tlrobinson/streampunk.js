
import MuxDemux from "mux-demux";

import Process from "./Process";
import { WrapIP, UnwrapIP } from "../components/StreamAdapter";

export default class ProxyProcess extends Process {

  static child(component, readable, writable) {
    let proc = new ProxyProcess(component);
    let control;

    let mx = MuxDemux(handleStream);
    readable.pipe(mx).pipe(writable);

    function handleStream(stream) {
      let [type, ...args] = stream.meta.split(".");
      switch (type) {
        case "inputs":
          var port = proc._inputs.atPath(args);
          stream.pipe(new WrapIP(proc)).pipe(port);
          break;
        case "outputs":
          var port = proc._outputs.atPath(args);
          port.pipe(new UnwrapIP(proc)).pipe(stream);
          break;
        case "control":
          control = stream;
          control.on("data", handleControlMessage);
          break;
      }
    }

    function handleControlMessage(data) {
      switch (data.command) {
        case "run":
          proc.run().then(() => {
            control.write({ command: "end" });
            cleanup();
          }).catch(console.warn);
          break;
        default:
          console.warn("Unknown command:", data);
      }
    }

    function cleanup() {
      for (let output of proc._outputs.ports(true)) {
        output.end();
      }
      control.end();
      readable.end();
      // writable.end();
    }
  }

  static parent(proc, readable, writable) {

    let mx = MuxDemux();
    readable.pipe(mx).pipe(writable);

    let control = mx.createStream("control");
    control.on("data", handleControlMessage);

    for (let input of proc._inputs.ports(true)) {
      let stream = mx.createWriteStream(input._name);
      input.pipe(new UnwrapIP(proc)).pipe(stream);
    }

    for (let output of proc._outputs.ports(true)) {
      let stream = mx.createReadStream(output._name);
      stream.pipe(new WrapIP(proc)).pipe(output);
    }

    control.write({ command: "run" });

    function handleControlMessage(data) {
      switch (data.command) {
        case "end":
          cleanup();
          break;
        default:
          console.warn("Unknown command:", data);
      }
    }

    function cleanup() {
      for (let output of proc._outputs.ports(true)) {
        output.end();
      }
      control.end();
      // readable.end();
      // writable.end();
    }
  }
}
