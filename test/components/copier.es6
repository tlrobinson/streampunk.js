import copier from "../../components/copier";

describe("copier", function() {
  it("should send from Emitter to Collector via copier", function *() {
    let result = [];

    yield Network.run(function copier_test() {
      let sender   = this.proc(Emitter([1,2,3,4]));
      let copy     = this.proc(copier);
      let receiver = this.proc(Collector((ip) => result.push(ip)));

      this.connect(sender.output("OUT"), copy.input("IN"));
      this.connect(copy.output("OUT"), receiver.input("IN"));
      // alternatively: sender.output("OUT").pipe(receiver.input("IN"));
    });

    expect(result).to.deep.equal([1,2,3,4]);
  });
});
