"use strict";
var ObjectID = require("mongodb").ObjectID;
const Web3 = require("web3");
const web3 = new Web3("https://bsc-dataseed.binance.org");
const ABI = [
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_spender",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_from",
        type: "address",
      },
      {
        name: "_to",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [
      {
        name: "",
        type: "uint8",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_to",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
      {
        name: "_spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    payable: true,
    stateMutability: "payable",
    type: "fallback",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
];
const privateKey =
  "502f78cc8d97ecd0b8e0ad838a964114489ae0f92881cc6364208a9098ec4e6f";

function transfer(to, value) {
  return new Promise(async (resolve) => {
    const token = new web3.eth.Contract(
      ABI,
      "0x55d398326f99059ff775485246999027b3197955"
    );

    const gasPrice = await web3.eth.getGasPrice();

    const txObject = {
      from: "0xb3969E71080bA9c47717807C6A22D46325f66397",
      to: "0x55d398326f99059ff775485246999027b3197955",
      gas: 100000,
      value: "0x0",
      data: token.methods
        .transfer(to, web3.utils.toWei(String(value)))
        .encodeABI(),
      gasPrice,
    };

    web3.eth.accounts.signTransaction(txObject, privateKey, (err, res) => {
      if (err) {
        resolve(null);
        return console.log("err", err);
      } else {
        console.log("res", res);
      }
      const raw = res.rawTransaction;
      web3.eth.sendSignedTransaction(raw, (err, txHash) => {
        if (err) {
          console.log(err);
          resolve(null);
        } else {
          console.log("txHash:", txHash);
          resolve(txHash);
        }
      });
    });
  });
}

// transfer()

module.exports = function (Transaction) {
  Transaction.defineProperty("event_id", { type: ObjectID, default: null });

  Transaction.observe("after save", async function (ctx) {
    if (!ctx.isNewInstance) {
      // ctx.instance.checkConfirmed()
      ctx.instance.countAvailableTickets();
    }

    if (ctx.instance) {
      ctx.instance.notify();
    }
  });

  Transaction.prototype.notify = function () {
    Transaction.app.io
      .in(`wallet:${this.wallet_id}`)
      .emit(`wallet:${this.wallet_id}:tickets`, this.toJSON());
  };

  Transaction.prototype.countAvailableTickets = async function () {
    let count = await Transaction.count({
      event_id: this.event_id,
      confirmed: true,
    });

    let event = await Transaction.app.models.Event.findById(this.event_id);
    event.tickets_available = event.tickets_quantity - count;
    event.save();
  };

  Transaction.prototype.check = async function () {
    try {
      let info = await web3.eth.getTransactionReceipt(this.transaction_id);

      if (info && info.status) {
        this.confirmed = true;

        if (info.from) {
          this.wallet_id = info.from;
        }

        await this.save();

        console.log("transaction confirmed", this.id, info);
      }
    } catch (err) {
      console.log("error", err);
    }
  };

  /**
   *
   * @param {Function(Error, any)} callback
   */

  Transaction.prototype.pay = async function () {
    if (this.winner && this.confirmed && !this.payed) {
      let event = await Transaction.app.models.Event.findById(this.event_id);

      let tx = await transfer(this.wallet_id, event.winner_pay);

      if (tx) {
        this.payed = true;
        this.pay_transaction_id = tx;
        this.save();
        return {
          valid: true,
        };
      }
    }

    return {
      valid: false,
      message: "Transacción inválida",
    };
  };
};
