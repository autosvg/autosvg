"use strict";

const handlebars = require("handlebars");
const fs = require("fs");
const read = fs.readFileSync;
const ls = fs.readdirSync;
const asciidoctor = require("./asciidoctor").asciidoctor;
const opal = require("./asciidoctor").opal;
const anymatch = require("anymatch");

function Baker() {
  const adocs = new Map();
  const matchers = [ "pages/docs/**", "pages/index.hs" ];
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
      link: "docs/" + htmlExt(filename)
    };
  }

  this.handles = (filename) => anymatch(matchers, filename);

  this.compile = function(data, filename, callback) {
    const ext = filename.substr(filename.lastIndexOf(".") + 1, filename.length);

    if(ext  == "adoc") {
      callback(
        null, [ {
          filename: htmlExt(filename),
          content: convert(filename).$render()
        } ],
      null);
    } else if(ext == "hs") {
      const context = {
        documents: ls("pages/docs").map(link)
      };
      callback(
        null, [ {
          filename: htmlExt(filename),
          content: handlebars.compile(data)(context)
        } ], null);
    }
  };
}

function htmlExt(filename) {
  return filename.substr(0, filename.lastIndexOf(".")) + ".html";
}

module.exports = new Baker();
