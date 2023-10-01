"use strict";
var ObjectID = require("mongodb").ObjectID;

module.exports = function (Shareholder) {
  Shareholder.observe("after save", async function (ctx) {
    ctx.instance.notify();
  });
  Shareholder.prototype.notify = function () {
    Shareholder.app.io.in("general").emit("token-changed", this.toJSON());
  };
};
