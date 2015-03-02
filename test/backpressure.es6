import copier from "../components/copier";

// These tests (and the back-pressure implementation itself) is a work in progress.
// See this for a description of the problem and possible solution:
// https://github.com/dominictarr/pull-stream#transparent-backpressure--laziness

describe("Port backpressure", function() {
  it("capacity of 1 (default)", function *() {
    let _ = createOrderedExpectation(5);

    function* sender() {
      yield this.output("OUT").send("1");
      yield _[0];
      reslv(_[1]);
      yield this.output("OUT").send("2");
      yield _[2];
      reslv(_[3]);
      yield this.output("OUT").send("3");
      reslv(_[4]);
    }
    function* receiver() {
      expect(yield this.input("IN").receive()).to.equal("1");
      reslv(_[0]);
      expect(yield this.input("IN").receive()).to.equal("2");
      yield _[1];
      reslv(_[2]);
      yield _[3];
      yield _[4];
    }

    yield Network.run(function() {
      this.connect(this.proc(sender).output("OUT"), this.proc(receiver).input("IN"));
    });
    yield _;
  });
});

function reslv(promise) {
  promise._resolve();
}

function createOrderedExpectation(n) {
  let promises = [];
  for (let i = 0; i < n; i++) {
    let deferred = Promise.defer();
    deferred.promise._resolve = deferred.resolve;
    promises.push(deferred.promise);
  }
  let promise = expect(promises).to.be.ordered;
  for (let i = 0; i < n; i++) {
    promise[i] = promises[i];
  }
  return promise;
}
