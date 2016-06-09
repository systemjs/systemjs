System.registerDynamic("npm:mocha@1.21.5.json", [], false, function() {
  return {
    "main": "mocha",
    "meta": {
      "mocha.js": {
        "deps": [
          "./mocha.css!"
        ],
        "exports": "mocha"
      }
    }
  };
});

System.registerDynamic("github:angular/bower-angular@1.4.8.json", [], false, function() {
  return {
    "main": "angular",
    "meta": {
      "angular.js": {
        "exports": "angular"
      }
    }
  };
});

System.registerDynamic("github:systemjs/plugin-css@0.1.20.json", [], false, function() {
  return {
    "main": "css"
  };
});

System.registerDynamic("github:twbs/bootstrap@3.3.6.json", [], false, function() {
  return {
    "main": "dist/js/bootstrap.js",
    "meta": {
      "dist/js/bootstrap.js": {
        "deps": [
          "jquery"
        ],
        "exports": "$"
      }
    }
  };
});

System.registerDynamic("github:systemjs/plugin-text@0.0.2.json", [], false, function() {
  return {
    "main": "text"
  };
});

System.registerDynamic("github:components/jquery@2.1.4.json", [], false, function() {
  return {
    "main": "jquery"
  };
});

System.registerDynamic("github:mbostock/d3@3.5.12.json", [], false, function() {
  return {
    "main": "d3",
    "meta": {
      "d3.js": {
        "exports": "d3",
        "format": "global"
      }
    }
  };
});

System.registerDynamic("github:jspm/nodelibs-util@0.2.0-alpha.json", [], false, function() {
  return {
    "main": "./util.js",
    "map": {
      "./isBuffer.js": {
        "~node": "./isBufferBrowser.js"
      }
    }
  };
});

System.registerDynamic("npm:domready@0.2.13.json", [], false, function() {
  return {
    "main": "ready.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    },
    "map": {
      "domready": "."
    }
  };
});

