var Network = require("..").Network;
var StreamAdapter = require("../components/StreamAdapter");

function* reverse() {
  let string;
  while (string = yield this.input("IN").receive()) {
    yield this.output("OUT").send(string.trim().split("").reverse().join("")+"\n");
  }
  yield this.output("OUT").send("done!\n");
}

Network.run(function reverse_example() {
  var stdin    = this.proc(StreamAdapter(process.stdin, "utf8"), "stdin");
  var reverser = this.proc(reverse);
  var stdout   = this.proc(StreamAdapter(process.stdout), "stdout");
  this.connect(stdin.output("OUT"), reverser.input("IN"));
  this.connect(reverser.output("OUT"), stdout.input("IN"));
});
