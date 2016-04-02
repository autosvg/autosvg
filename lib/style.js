/* style.js */

module.exports = Style;

function Style () {
  this.styles = {};
}

Style.prototype = {
  addStyle: function (style, value) {
    if(value != undefined) {
      this.styles[style] = value;
    } else {
      this.styles[style] = true;
    }
  },
  removeStyle: function (style) {
    delete this.styles[style];
  },
  getStyles: function () {
    return this.styles;
  }
};
