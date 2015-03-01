import { Network } from "..";
import delay from "../components/delay";
import Emitter from "../components/Emitter";
import Collector from "../components/Collector";

Network.run(function() {
  let sender   = this.proc(Emitter([1,2,3,4]));
  let copy     = this.proc(delay, null, { "INTVL": 1000 });
  let receiver = this.proc(Collector((ip) => console.log(ip)));

  this.connect(sender.output("OUT"), copy.input("IN"));
  this.connect(copy.output("OUT"), receiver.input("IN"));
  // alternatively: sender.output("OUT").pipe(receiver.input("IN"));
}).done();
