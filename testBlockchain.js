let Block = require('./block')
let Transaction = require('./transaction')
let Blockchain = require('./blockchain')
let EC = require('elliptic').ec
let ec = new EC('secp256k1')

let mykey = ec.keyFromPrivate('NEED TO INSERT')
let myWalletAddress = mykey.getPublic('hex')

let walletSpv1Pk=ec.keyFromPrivate('Key1')
let wallet1Address=walletSpv1Pk.getPublic('hex')

let walletSpv2Pk=ec.keyFromPrivate('Key2')
let wallet2Address=walletSpv2Pk.getPublic('hex')




let blockchain = new Blockchain()


blockchain.minePendingTransactions(myWalletAddress)
blockchain.minePendingTransactions(myWalletAddress)


console.log(blockchain.getBalanceOfAddress(myWalletAddress))

let tx1= new Transaction(myWalletAddress,wallet1Address, 50)
tx1.signTransaction(mykey)
blockchain.addTransactionWithFee(tx1)
//let blockMiner = blockchain.getNextBlock([tx1])
blockchain.minePendingTransactions(myWalletAddress)
console.log(blockchain.getBalanceOfAddress(wallet1Address))

// // SPV-Wallet 4001
// let tx2 = new Transaction(wallet1Address,wallet2Address,30)
// tx2.signTransaction(walletSpv1Pk)
// //let block = blockchain.getNextBlock([transaction])
// blockchain.addTransactionWithFee(tx2)
// blockchain.minePendingTransactions(myWalletAddress)

// // SPV-Wallet 4002

// let tx3 = new Transaction(wallet2Address,wallet1Address,10)
// //let block1 = blockchain.getNextBlock([anotherTransaction,transaction])
// tx3.signTransaction(walletSpv2Pk)
// blockchain.addTransactionWithFee(tx3)
// blockchain.minePendingTransactions(myWalletAddress)


// console.log(blockchain)
//console.log(blockchain.bfilter.has(anotherTransaction2.calculateHash()))
//console.log(blockchain.bfilter._seed)
//console.log(blockchain.bfilter._hashing)