System.registerDynamic("npm:vkey@0.0.3.json", [], false, function() {
  return {
    "main": "index.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:invert-hash@0.0.0.json", [], false, function() {
  return {
    "main": "invert.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:lower-bound@0.0.3.json", [], false, function() {
  return {
    "main": "lb.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:iota-array@0.0.1.json", [], false, function() {
  return {
    "main": "iota.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:game-shell@0.1.4.json", [], false, function() {
  return {
    "main": "shell.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:gl-now@0.0.4.json", [], false, function() {
  return {
    "main": "index.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:ndarray-fft@0.1.0.json", [], false, function() {
  return {
    "main": "fft.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:ndarray-scratch@0.0.1.json", [], false, function() {
  return {
    "main": "scratch.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:ndarray-downsample2x@0.1.1.json", [], false, function() {
  return {
    "main": "downsample.js",
    "format": "cjs",
    "meta": {
      "*": {
        "globals": {
          "process": "process"
        }
      },
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:tile-mip-map@0.2.1.json", [], false, function() {
  return {
    "main": "mipmap.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:gl-texture2d@0.1.12.json", [], false, function() {
  return {
    "main": "texture.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:gl-tile-map@0.3.0.json", [], false, function() {
  return {
    "main": "tilemap.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:gl-buffer@0.1.2.json", [], false, function() {
  return {
    "main": "buffer.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:webglew@0.0.0.json", [], false, function() {
  return {
    "main": "webglew.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:gl-vao@0.0.3.json", [], false, function() {
  return {
    "main": "vao.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:gl-matrix@2.0.0.json", [], false, function() {
  return {
    "main": "dist/gl-matrix.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      },
      "dist/gl-matrix-min.js": {
        "format": "amd"
      },
      "src/gl-matrix.js.erb": {
        "format": "amd"
      }
    }
  };
});

System.registerDynamic("npm:esprima@1.0.4.json", [], false, function() {
  return {
    "main": "esprima.js",
    "format": "cjs",
    "meta": {
      "*": {
        "globals": {
          "process": "process"
        }
      },
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:cwise-parser@0.0.1.json", [], false, function() {
  return {
    "main": "index.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:cwise@0.3.4.json", [], false, function() {
  return {
    "main": "cwise.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:ndarray-fill@0.1.0.json", [], false, function() {
  return {
    "main": "index.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:cwise-compiler@0.0.0.json", [], false, function() {
  return {
    "main": "compiler.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:ndarray-ops@1.1.1.json", [], false, function() {
  return {
    "main": "ndarray-ops.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:is-buffer@1.1.1.json", [], false, function() {
  return {
    "main": "index.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      },
      "test/*": {
        "globals": {
          "Buffer": "buffer/global"
        }
      }
    }
  };
});

System.registerDynamic("npm:ndarray@1.0.18.json", [], false, function() {
  return {
    "main": "ndarray.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:cwise-compiler@0.1.0.json", [], false, function() {
  return {
    "main": "compiler.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:bit-twiddle@1.0.2.json", [], false, function() {
  return {
    "main": "twiddle.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:dup@1.0.0.json", [], false, function() {
  return {
    "main": "dup.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:typedarray-pool@1.1.0.json", [], false, function() {
  return {
    "main": "pool.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      },
      "pool.js": {
        "globals": {
          "Buffer": "buffer/global"
        }
      },
      "test/*": {
        "globals": {
          "Buffer": "buffer/global"
        }
      }
    }
  };
});

System.registerDynamic("npm:uniq@1.0.1.json", [], false, function() {
  return {
    "main": "uniq.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:iota-array@1.0.0.json", [], false, function() {
  return {
    "main": "iota.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:greedy-mesher@1.0.2.json", [], false, function() {
  return {
    "main": "greedy.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:bit-twiddle@0.0.2.json", [], false, function() {
  return {
    "main": "twiddle.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:dup@0.0.0.json", [], false, function() {
  return {
    "main": "dup.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:typedarray-pool@0.1.2.json", [], false, function() {
  return {
    "main": "pool.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:ao-mesher@0.2.10.json", [], false, function() {
  return {
    "main": "mesh.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("github:jspm/nodelibs-fs@0.2.0-alpha.json", [], false, function() {
  return {
    "main": "./fs.js"
  };
});

System.registerDynamic("npm:glsl-tokenizer@0.0.9.json", [], false, function() {
  return {
    "main": "index.js",
    "format": "cjs",
    "meta": {
      "*": {
        "globals": {
          "process": "process"
        }
      },
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:through@1.1.2.json", [], false, function() {
  return {
    "main": "index.js",
    "format": "cjs",
    "meta": {
      "*": {
        "globals": {
          "process": "process"
        }
      },
      "*.json": {
        "format": "json"
      }
    },
    "map": {
      "./test.js": "./test/index.js"
    }
  };
});

System.registerDynamic("npm:glsl-parser@0.0.9.json", [], false, function() {
  return {
    "main": "index.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    },
    "map": {
      "./lib.js": "./lib/index.js",
      "./test.js": "./test/index.js"
    }
  };
});

System.registerDynamic("github:jspm/nodelibs-stream@0.2.0-alpha.json", [], false, function() {
  return {
    "main": "./stream.js",
    "map": {
      "./stream.js": {
        "browser": "stream-browserify"
      }
    }
  };
});

System.registerDynamic("npm:isarray@0.0.1.json", [], false, function() {
  return {
    "main": "index.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:string_decoder@0.10.31.json", [], false, function() {
  return {
    "main": "index.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      },
      "index.js": {
        "globals": {
          "Buffer": "buffer/global"
        }
      }
    }
  };
});

System.registerDynamic("npm:process-nextick-args@1.0.6.json", [], false, function() {
  return {
    "main": "index.js",
    "format": "cjs",
    "meta": {
      "*": {
        "globals": {
          "process": "process"
        }
      },
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:util-deprecate@1.0.2.json", [], false, function() {
  return {
    "main": "node.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    },
    "map": {
      "./node.js": {
        "browser": "./browser.js"
      }
    }
  };
});

System.registerDynamic("github:jspm/nodelibs-events@0.2.0-alpha.json", [], false, function() {
  return {
    "main": "./events.js"
  };
});

System.registerDynamic("npm:base64-js@1.1.1.json", [], false, function() {
  return {
    "main": "lib/b64.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:ieee754@1.1.6.json", [], false, function() {
  return {
    "main": "index.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      },
      "test/*": {
        "globals": {
          "Buffer": "buffer/global"
        }
      }
    }
  };
});

System.registerDynamic("npm:isarray@1.0.0.json", [], false, function() {
  return {
    "main": "index.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:buffer@4.5.0.json", [], false, function() {
  return {
    "main": "index.js",
    "format": "cjs",
    "meta": {
      "*": {
        "globals": {
          "process": "process"
        }
      },
      "*.json": {
        "format": "json"
      },
      "test/constructor.js": {
        "globals": {
          "Buffer": "buffer/global"
        }
      },
      "test/node-es6/test-buffer-arraybuffer.js": {
        "globals": {
          "Buffer": "buffer/global"
        }
      },
      "test/node-es6/test-buffer-iterator.js": {
        "globals": {
          "Buffer": "buffer/global"
        }
      },
      "test/node/test-buffer-ascii.js": {
        "globals": {
          "Buffer": "buffer/global"
        }
      },
      "test/node/test-buffer-bytelength.js": {
        "globals": {
          "Buffer": "buffer/global"
        }
      },
      "test/node/test-buffer-concat.js": {
        "globals": {
          "Buffer": "buffer/global"
        }
      },
      "test/node/test-buffer-indexof.js": {
        "globals": {
          "Buffer": "buffer/global"
        }
      },
      "test/node/test-buffer-inspect.js": {
        "globals": {
          "Buffer": "buffer/global"
        }
      },
      "test/node/test-buffer.js": {
        "globals": {
          "Buffer": "buffer/global"
        }
      }
    }
  };
});

System.registerDynamic("github:jspm/nodelibs-buffer@0.2.0-alpha.json", [], false, function() {
  return {
    "main": "buffer.js",
    "map": {
      "./buffer.js": {
        "browser": "buffer-browserify"
      }
    }
  };
});

System.registerDynamic("npm:core-util-is@1.0.2.json", [], false, function() {
  return {
    "main": "lib/util.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      },
      "lib/*": {
        "globals": {
          "Buffer": "buffer/global"
        }
      },
      "test.js": {
        "globals": {
          "Buffer": "buffer/global"
        }
      }
    }
  };
});

System.registerDynamic("npm:inherits@2.0.1.json", [], false, function() {
  return {
    "main": "inherits.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    },
    "map": {
      "./inherits.js": {
        "browser": "./inherits_browser.js"
      }
    }
  };
});

System.registerDynamic("npm:readable-stream@2.0.5.json", [], false, function() {
  return {
    "main": "readable.js",
    "format": "cjs",
    "meta": {
      "*": {
        "globals": {
          "process": "process"
        }
      },
      "*.json": {
        "format": "json"
      },
      "lib/_stream_readable.js": {
        "globals": {
          "Buffer": "buffer/global"
        }
      },
      "lib/_stream_writable.js": {
        "globals": {
          "Buffer": "buffer/global"
        }
      }
    },
    "map": {
      "util": {
        "browser": "@empty"
      }
    }
  };
});

System.registerDynamic("npm:stream-browserify@2.0.1.json", [], false, function() {
  return {
    "main": "index.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      },
      "test/*": {
        "globals": {
          "Buffer": "buffer/global"
        }
      }
    }
  };
});

System.registerDynamic("github:jspm/nodelibs-process@0.2.0-alpha.json", [], false, function() {
  return {
    "main": "./process.js"
  };
});

System.registerDynamic("npm:through@2.3.8.json", [], false, function() {
  return {
    "main": "index.js",
    "format": "cjs",
    "meta": {
      "*": {
        "globals": {
          "process": "process"
        }
      },
      "*.json": {
        "format": "json"
      }
    },
    "map": {
      "./test.js": "./test/index.js"
    }
  };
});

System.registerDynamic("npm:glsl-exports@0.0.0.json", [], false, function() {
  return {
    "main": "index.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:uniq@0.0.2.json", [], false, function() {
  return {
    "main": "uniq.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:gl-shader@0.0.6.json", [], false, function() {
  return {
    "main": "index.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:ao-shader@0.2.3.json", [], false, function() {
  return {
    "main": "aoshader.js",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:voxel-demo@0.0.1.json", [], false, function() {
  return {
    "main": "shader",
    "format": "cjs",
    "meta": {
      "*.json": {
        "format": "json"
      }
    }
  };
});