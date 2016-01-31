with import <yarnpkgs>;
stdenv.mkDerivation {
  name = "autosvg";
  buildInputs = [ nodejs ];
}
