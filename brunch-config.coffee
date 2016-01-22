exports.config =
  # See http://brunch.io/#documentation for docs.
  files:
    javascripts:
      joinTo: 'app.js'
    stylesheets:
      joinTo: 'app.css'
      order:
        before: 'app/styles/frameworks/*.css'
  sourceMaps: 'absoluteUrl'
  server:
    run: yes
  npm:
    enabled: true
