
import { Network } from ".."; 
import ForkProcess from "../components/ForkProcess";
import Emitter from "../components/Emitter";
import Collector from "../components/Collector";

Network.run(function copier_test() {
  let sender   = this.proc(Emitter([1,2,3,4]));
  let copy     = this.proc(ForkProcess(require.resolve("../components/copier.es6")));
  let receiver = this.proc(Collector((ip) => console.log(ip)));

  this.connect(sender.output("OUT"), copy.input("IN"));
  this.connect(copy.output("OUT"), receiver.input("IN"));
}).done();
