#!/usr/bin/env babel-node

import { Network } from "..";
import StreamAdapter from "../components/StreamAdapter";

async function reverse() {
  let ip;
  while (ip = await this.input("IN").receive()) {
    let reversed = ip.contents().trim().split("").reverse().join("")+"\n";
    this.drop(ip);
    await this.output("OUT").send(this.createIP(reversed));
  }
  await this.output("OUT").send(this.createIP("done!\n"));
}

Network.run(function reverse_example() {
  var stdin    = this.proc(StreamAdapter(process.stdin, "utf8"), "stdin");
  var reverser = this.proc(reverse);
  var stdout   = this.proc(StreamAdapter(process.stdout), "stdout");
  this.connect(stdin.output("OUT"), reverser.input("IN"));
  this.connect(reverser.output("OUT"), stdout.input("IN"));
});
