exports.config = {
  paths: {
    public: "public",
    watched: [ "app", "lib" ]
  },
  files: {
    javascripts: {
      joinTo: "app.js"
    },
    stylesheets: {
      joinTo: "app.css"
    }
  },
  sourceMaps: "absoluteUrl",
  server: {
    run: true
  },
  npm: {
    enabled: true,
    globals: { log: "loglevel" },
    styles: { "skeleton.css": [ "skeleton.css" ] }
  },
  modules: {
    nameCleaner: (path) => path,
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
  }
};
