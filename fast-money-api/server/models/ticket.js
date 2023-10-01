'use strict';
var ObjectID = require('mongodb').ObjectID;


module.exports = function(Ticket) {

  Ticket.defineProperty('event_id', {type: ObjectID, default: null});

  Ticket.observe('after save', async function(ctx){

    if(!ctx.isNewInstance){
      ctx.instance.setTicketCountsToEvent()
      ctx.instance.notify()
    }

  })

  Ticket.prototype.setTicketCountsToEvent = async function(){

    let event = await Ticket.app.models.Event.findById(this.event_id)
    event.tickets_available = await Ticket.count({
      event_id: this.event_id,
      selled: false
    })
    event.save()

  }

  Ticket.prototype.notify = function(){
    console.log('notify', this.id)
    Ticket.app.io.in('general').emit('ticket-changed', this.toJSON())
  }

  /**
   * Comprar ticket
   * @param {string} transaction_id
   * @param {Function(Error, any)} callback
   */

  Ticket.prototype.buy = async function(transaction_id, wallet_id) {

    this.reserved = true
    this.save()

    let transaction = await Ticket.app.models.Transaction.findOne({
      where: {
        ticket_id: this.id
      }
    })

    if(!transaction) {

      Ticket.app.models.Transaction.create({
        transaction_id,
        wallet_id,
        ticket_id: this.id,
        event_id: this.event_id,
        confirmed: false
      })

    }

  };

};
