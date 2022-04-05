let Block = require('./block')
let sha256 = require('js-sha256')
const{PartitionedBloomFilter}=require('bloom-filters') 
const Transaction = require('./transaction')
const bloomFilter = new PartitionedBloomFilter(10, 5, 0.001) 
    

class Blockchain {

    constructor() {
        this.chain = [this.createGenesisBlock()]
        this.difficulty = 2 // number of zero before target hash
        this.pendingTransactions=[]
        this.bfilter = bloomFilter
        this.memPool = []

    }
    createGenesisBlock(){
        return new Block(Date.now(),"Genesis Block",'')
    }

    // addBlock(block, miningRewardAdress) {
    //     if(this.blocks.length == 0) {
    //         block.previousHash = "0000000000000000"
    //         block.hash = this.generateHash(block)
    //     }
    //     // block.mineBlock(this.difficulty)
    //     // console.log("Block successfully mined.")
    //     this.blocks.push(block)
    //     //this.bfilter.add(block.hash)
    //     // let transaction = new Transaction(null, miningRewardAdress, this.miningReward)
    //     // this.memPool.push(transaction)
    // }

    minePendingTransactions(miningRewardAddress){
        const rewardTX =new Transaction(null,miningRewardAddress,this.miningReward)
        this.pendingTransactions.push(rewardTX)
        
        let block=new Block(Date.now(),this.pendingTransactions,this.getLatestBlock().hash)
        block.mineBlock(this.difficulty)
        console.log('Block successfully mines!')
        this.chain.push(block)
        this.pendingTransactions=[]
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

    isChainValid(){
        for (let i = 1; i < this.chain.length; i++) {
          const currentBlock=this.chain[i]
          const previousBlock=this.chain[i-1]
          if(!currentBlock.hasValidTransaction()){return false}
          if(currentBlock.hash !== currentBlock.calculateHash()){
           return false
          }
          
          if(currentBlock.previousHash !== previousBlock.hash){
            return false
          }
        }
       return true
     }
}

module.exports = Blockchain