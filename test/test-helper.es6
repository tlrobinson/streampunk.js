import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
global.expect = chai.expect;

import { Network } from ".."
global.Network = Network;

import Collector from "../components/Collector"
global.Collector = Collector;

import Emitter from "../components/Emitter"
global.Emitter = Emitter;

import Promise from "bluebird";
global.Promise = Promise;

// https://github.com/russpowers/bluebird-mocha-generators/blob/master/index.js
import { Runnable } from "mocha";
let Runnable_prototype_run = Runnable.prototype.run;
Runnable.prototype.run = function (fn) {
  if (this.fn.constructor.name === "GeneratorFunction") {
    this.fn = Promise.coroutine(this.fn)
    this.sync = !(this.async = false);
  }
  return Runnable_prototype_run.call(this, fn);
}

Promise.defer = function() {
    var resolve, reject;
    var promise = new Promise(function() {
        resolve = arguments[0];
        reject = arguments[1];
    });
    return {
        resolve: resolve,
        reject: reject,
        promise: promise
    };
}

chai.use(function(chai, utils) {
  chai.Assertion.addProperty("ordered", function() {
    let count = 0;
    return Promise.all(this._obj.map((promise, index) => {
      return promise.then(() => {
        this.assert(
          count === index,
          "expected promises to resolve in order (" + index + " resolved at " + count + ")",
          "expected promises to not resolve in order",
          count,
          index
        );
        count++;
      });
    }));
  });
});

global.createOrderedExpectation = function(n) {
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
global.reslv = function(promise) {
  promise._resolve();
}
