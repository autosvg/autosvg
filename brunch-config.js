exports.config = {
  paths: {
    public: "build/app",
    watched: [ "app", "lib" ]
  },
  files: {
    javascripts: {
      joinTo: {
        "app.js": /^(app|lib)/,
        "vendor.js": /^node_modules/
      }
    },
    stylesheets: {
      joinTo: {
        "style.css": /^app\/styles/,
        "vendor.css": /^node_modules/
      }
    }
  },
  conventions: {
    assets: [ "app/assets/**" ]
  },
  sourceMaps: "absoluteUrl",
  npm: {
    enabled: true,
    globals: { log: "loglevel", d3: "d3" },
    styles: { "skeleton.css": [ "skeleton.css" ] }
  },
  modules: {
    nameCleaner: (path) => path
  },
  plugins: {
    babel: {
      presets: [ "es2015" ]
    },
    jsdoc: {
      enabled: false,
      configfile: "jsdoc-config.json"
    }
  },
  overrides: {
    pages: {
      sourceMaps: false,
      optimize: true,
      files: {
        javascripts: {
          joinTo: {
            "app/app.js": /^app/,
            "app/lib.js": /^lib/,
            "app/vendor.js": /^node_modules/,
            "pages.js": /^pages/
          }
        },
        stylesheets: {
          joinTo: {
            "app/vendor.css": /^node_modules/,
            "app/style.css": /^app\/styles/,
            "style.css": /^pages\/styles/
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
        // static: {
        //   processors: [
        //     require("./bakery")
        //   ]
        // },
        jsdoc: {
          enabled: true
        }
      }
    }
  }
};
