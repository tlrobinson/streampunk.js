describe("simple", function() {
  it("should send from Emitter to Collector", function *() {
    let result = [];

    yield Network.run(function simple_test() {
      let sender   = this.proc(Emitter([1,2,3,4]));
      let receiver = this.proc(Collector((ip) => result.push(ip)));
      this.connect(sender.output("OUT"), receiver.input("IN"));
    });

    expect(result).to.deep.equal([1,2,3,4]);
  });
});
