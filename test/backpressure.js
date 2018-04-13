// These tests (and the back-pressure implementation itself) are a work in progress.
// See this for a description of the problem and possible solution:
// https://github.com/dominictarr/pull-stream#transparent-backpressure--laziness
describe("port backpressure", function() {
  it("capacity of 1 (default)", async function() {
    let _ = createOrderedExpectation(5);

    async function sender() {
      await this.output("OUT").send(this.createIP("1"));
      await _[0];
      reslv(_[1]);
      await this.output("OUT").send(this.createIP("2"));
      await _[2];
      reslv(_[3]);
      await this.output("OUT").send(this.createIP("3"));
      reslv(_[4]);
    }
    async function receiver() {
      expect(await this.input("IN").receiveContents()).to.equal("1");
      reslv(_[0]);
      expect(await this.input("IN").receiveContents()).to.equal("2");
      await _[1];
      reslv(_[2]);
      await _[3];
      await _[4];
      expect(await this.input("IN").receiveContents()).to.equal("3");
    }

    await Network.run(function() {
      this.connect(
        this.proc(sender).output("OUT"),
        this.proc(receiver).input("IN")
      );
    });
    await _;
  });
});
