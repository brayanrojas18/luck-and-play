"use strict";
const cron = require("node-cron");
const fs = require("fs");
var moment = require("moment-timezone");
// moment.locale('es-us')
moment.tz.setDefault("America/Caracas");

// var key = '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'
// var key = 'sk_test_qCGHz57M5hWmig1aierD8RhM00Q9AWqxDL'
// const stripe = require('stripe')(key);

module.exports = async function (app, cb) {
  /*
   * The `app` object provides access to a variety of LoopBack resources such as
   * models (e.g. `app.models.YourModelName`) or data sources (e.g.
   * `app.datasources.YourDataSource`). See
   * https://loopback.io/doc/en/lb3/Working-with-LoopBack-objects.html
   * for more info.
   */

  app.models.Event.createEvent("cooper");
  // app.models.Event.createEvent('silver')
  // app.models.Event.createEvent('gold')
  // app.models.Event.createEvent('diamond')
  // app.models.Event.createEvent('rhodium')
  // app.models.Event.createEvent('platinum')

  async function initCheckTransactions() {
    let transactions = await app.models.Transaction.find({
      where: {
        confirmed: false,
      },
    });

    for (let transaction of transactions) {
      await transaction.check();
    }

    setTimeout(initCheckTransactions, 1000);
  }

  initCheckTransactions();

  process.nextTick(cb); // Remove if you pass `cb` to an async function yourself
};
