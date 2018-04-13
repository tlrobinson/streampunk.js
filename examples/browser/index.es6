
import { Network } from "../..";
import Collector from "../../components/Collector.es6";
import Emitter from "../../components/Emitter.es6";
import StreamAdapter from "../../components/StreamAdapter.es6";
import { PassThrough } from "stream";

async function reverse() {
  let ip;
  while (ip = await this.input("IN").receive()) {
    let reversed = ip.contents().toString().trim().split("").reverse().join("")+"\n";
    this.drop(ip);
    await this.output("OUT").send(this.createIP(reversed));
  }
  await this.output("OUT").send(this.createIP("done!\n"));
}

function log(str) {
  console.log(str);
  document.getElementById("console").innerText += str;
}

let inputStream = new PassThrough();
let inputField = document.getElementById("input");
window.go = function() {
  inputStream.write(inputField.value);
  inputField.value = "";
  inputField.focus();
}

Network.run(function reverse_example() {
  let sender0  = this.proc(Emitter(["epyt", "evoba", "dna", "sserp", "retne"]));
  let sender1  = this.proc(StreamAdapter(inputStream));
  let reverser = this.proc(reverse);
  let receiver = this.proc(Collector(log));
  this.connect(sender0.output("OUT"), reverser.input("IN"));
  this.connect(sender1.output("OUT"), reverser.input("IN"));
  this.connect(reverser.output("OUT"), receiver.input("IN"));
});
