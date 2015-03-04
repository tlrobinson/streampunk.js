describe("nested networks", function() {
  it("should work with 2 levels", function *() {
    let result = [];

    yield Network.run(function level1() {
      let sender   = this.proc(Emitter([1,2,3,4]));
      let receiver = this.proc(Collector((ip) => result.push(ip)));

      let sub = this.net(function level2() {
        let copy = this.proc("sbp/components/copier");
        this.connect(this.input("IN"), copy.input("IN"));
        this.connect(copy.output("OUT"), this.output("OUT"));
      });

      this.connect(sender.output("OUT"), sub.input("IN"));
      this.connect(sub.output("OUT"), receiver.input("IN"));
    });

    expect(result).to.deep.equal([1,2,3,4]);
  });
});
