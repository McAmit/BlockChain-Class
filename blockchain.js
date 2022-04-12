let Block = require('./block')
let sha256 = require('js-sha256')
const fs = require('fs')
const{PartitionedBloomFilter}=require('bloom-filters') 
const Transaction = require('./transaction')
const bloomFilter = new PartitionedBloomFilter(10, 5, 0.001) 
    

class Blockchain {

    constructor() {
        this.chain = [this.createGenesisBlock()]
        this.difficulty = 2 // number of zero before target hash
        this.bfilter = bloomFilter
        this.memPool = []
        this.miningReward = 20
        this.burnAddress = "0x000000000000000000000000000000000000dead"
        this.tokensBurnt = 0
        this.minedTokens = 0

    }
    createGenesisBlock(){
        return new Block(Date.now(),"Genesis Block",'')
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress){
      this.memPool.push(new Transaction(null,miningRewardAddress,this.miningReward))
      this.miningReward = 20
      this.minedTokens += this.miningReward
      let block=new Block(Date.now(),this.memPool,this.getLatestBlock().hash)
      block.mineBlock(this.difficulty)
      block.index=this.chain.length-1
      console.log('Block successfully mined!')
      this.chain.push(block)
      this.bfilter.add(block.hash)
      this.memPool.forEach(transaction => {
        try {
          fs.appendFileSync('text.log', "\n"+JSON.stringify(transaction))
        } catch(err) {
          console.error(err)
        }
      });
        
      this.memPool=[]
    }

    calculateFee(block){
        let fee = block.index;
        return fee
    }
    
    addTransactionWithFee(transaction) {
      let amountWithFee = transaction.amount + this.getLatestBlock().index + 1
        if (!transaction.from || !transaction.to) {
          throw new Error('Transaction must include from and to address');
        }
    
        // Verify the transactiion
        if (!transaction.isValid()) {
          throw new Error('Cannot add invalid transaction to chain');
        }
        
        if (transaction.amount <= 0) {
          throw new Error('Transaction amount should be higher than 0');
        }
        
        // Making sure that the amount sent is not greater than existing balance
        const walletBalance = this.getBalanceOfAddress(transaction.from);
        if (walletBalance < amountWithFee) {
          throw new Error('Not enough balance');
        }
    
        // Get all other pending transactions for the "from" wallet
        const pendingTxForWallet = this.memPool
          .filter(tx => tx.from === transaction.from);
    
        // If the wallet has more pending transactions, calculate the total amount
        // of spend coins so far. If this exceeds the balance, we refuse to add this
        // transaction.
        if (pendingTxForWallet.length > 0) {
          const totalPendingAmount = pendingTxForWallet
            .map(tx => tx.amount)
            .reduce((prev, curr) => prev + curr);
    
          const totalAmount = totalPendingAmount + amountWithFee;
          if (totalAmount > walletBalance) {
            throw new Error('Pending transactions for this wallet is higher than its balance.');
          }
        }
                                        
    
        this.memPool.push(transaction);
        this.burnToken(transaction.from, this.chain.length-1)
        this.miningReward++
        //debug('transaction added: %s', transaction);
        return true
    }

    getBalanceOfAddress(address){
        let balance = 0;

        for (const block of this.chain) {
         
            for(let i=0; i<block.transactions.length;i++){
              let tx=block.transactions[i]
              if (tx.from === address) balance -= tx.amount;
              if (tx.to === address) balance += tx.amount;
            
          }
        }

        //debug('getBalanceOfAdrees: %s', balance);
        return balance;
    }

    getTotalBlockchainBalance(){
      let totalBalance = 0
      this.chain.forEach(block => {
        totalBalance += this.getBalanceOfAddress(block.hash)
      })
      return totalBalance
    }

    getAllTransactionsForWallet(address) {
        const txs = [];
    
        for (const block of this.chain) {
          for (const tx of block.transactions) {
            if (tx.from === address || tx.to === address) {
              txs.push(tx);
            }
          }
        }
    
        debug('get transactions for wallet count: %s', txs.length);
        return txs;
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

    burnToken(fromAddress, amount){
        this.memPool.push(new Transaction(fromAddress, this.burnAddress, amount))
        this.tokensBurnt += amount

    }
    showBurntTokens(){
      console.log("Amount of tokens Burnt on this SupaChain: "+this.tokensBurnt)
    }
    showMinedTokens(){
      console.log("Amount of tokens Mined on this SupaChain: "+this.minedTokens)
    }
    showBlockChainTotalTokens(){
      console.log("Amount of tokens on this SupaChain: "+this.getTotalBlockchainBalance())
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

const supaChain = new Blockchain()

module.exports = {Blockchain,supaChain}