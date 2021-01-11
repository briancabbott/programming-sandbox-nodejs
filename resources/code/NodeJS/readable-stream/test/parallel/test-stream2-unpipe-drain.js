"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

(function () {
  // Copyright Joyent, Inc. and other Node contributors.
  //
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to permit
  // persons to whom the Software is furnished to do so, subject to the
  // following conditions:
  //
  // The above copyright notice and this permission notice shall be included
  // in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  // USE OR OTHER DEALINGS IN THE SOFTWARE.

  /*<replacement>*/
  var bufferShim = require('safe-buffer').Buffer;
  /*</replacement>*/


  require('../common');

  var assert = require('assert/');

  var stream = require('../../');

  var TestWriter =
  /*#__PURE__*/
  function (_stream$Writable) {
    _inherits(TestWriter, _stream$Writable);

    function TestWriter() {
      _classCallCheck(this, TestWriter);

      return _possibleConstructorReturn(this, _getPrototypeOf(TestWriter).apply(this, arguments));
    }

    _createClass(TestWriter, [{
      key: "_write",
      value: function _write(buffer, encoding, callback) {
        console.log('write called'); // super slow write stream (callback never called)
      }
    }]);

    return TestWriter;
  }(stream.Writable);

  var dest = new TestWriter();

  var TestReader =
  /*#__PURE__*/
  function (_stream$Readable) {
    _inherits(TestReader, _stream$Readable);

    function TestReader() {
      var _this;

      _classCallCheck(this, TestReader);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(TestReader).call(this));
      _this.reads = 0;
      return _this;
    }

    _createClass(TestReader, [{
      key: "_read",
      value: function _read(size) {
        this.reads += 1;
        this.push(bufferShim.alloc(size));
      }
    }]);

    return TestReader;
  }(stream.Readable);

  var src1 = new TestReader();
  var src2 = new TestReader();
  src1.pipe(dest);
  src1.once('readable', function () {
    process.nextTick(function () {
      src2.pipe(dest);
      src2.once('readable', function () {
        process.nextTick(function () {
          src1.unpipe(dest);
        });
      });
    });
  });
  process.on('exit', function () {
    assert.strictEqual(src1.reads, 2);
    assert.strictEqual(src2.reads, 2);
  });
})();

(function () {
  var t = require('tap');

  t.pass('sync run');
})();

var _list = process.listeners('uncaughtException');

process.removeAllListeners('uncaughtException');

_list.pop();

_list.forEach(function (e) {
  return process.on('uncaughtException', e);
});