const sha256 = require("crypto-js/sha256")
const EC = require('elliptic').ec
const ec = new EC('secp256k1')

class Transaction {
    constructor(from,to,amount) {
        this.from = from
        this.to = to
        this.amount = amount
        this.timestamp = Date.now()
    }

    calculateHash(){
        return sha256(this.from+this.to+this.amount+this.timestamp).toString()
    }

    signTransaction(signingKey){
        if(signingKey.getPublic('hex')!=this.from){
            throw new Error('You cannot sign transaction from other wallet')
        }
        const hashTransaction = this.calculateHash()
        const sig = signingKey.sign(hashTransaction, ' base64')
        this.signature = sig.toDER('hex')
    }

    // validation

    // isValid(){
    //     if(this.from === null) return true
    //     // if (!this.signature || this.signature === 0){
    //     //     throw new Error("no signature in this transaction")
    //     // }
    //     const publicKey = ec.keyFromPublic(this.from, 'hex')
    //     return publicKey.verify(this.calculateHash, this.signature)
    // }

    isValid(){
        if(this.fromAddress===null)return true
        if(!this.signature||this.signature.length===0){
         throw new Error('No signature in the transaction')
        }
    }
}

module.exports = Transaction