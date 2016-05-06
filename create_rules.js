var grammkit = require('grammkit');
var parse = require('pegjs/lib/parser').parse;
var fs = require('fs');
fs.readFile("lib/parser/grammar.peg", "utf8", function (err, data) {
  var grammar = parse(data);
  for(var i = 0; i < grammar.rules.length; i++) {
    fs.writeFile("rules/rules"+i+".svg", grammkit.diagram(grammar.rules[i]));
  }
});
