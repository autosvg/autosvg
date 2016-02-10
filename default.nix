let
  projectDirectory = "/home/gpyh/autosvg";
in

with import <yarnpkgs>;
stdenv.mkDerivation {
  name = "autosvg";
  buildInputs = [ 
    nodejs
    # For Asciidoctor and Asciidoctor-diagram
    asciidoctor
    graphviz
    imagemagick
  ];
  shellHook = ''
    export BROWSER=chromium-browser
    export GEM_PATH=${projectDirectory}/.gem
    export GEM_HOME=${projectDirectory}/.gem
    zsh
  '';
}
