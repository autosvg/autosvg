let
  dir = "/home/gpyh/autosvg";
in

with import <yarnpkgs>;
stdenv.mkDerivation {
  name = "autosvg";
  buildInputs = [ 
    stdenv
    nodejs-5_x
    libuv
    python
  ];
  shellHook = ''
    export BROWSER=chromium-browser
    export PATH=${dir}/node_modules/.bin:$PATH
    export NODE_DIR=${nodejs-5_x}
    export CPATH=${nodejs-5_x}/include/node:${libuv}/include
    zsh
  '';
}
