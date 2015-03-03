export class IP {
  constructor(contents, owner) {
    this._key = Symbol();
    this._contents = contents;
    this.transferOwnership(owner);
  }

  contents() {
    return this._contents;
  }

  transferOwnership(newOwner) {
    if (this._owner) {
      delete this._owner._ownedIPs[this._key];
    }
    this._owner = newOwner;
    if (this._owner) {
      this._owner._ownedIPs[this._key] = this;
    }
  }

  drop() {
    this.transferOwnership(null);
  }

  isOwner(owner) {
    return owner === this._owner;
  }
}

export class OpenBracket extends IP {
}

export class CloseBracket extends IP {
}
