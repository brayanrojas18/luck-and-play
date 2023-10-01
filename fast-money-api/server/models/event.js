"use strict";

module.exports = function (Event) {
  Event.observe("before save", async function (ctx) {
    if (ctx.isNewInstance) {
      ctx.instance.eventNumber = await ctx.instance.getNextSequence();
    }
  });

  Event.observe("after save", async function (ctx) {
    if (ctx.isNewInstance) {
      ctx.instance.notify();
    } else {
      ctx.instance.verifyStatus();
    }
  });

  Event.prototype.getNextSequence = function () {
    var app = Event.app;
    var mongoConnector = app.dataSources.mongoDb.connector;

    return new Promise((resolve) => {
      mongoConnector
        .collection("counters")
        .findOneAndUpdate(
          { type: this.type },
          { $inc: { value: 1 } },
          { upsert: true, returnNewDocument: true },
          async function (_, sequence) {
            resolve(sequence.value ? sequence.value.value + 1 : 1);
          }
        );
    });
  };

  Event.prototype.notify = function () {
    Event.app.io.in("general").emit("new-event", this.toJSON());
  };

  Event.observe("before save", async function (ctx) {
    if (ctx.isNewInstance) {
      ctx.instance.tickets_available = ctx.instance.tickets_quantity;
    }
  });

  /**
   * Verificar la disponibilidad de un numero
   * @param {number} number numero a verificar
   * @param {Function(Error, boolean)} callback
   */

  Event.prototype.availableTicket = async function (number) {
    let verify = await Event.app.models.Transaction.findOne({
      where: {
        number,
        event_id: this.id,
      },
    });

    return verify ? false : true;
  };

  Event.prototype.buy = async function (transaction_id, wallet_id, number) {
    let verify = await this.availableTicket(number);

    if (!verify) {
      return {
        valid: false,
        message: "El número no está disponible",
      };
    }

    let verifyTransaction = await Event.app.models.Transaction.findOne({
      where: {
        transaction_id,
      },
    });

    if (verifyTransaction) {
      return {
        valid: false,
        message: "Transacción repetida",
      };
    }

    let data = await Event.app.models.Transaction.create({
      transaction_id,
      wallet_id,
      number,
      event_id: this.id,
      confirmed: false,
    });

    return {
      valid: true,
      data,
    };
  };

  Event.prototype.verifyStatus = async function () {
    if (!this.tickets_available && this.status == "active") {
      this.status = "finished";
      this.save();
    } else if (this.status == "finished") {
      Event.createEvent(this.type);
      if (!this.generated_winners) {
        await this.generateWinners();
        this.payWinners();
      }
    }
  };

  Event.prototype.generateWinners = async function () {
    let winners = [];

    while (winners.length < this.winner_numbers) {
      let number = randomIntFromInterval(1, this.tickets_quantity);
      if (!winners.includes(number)) {
        winners.push(number);
      }
    }

    Event.app.models.Transaction.updateAll(
      {
        event_id: this.id,
        confirmed: true,
        number: {
          inq: winners,
        },
      },
      {
        winner: true,
      }
    );

    this.generated_winners = true;
    this.save();

    console.log("numbers", winners);
  };

  Event.prototype.payWinners = async function () {
    var transaction = Event.app.models.Transaction;
    transaction = await transaction.find({
      where: {
        winner: true,
        event_id: this.id,
      },
    });
    transaction.forEach((v) => {
      v.pay();
    });
  };

  Event.createEvent = async function (type) {
    let event = await Event.findOne({
      where: {
        type,
        status: "active",
      },
    });

    let tickets = 0;
    let price = 0;
    let winner_numbers = 0;
    let winner_pay = 0;

    switch (type) {
      case "cooper":
        tickets = 100;
        price = 1;
        winner_numbers = 1;
        winner_pay = 90;
        break;
      // case 'silver':
      //   tickets = 2728
      //   price = 1.1
      //   winner_numbers = 30
      //   winner_pay = 97
      // break;
      // case 'gold':
      //   tickets = 10000
      //   price = 1.5
      //   winner_numbers = 30
      //   winner_pay = 485
      // break;
      // case 'diamond':
      //   tickets = 16667
      //   price = 1.8
      //   winner_numbers = 20
      //   winner_pay = 1455
      // break;
      // case 'rhodium':
      //   tickets = 120000
      //   price = 2.5
      //   winner_numbers = 60
      //   winner_pay = 14550
      // break;
      // case 'platinum':
      //   tickets = 333334
      //   price = 3
      //   winner_numbers = 30
      //   winner_pay = 32333.33
      // break;
    }

    if (!event) {
      Event.create({
        type,
        status: "active",
        tickets_quantity: tickets,
        price,
        winner_numbers,
        winner_pay,
      });
    }
  };

  function randomIntFromInterval(min, max) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
};
