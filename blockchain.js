let Block = require('./block')
let sha256 = require('js-sha256')
const{PartitionedBloomFilter}=require('bloom-filters') 
const Transaction = require('./transaction')
const bloomFilter = new PartitionedBloomFilter(10, 5, 0.001) 
    

class Blockchain {

    constructor(genesisBlock) {
        this.blocks = []
        this.addBlock(genesisBlock)
        this.difficulty = 2 // number of zero before target hash
        this.bfilter = bloomFilter
        this.memPool = []

    }

    addBlock(block, miningRewardAdress) {
        if(this.blocks.length == 0) {
            block.previousHash = "0000000000000000"
            block.hash = this.generateHash(block)
        }
        // block.mineBlock(this.difficulty)
        // console.log("Block successfully mined.")
        this.blocks.push(block)
        //this.bfilter.add(block.hash)
        // let transaction = new Transaction(null, miningRewardAdress, this.miningReward)
        // this.memPool.push(transaction)
    }

    getNextBlock(transactions) {
        let block = new Block()
        transactions.forEach(function(transaction){
            block.addTransaction(transaction)
            bloomFilter.add(transaction.calculateHash())
        })

        let previousBlock = this.getPreviousBlock()
        block.index = this.blocks.length
        block.previousHash = previousBlock.hash
        block.hash = this.generateHash(block)
        return block
    }

    generateHash(block) {
        let hash = sha256(block.key)
        while(!hash.startsWith("0000")) {
            block.nonce += 1
            hash = sha256(block.key)
        }
        return hash
    }

    getPreviousBlock() {
        return this.blocks[this.blocks.length - 1]
    }

    // hasChainValid(){
        
    // }
}

module.exports = Blockchain



