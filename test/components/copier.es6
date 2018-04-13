describe("copier", function() {
  it("should send from Emitter to Collector via copier", async function() {
    let result = [];

    await Network.run(function copier_test() {
      let sender   = this.proc(Emitter([1,2,3,4]));
      let copier   = this.proc("sbp/components/copier");
      let receiver = this.proc(Collector((ip) => result.push(ip)));

      this.connect(sender.output("OUT"), copier.input("IN"));
      this.connect(copier.output("OUT"), receiver.input("IN"));
    });

    expect(result).to.deep.equal([1,2,3,4]);
  });
});
