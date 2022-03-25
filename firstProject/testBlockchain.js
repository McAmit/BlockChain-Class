let Block = require('./block')
let Transaction = require('./transaction')
let Blockchain = require('./blockchain')
let EC = require('elliptic').ec
let ec = new EC('secp256k1')

let mykey = ec.keyFromPrivate('NEED TO INSERT')
let myWalletAddress = mykey.getPublic('hex')



// create genesis block
let genesisBlock = new Block()
let blockchain = new Blockchain(genesisBlock)


// mica 

let tx1= new Transaction(myWalletAddress,'address2', 20)
tx1.signTransaction(mykey)
let blockMica = blockchain.getNextBlock([tx1])
blockchain.addBlock(blockMica)

// create a new transaction, first one
let transaction = new Transaction('Mary','John',10)
let block = blockchain.getNextBlock([transaction])
blockchain.addBlock(block)

// create a new transaction, second one
let anotherTransaction = new Transaction("Azam","Jerry",100)
let block1 = blockchain.getNextBlock([anotherTransaction,transaction])
blockchain.addBlock(block1)

let anotherTransaction2 = new Transaction("ASsSAzam","Jereeery",100)

//console.log(blockchain)
console.log(blockchain.bfilter.has(anotherTransaction2.calculateHash()))
//console.log(blockchain.bfilter._seed)
//console.log(blockchain.bfilter._hashing)