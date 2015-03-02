import delay from "../../components/delay";

describe("delay", function() {
  it("should send from Emitter to Collector via delay", function *() {
    let result = [];

    yield Network.run(function copier_test() {
      let sender   = this.proc(Emitter([1,2,3,4]));
      let copy     = this.proc(delay, null, { "INTVL": 10 });
      let receiver = this.proc(Collector((ip) => result.push(ip)));

      this.connect(sender.output("OUT"), copy.input("IN"));
      this.connect(copy.output("OUT"), receiver.input("IN"));
    });

    expect(result).to.deep.equal([1,2,3,4]);
  });

  it("should delay correct amounts", function* () {
    let result = [];

    yield Network.run(function delay_test() {
      let sender0  = this.proc(Emitter(["100 (a)", "200 (a)", "300 (a)", "400 (a)"]), "sen0");
      let sender1  = this.proc(Emitter(["250 (b)", "500 (b)", "750 (b)"]), "sen1");
      let delay0   = this.proc(delay, "del0", { "INTVL": 10 });
      let delay1   = this.proc(delay, "del1", { "INTVL": 25 });
      let receiver = this.proc(Collector((ip) => result.push(ip)), "rec0");

      this.connect(sender0.output("OUT"), delay0.input("IN"));
      this.connect(sender1.output("OUT"), delay1.input("IN"));
      this.connect(delay0.output("OUT"), receiver.input("IN"));
      this.connect(delay1.output("OUT"), receiver.input("IN"));
    });

    expect(result).to.deep.equal(["100 (a)", "200 (a)", "250 (b)", "300 (a)", "400 (a)", "500 (b)", "750 (b)"]);
  });
});
