const DELAY_SCALE = 0.2;

describe("delay", function() {
  it("should send from Emitter to Collector via delay", async function() {
    let result = [];

    await Network.run(function delay_test() {
      let sender = this.proc(Emitter([1, 2, 3, 4]));
      let delay = this.proc("sbp/components/delay", null, {
        INTVL: 100 * DELAY_SCALE
      });
      let receiver = this.proc(Collector(ip => result.push(ip)));

      this.connect(sender.output("OUT"), delay.input("IN"));
      this.connect(delay.output("OUT"), receiver.input("IN"));
    });

    expect(result).to.deep.equal([1, 2, 3, 4]);
  });

  it("should delay correct amounts", async function() {
    let result = [];

    await Network.run(function delay_test() {
      let sender0 = this.proc(
        Emitter(["100 (a)", "200 (a)", "300 (a)", "400 (a)"]),
        "sender0"
      );
      let sender1 = this.proc(
        Emitter(["250 (b)", "500 (b)", "750 (b)"]),
        "sender1"
      );
      let delay0 = this.proc("sbp/components/delay", "delay0", {
        INTVL: 100 * DELAY_SCALE
      });
      let delay1 = this.proc("sbp/components/delay", "delay1", {
        INTVL: 250 * DELAY_SCALE
      });
      let receiver = this.proc(Collector(ip => result.push(ip)));

      this.connect(sender0.output("OUT"), delay0.input("IN"));
      this.connect(sender1.output("OUT"), delay1.input("IN"));
      this.connect(delay0.output("OUT"), receiver.input("IN"));
      this.connect(delay1.output("OUT"), receiver.input("IN"));
    });

    expect(result).to.deep.equal([
      "100 (a)",
      "200 (a)",
      "250 (b)",
      "300 (a)",
      "400 (a)",
      "500 (b)",
      "750 (b)"
    ]);
  });
});
