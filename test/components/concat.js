describe("concat", function() {
  it("should concat 2 ports", async function() {
    let result = [];

    await Network.run(function collate_test() {
      let sender1  = this.proc(Emitter(["x", "y", "z"]));
      let sender0  = this.proc(Emitter(["a", "b", "c"]));
      let concat  = this.proc("sbp/components/concat", null, { "CTLFIELDS": [1] });
      let receiver = this.proc(Collector((ip) => result.push(ip)));

      this.connect(sender0.output("OUT"), concat.input("IN", 0));
      this.connect(sender1.output("OUT"), concat.input("IN", 1));
      this.connect(concat.output("OUT"), receiver.input("IN"));
    });

    expect(result).to.deep.equal(["a", "b", "c", "x", "y", "z"]);
  });
});
