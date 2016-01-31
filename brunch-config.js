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
      joinTo: "app.css",
      order: {
        before: "app/styles/frameworks/*.css"
      }
    }
  },
  sourceMaps: "absoluteUrl",
  server: {
    run: true
  },
  npm: {
    enabled: true,
    globals: {log: "loglevel"}
  },
  modules: {
    nameCleaner: function(path) {
      console.log(path);
      return path;
    }
  }
};
