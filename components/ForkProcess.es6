import { spawn } from "child_process";
import ProxyProcess from "../core/ProxyProcess.es6";

import { PassThrough } from "stream";
import { Socket } from "net";

export default function ForkProcess(componentPath) {
  let args = [
    '-e', 'require("babel/register"); require(' + JSON.stringify(module.filename) + ').runChild()',
    componentPath
  ];
  return function forkProcess() {
    let sub = spawn(process.execPath, args, { stdio: [0, 1, 2, "pipe"] });
    sub.stdio[3].writable = true; // HACK: https://github.com/dominictarr/mux-demux/issues/34
    return ProxyProcess.parent(this, sub.stdio[3], sub.stdio[3]);
  }
}

export function runChild() {
  let parent = new Socket({ fd: 3 });
  ProxyProcess.child(process.argv[1], parent, parent);
}
