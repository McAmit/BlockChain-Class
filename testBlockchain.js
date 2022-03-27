let Block = require('./block')
let Transaction = require('./transaction')
let Blockchain = require('./blockchain')
let EC = require('elliptic').ec
let ec = new EC('secp256k1')

let mykey = ec.keyFromPrivate('NEED TO INSERT')
let myWalletAddress = mykey.getPublic('hex')

let mykey2 = ec.keyFromPrivate('NEED TO INSERT2')
let myWalletAddress2 = mykey2.getPublic('hex')

// create genesis block
let genesisBlock = new Block()
let blockchain = new Blockchain(genesisBlock)


// create a new transaction, First
let transaction= new Transaction(myWalletAddress,'address2', 20)
transaction.signTransaction(mykey)
let block = blockchain.getNextBlock([transaction])
blockchain.addBlock(block, "Need-to-Insert-Address1")

// create a new transaction, Second
let transaction1 = new Transaction(myWalletAddress2,myWalletAddress,10)
transaction1.signTransaction(mykey2)
let block1 = blockchain.getNextBlock([transaction1])
blockchain.addBlock(block1, "Need-to-Insert-Address2")

// create a new transaction, Third
let anotherTransaction = new Transaction(myWalletAddress,"Jerry",100)
anotherTransaction.signTransaction(mykey)
let block2 = blockchain.getNextBlock([anotherTransaction,transaction])
blockchain.addBlock(block2, "Need-to-Insert-Address3")

// let anotherTransaction2 = new Transaction("ASsSAzam","Jereeery",100)

console.log("this First Transaction is valid?", transaction.isValid())
console.log(blockchain)
// console.log(blockchain.bfilter.has(anotherTransaction2.calculateHash()))
//console.log(blockchain.bfilter._seed)
//console.log(blockchain.bfilter._hashing)