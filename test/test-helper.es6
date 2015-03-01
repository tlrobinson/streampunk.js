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
