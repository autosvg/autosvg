with import <yarnpkgs>;
stdenv.mkDerivation {
  name = "autosvg";
  buildInputs = [ nodejs python ];
  shellHook = ''
    export $BROWSER=chromium-browser
  '';
}
