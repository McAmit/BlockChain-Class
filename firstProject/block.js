const { MerkleTree } = require('merkletreejs')
const SHA256 = require('crypto-js/sha256')


class Block {

    constructor() {

        const leaves = [''].map(x => SHA256(x))
        const tree = new MerkleTree(leaves, SHA256)
        const root = tree.getRoot().toString('hex')
        
        this.index = 0
        this.previousHash = ''
        this.hash = ""
        this.nonce = 0
        this.transactions = tree
     }

     addTransaction(transaction) {
        if(!transaction.from || !transaction.to){
            throw new Error("Transaction must have to and from address")
        }

        // if(!transaction.isValid()){
        //     throw new Error("Cannot add invalid transaction to chain")
        // }

        //this.transactions.push(transaction)
        this.transactions.addLeaf(transaction,SHA256)
    }

    get key() {
        return JSON.stringify(this.transactions) + this.index + this.previousHash + this.nonce
    }

    hasValidateTransaction(){
        for(const transaction of this.transactions){
            if(!transaction.isValid()) return false
        }
         const leaf = SHA256('a')
         const proof = tree.getProof(leaf)
        return true
    }
}

module.exports = Block