"use strict";

const handlebars = require("handlebars");
const fs = require("fs");
const read = fs.readFileSync;
const ls = fs.readdirSync;
const asciidoctor = require("./asciidoctor").asciidoctor;
const opal = require("./asciidoctor").opal;
const anymatch = require("anymatch");
const plantuml = require("node-plantuml");

function Baker() {
  const adocs = new Map();
  const matchers = [ "pages/docs/**" ];
  const options = opal.hash({
    header_footer: true,
    attributes: opal.hash({
      stylesheet: "style.css",
      stylesdir: "../",
      toc: "left",
      linkcss: true
    })
  });

  function convert(path) {
    if(adocs.has(path)) {
      return adocs.get(path);
    } else {
      let adoc = asciidoctor.$load(read(path).toString(), options);
      adocs.set(path, adoc);
      return adoc;
    }
  }

  function link(filename) {
    return {
      title: convert("pages/docs/" + filename).attributes.smap.doctitle,
      link: "docs/" + changeExt(filename, "html")
    };
  }

  this.handles = (filename) => anymatch(matchers, filename);

  this.compile = function(data, filename, callback) {
    const ext = filename.substr(filename.lastIndexOf(".") + 1, filename.length);

    if(ext == "adoc") {
      callback(
        null, [ {
          filename: changeExt(filename, "html"),
          content: convert(filename).$render()
        } ],
        null);
    } else {
      callback(null, [ {
        filename: filename,
        content: data
      } ],
      null);
    }
  };
}

function changeExt(filename, e) {
  return filename.substr(0, filename.lastIndexOf(".")) + "." + e;
}

module.exports = new Baker();
