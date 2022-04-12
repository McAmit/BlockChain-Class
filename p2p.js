let EC = require('elliptic').ec
let ec = new EC('secp256k1')
let Block = require('./block')
let Transaction = require('./transaction')
let Blockchain = require('./blockchain')

const supaChain = new Blockchain()

const topology = require('fully-connected-topology')
const { stdin, exit, argv } = process
const { log } = console
const { me, peers } = extractPeersAndMyPort(argv)
const sockets = {}

log('---------------------')
log('Welcome to p2p chat!')
log('me - ', me)
log('peers - ', peers)
log('connecting to peers...')

const myIp = toLocalIp(me)
const peerIps = getPeerIps(peers)

//connect to peers
topology(myIp, peerIps).on('connection', (socket, peerIp) => {
    const peerPort = extractPortFromIp(peerIp)
    log('connected to peer - ', peerPort)

    const myKey = ec.keyFromPrivate(me)
    const myAddress = myKey.getPublic('hex')
    const peersKeys = setPeersKeyMap()

    sockets[peerPort] = socket
    stdin.on('data', data => { //on user input
        const message = data.toString().trim()
        const prefix = message.split(" ")[0]
        switch (prefix) {
            case 'exit':
                log('Bye bye')
                exit(0)
                break;
            case 'mine':
                mine(myAddress)
                break;

            case 'balance':
                balanceOf(message)
                break;

            case 'send':

                break;
            case 'ask':

                break;
            case 'approve':

                break;
            case 'all tokens':

                break;
            case 'show all balance':
                showAllBalance()
                break;
            default:
                break;
        }
        if (message === 'exit') { //on exit
            log('Bye bye')
            exit(0)
        }

        const receiverPeer = extractReceiverPeer(message)
        if (sockets[receiverPeer]) { //message to specific peer
            if (peerPort === receiverPeer) { //write only once
                sockets[receiverPeer].write(formatMessage(extractMessageToSpecificPeer(message)))
            }
        } else { //broadcast message to everyone
            socket.write(formatMessage(message))
        }
    })

    //print data when received
    socket.on('data', data => log(data.toString('utf8')))
})


//extract ports from process arguments, {me: first_port, peers: rest... }
function extractPeersAndMyPort() {
    return {
        me: argv[2],
        peers: argv.slice(3, argv.length)
    }
}

//'4000' -> '127.0.0.1:4000'
function toLocalIp(port) {
    return `127.0.0.1:${port}`
}

//['4000', '4001'] -> ['127.0.0.1:4000', '127.0.0.1:4001']
function getPeerIps(peers) {
    return peers.map(peer => toLocalIp(peer))
}

//'hello' -> 'myPort:hello'
function formatMessage(message) {
    return `${me}>${message}`
}

//'127.0.0.1:4000' -> '4000'
function extractPortFromIp(peer) {
    return peer.toString().slice(peer.length - 4, peer.length);
}

//'4000>hello' -> '4000'
function extractReceiverPeer(message) {
    return message.slice(0, 4);
}

//'4000>hello' -> 'hello'
function extractMessageToSpecificPeer(message) {
    return message.slice(5, message.length);
}
function setPeersKeyMap() {
    let peersKeys = new Map();
    for (let i = 0; i < peers.length; i++) {
        peersKeys.set(peers[i], ec.keyFromPrivate(peers[i]))
    }
    return peersKeys
}

function mine(myWalletAddress) {
    if (me === "4000") {
        blockChain.minePendingTransactions(myWalletAddress);
    } else {
        log("This wallet cannot mine!")
    }

}

function balanceOf(message) {
    let ofPort = message.split(" ")[1]
    let balance = supaChain.getBalanceOfAddress(ec.keyFromPrivate(ofPort).getPublic('hex'))

    log("The balance of peer %s : %d", ofPort, balance)
}

function sendTx(message,peersKeys) {
    let str=message.split(" ")
    let toPeer=str[1]
    let amount = parseInt(str[2])
    tx=new Transaction(myAddress,peersKeys.get(toPeer).getPublic('hex'),amount)
    tx.signTransaction(myKey)
    if(supaChain.addTransactionWithFee(tx))
        log("Transaction sent successfuly")

}

function requestTx(message) {

}

function approveTx(message) {

}

function showAllBalance(peersKeys, myAddress) {
    let myBalance = supaChain.getBalanceOfAddress(myAddress)
    log("My balance: %d\n", myBalance)

    for (let i = 0; i < peersKeys.length; i++) {
        let balance = supaChain.getBalanceOfAddress(peersKeys.get(peers[i]).getPublic('hex'))
        log("Balance of %s : %d", peers[i], balance)
    }
}


function showTotalTokens() {

}

function showMinedTokens() {

}

function showBurntToken() {

}