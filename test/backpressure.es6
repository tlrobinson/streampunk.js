import copier from "../components/copier";

// These tests (and the back-pressure implementation itself) are a work in progress.
// See this for a description of the problem and possible solution:
// https://github.com/dominictarr/pull-stream#transparent-backpressure--laziness

describe("Port backpressure", function() {
  it("capacity of 1 (default)", function *() {
    let _ = createOrderedExpectation(5);

    function* sender() {
      yield this.output("OUT").send(this.createIP("1"));
      yield _[0];
      reslv(_[1]);
      yield this.output("OUT").send(this.createIP("2"));
      yield _[2];
      reslv(_[3]);
      yield this.output("OUT").send(this.createIP("3"));
      reslv(_[4]);
    }
    function* receiver() {
      expect(yield this.input("IN").receiveContents()).to.equal("1");
      reslv(_[0]);
      expect(yield this.input("IN").receiveContents()).to.equal("2");
      yield _[1];
      reslv(_[2]);
      yield _[3];
      yield _[4];
      expect(yield this.input("IN").receiveContents()).to.equal("3");
    }

    yield Network.run(function() {
      this.connect(this.proc(sender).output("OUT"), this.proc(receiver).input("IN"));
    });
    yield _;
  });
});
