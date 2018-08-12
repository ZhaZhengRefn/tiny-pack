
  (function(modules){
    function require(id) {
      const [fn, mapping] = modules[id];

      function localRequire(name) {
        return require(mapping[name])
      }

      const module = { exports: {} };

      fn(localRequire, module, module.exports);
      return module.exports
    }
    return require(0)
  })({0: [
      function(require, module, exports) {
        "use strict";

var _modB = require("./mod-b.js");

(0, _modB.b)();
      },
      {"./mod-b.js":1},
    ],
    1: [
      function(require, module, exports) {
        "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var b = exports.b = function b() {
  document.write('bbbbbb');
};
      },
      {},
    ],
    })
  