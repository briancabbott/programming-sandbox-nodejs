'use strict';
// This test asserts that Stream.prototype.pipe does not leave listeners
// hanging on the source or dest.

var common = require('../common');
var stream = require('../../');
var inherits = require('inherits');
module.exports = function (t) {
  t.test('pipe cleanup', function (t) {
    if (/^v0\.8\./.test(process.version))
      return t.end();

    function Writable() {
      this.writable = true;
      this.endCalls = 0;
      require('stream').Stream.call(this);
    }
    inherits(Writable, require('stream').Stream);
    Writable.prototype.end = function() {
      this.endCalls++;
    };

    Writable.prototype.destroy = function() {
      this.endCalls++;
    };

    function Readable() {
      this.readable = true;
      require('stream').Stream.call(this);
    }
    inherits(Readable, require('stream').Stream);

    function Duplex() {
      this.readable = true;
      Writable.call(this);
    }
    inherits(Duplex, Writable);

    var i = 0;
    var limit = 100;

    var w = new Writable();

    var r;

    for (i = 0; i < limit; i++) {
      r = new Readable();
      r.pipe(w);
      r.emit('end');
    }
    t.equal(0, r.listeners('end').length);
    t.equal(limit, w.endCalls);

    w.endCalls = 0;

    for (i = 0; i < limit; i++) {
      r = new Readable();
      r.pipe(w);
      r.emit('close');
    }
    t.equal(0, r.listeners('close').length);
    t.equal(limit, w.endCalls);

    w.endCalls = 0;

    r = new Readable();

    for (i = 0; i < limit; i++) {
      w = new Writable();
      r.pipe(w);
      w.emit('close');
    }
    t.equal(0, w.listeners('close').length);

    r = new Readable();
    w = new Writable();
    var d = new Duplex();
    r.pipe(d); // pipeline A
    d.pipe(w); // pipeline B
    t.equal(r.listeners('end').length, 2);   // A.onend, A.cleanup
    t.equal(r.listeners('close').length, 2); // A.onclose, A.cleanup
    t.equal(d.listeners('end').length, 2);   // B.onend, B.cleanup
    t.equal(d.listeners('close').length, 3); // A.cleanup, B.onclose, B.cleanup
    t.equal(w.listeners('end').length, 0);
    t.equal(w.listeners('close').length, 1); // B.cleanup

    r.emit('end');
    t.equal(d.endCalls, 1);
    t.equal(w.endCalls, 0);
    t.equal(r.listeners('end').length, 0);
    t.equal(r.listeners('close').length, 0);
    t.equal(d.listeners('end').length, 2);   // B.onend, B.cleanup
    t.equal(d.listeners('close').length, 2); // B.onclose, B.cleanup
    t.equal(w.listeners('end').length, 0);
    t.equal(w.listeners('close').length, 1); // B.cleanup

    d.emit('end');
    t.equal(d.endCalls, 1);
    t.equal(w.endCalls, 1);
    t.equal(r.listeners('end').length, 0);
    t.equal(r.listeners('close').length, 0);
    t.equal(d.listeners('end').length, 0);
    t.equal(d.listeners('close').length, 0);
    t.equal(w.listeners('end').length, 0);
    t.equal(w.listeners('close').length, 0);
    t.end();
  });
}
