let
  projectDirectory = "/home/gpyh/autosvg";
in

with import <yarnpkgs>;
stdenv.mkDerivation {
  name = "autosvg";
  buildInputs = [ 
    stdenv
    nodejs
  ];
  shellHook = ''
    export BROWSER=chromium-browser
    zsh
  '';
}
