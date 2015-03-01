import collate from "../../components/collate"

describe("collate", function() {
  it("should collate based on a single field", function *() {
    // this.timeout(0);
    let result = [];

    yield Network.run(function collate_test() {
      let sender0  = this.proc(Emitter(["1,m1","2,m2","3,m3"]));
      let sender1  = this.proc(Emitter(["1,d11","1,d12","2,d21","3,d31","3,d32","3,d33","4,d41"]));
      let collate1 = this.proc(collate, "collate", { "CTLFIELDS": [1] });
      let receiver = this.proc(Collector((ip) => result.push(ip)));

      this.connect(sender0.output("OUT"), collate1.input("IN", 0));
      this.connect(sender1.output("OUT"), collate1.input("IN", 1));
      this.connect(collate1.output("OUT"), receiver.input("IN"));
    });

    expect(result).to.deep.equal(["1,m1", "1,d11", "1,d12", "2,m2", "2,d21", "3,m3", "3,d31", "3,d32", "3,d33", "4,d41"]);
  });
});
