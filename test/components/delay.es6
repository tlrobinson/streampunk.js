import delay from "../../components/delay";

const DELAY_SCALE = 0.20;

describe("delay", function() {
  it("should send from Emitter to Collector via delay", function *() {
    let result = [];

    yield Network.run(function copier_test() {
      let sender0   = this.proc(Emitter([1,2,3,4]), "sender0");
      let delay0    = this.proc(delay, "delay0", { "INTVL": 100 * DELAY_SCALE });
      let receiver0 = this.proc(Collector((ip) => result.push(ip)), "receiver0");

      this.connect(sender0.output("OUT"), delay0.input("IN"));
      this.connect(delay0.output("OUT"), receiver0.input("IN"));
    });

    expect(result).to.deep.equal([1,2,3,4]);
  });

  it("should delay correct amounts", function* () {
    let result = [];

    yield Network.run(function delay_test() {
      let sender0   = this.proc(Emitter(["100 (a)", "200 (a)", "300 (a)", "400 (a)"]), "sender0");
      let sender1   = this.proc(Emitter(["250 (b)", "500 (b)", "750 (b)"]), "sender1");
      let delay0    = this.proc(delay, "delay0", { "INTVL": 100 * DELAY_SCALE });
      let delay1    = this.proc(delay, "delay1", { "INTVL": 250 * DELAY_SCALE });
      let receiver0 = this.proc(Collector((ip) => result.push(ip)), "receiver0");

      this.connect(sender0.output("OUT"), delay0.input("IN"));
      this.connect(sender1.output("OUT"), delay1.input("IN"));
      this.connect(delay0.output("OUT"), receiver0.input("IN"));
      this.connect(delay1.output("OUT"), receiver0.input("IN"));
    });

    expect(result).to.deep.equal(["100 (a)", "200 (a)", "250 (b)", "300 (a)", "400 (a)", "500 (b)", "750 (b)"]);
  });
});
