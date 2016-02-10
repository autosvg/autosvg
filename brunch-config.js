exports.config = {
  paths: {
    public: "build/app",
    watched: [ "app", "lib" ]
  },
  files: {
    javascripts: {
      joinTo: {
        "script.js": [ "app/**", "lib/**", "node_modules/**" ]
      }
    },
    stylesheets: {
      joinTo: {
        "style.css": [ "app/styles/**", "node_modules/**" ]
      }
    }
  },
  conventions: {
    assets: [ "app/assets/**" ]
  },
  sourceMaps: "absoluteUrl",
  server: {
    run: true
  },
  npm: {
    enabled: true,
    globals: { log: "loglevel" },
    styles: { "skeleton.css": [ "skeleton.css" ] },
    whitelist: [ "asciidoctor.js" ]
  },
  modules: {
    nameCleaner: (path) => path
  },
  plugins: {
    babel: {
      presets: [ "es2015" ],
      ignore: [ ]
    },
    stylus: {
      linenos: true,
      firebug: true
    }
  },
  overrides: {
    pages: {
      sourceMaps: false,
      optimize: true,
      files: {
        javascripts: {
          joinTo: {
            "app/script.js": [ "app/**", "lib/**", "node_modules/**" ],
            "script.js" : [ "pages/**", "node_modules/**" ]
          }
        },
        stylesheets: {
          joinTo: {
            "app/style.css": [ "app/styles/**", "node_modules/**" ],
            "style.css": [ "pages/styles/**" ]
          }
        }
      },
      paths: {
        public: "build/pages",
        watched: [ "app", "lib", "pages" ]
      },
      conventions: {
        assets: [ "pages/assets/**" ]
      },
      plugins: {
        static: {
          processors: [
            require("./bakery")
          ]
        }
      }
    }
  }
};
