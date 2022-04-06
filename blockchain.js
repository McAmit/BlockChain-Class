let Block = require('./block')
let sha256 = require('js-sha256')
const{PartitionedBloomFilter}=require('bloom-filters') 
const Transaction = require('./transaction')
const bloomFilter = new PartitionedBloomFilter(10, 5, 0.001) 
    

class Blockchain {

    constructor() {
        this.chain = [this.createGenesisBlock()]
        this.difficulty = 2 // number of zero before target hash
        this.bfilter = bloomFilter
        this.memPool = []
        this.miningReward = 100
        this.burnAddress = "0x000000000000000000000000000000000000dead"


    }
    createGenesisBlock(){
        return new Block(Date.now(),"Genesis Block",'')
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
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
        createTransaction(Transaction(null,miningRewardAddress,this.miningReward))
        
        let block=new Block(Date.now(),this.pendingTransactions,this.getLatestBlock().hash)
        block.mineBlock(this.difficulty)
        console.log('Block successfully mines!')
        this.chain.push(block)
        //this.bfilter.add(block.hash)
        this.memPool=[]
    }

    calculateFee(block){
        let fee = block.index;
        return fee
    }
    
    addTransaction(transaction) {
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
        if (walletBalance < transaction.amount) {
          throw new Error('Not enough balance');
        }
    
        // Get all other pending transactions for the "from" wallet
        const pendingTxForWallet = this.pendingTransactions
          .filter(tx => tx.from === transaction.from);
    
        // If the wallet has more pending transactions, calculate the total amount
        // of spend coins so far. If this exceeds the balance, we refuse to add this
        // transaction.
        if (pendingTxForWallet.length > 0) {
          const totalPendingAmount = pendingTxForWallet
            .map(tx => tx.amount)
            .reduce((prev, curr) => prev + curr);
    
          const totalAmount = totalPendingAmount + transaction.amount;
          if (totalAmount > walletBalance) {
            throw new Error('Pending transactions for this wallet is higher than its balance.');
          }
        }
                                        
    
        this.memPool.push(transaction);
        debug('transaction added: %s', transaction);
    }

    getBalanceOfAddress(address){
        let balance = 0;

        for (const block of this.chain) {
        for (const trans of block.transactions) {
            if (trans.from === address) {
            balance -= trans.amount;
            }

            if (trans.to === address) {
            balance += trans.amount;
            }
        }
        }

        debug('getBalanceOfAdrees: %s', balance);
        return balance;
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
        this.addTransaction(new Transaction(fromAddress, this.burnAddress, amount))
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