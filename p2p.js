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
const peersTxns = setPeersTxMap();

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
                balanceOf(message,peersKeys,myAddress)
                break;

            case 'send':
                sendTx(message,peersKeys,myAddress, myKey)
                break;
            case 'request':
                let txAndPeer = requestTx(message,peersKeys,myAddress)
                let str='A transaction was sent to you from:' +me+':\n Tx-Details: '+txAndPeer.tx+'\nwrite "approve + y/n" to answer the request'
                sendMessageToPeer(str,txAndPeer.peer,peerPort) 
                peersTxns.set(txAndPeer.peer,txAndPeer.tx) // send TX to peer throughout peerTx map

                break;
            case 'approve':
                console.log(peersTxns.get(me))
                pullAndSignTx(message,myKey)

                break;
            case 'all tokens':

                break;
            case 'showAllBalance':
                showAllBalance(myAddress,peersKeys)
                break;
            default:
                break;
        }

        // const receiverPeer = extractReceiverPeer(message)
        // if (sockets[receiverPeer]) { //message to specific peer
        //     if (peerPort === receiverPeer) { //write only once
        //         sockets[receiverPeer].write(formatMessage(extractMessageToSpecificPeer(message)))
        //     }
        // } else { //broadcast message to everyone
        //     socket.write(formatMessage(message))
        // }
    })

    //print data when received
    socket.on('data', data => log(data.toString('utf8')))
})
function sendMessageToPeer(message, receiverPeer, peerPort) {
    if (sockets[receiverPeer]) { //message to specific peer
        if (peerPort === receiverPeer) { //write only once
            sockets[receiverPeer].write(message)
        }
    }
}
function pullAndSignTx(message,myKey){
    let str=message.split(" ")[1]
    if(str==='y'){
        let tx = peersTxns.get(me)
        console.log(tx)
        tx.signTransaction(myKey)
        if(supaChain.addTransactionWithFee(tx)){
            console.log("Transaction Sent Succefully")
            peersTxns.set(me,null)
        }
    } else if(str==='n'){
        console.log("You disapproved the transaction!")
        peersTxns.set(me,null)
    } else {
        console.log("Wrong input, nothing happend")
    }

}

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

    function setPeersTxMap(){
        let peersTx=new Map()
        for (let i = 0; i < peers.length; i++) {
            peersTx.set(peers[i],Transaction)
        }
        return peersTx
    }

    function mine(myWalletAddress) {
        if (me === "4000") {
            supaChain.minePendingTransactions(myWalletAddress);
        } else {
            log("This wallet cannot mine!")
        }

    }

    function balanceOf(message,peersKeys,myAddress) {
        let ofPeer = message.split(" ")[1]
        if(ofPeer!==me){
            let balance = supaChain.getBalanceOfAddress(peersKeys.get(ofPeer).getPublic('hex'))
            log("The balance of peer %s : %d", ofPeer, balance)
        }else{
            let balance = supaChain.getBalanceOfAddress(myAddress)
            log("The balance of peer %s : %d", ofPeer, balance)
        }

        
    }

    function sendTx(message,peersKeys,myAddress, myKey) {
        let str = message.split(" ")
        let toPeer = str[1]
        let amount = parseInt(str[2])
        tx = new Transaction(myAddress, peersKeys.get(toPeer).getPublic('hex'), amount)
        tx.signTransaction(myKey)
        if (supaChain.addTransactionWithFee(tx))
            log("Transaction sent successfuly")

    }

    function requestTx(message,peersKeys,myAddress) {
        let str = message.split(" ")
        let fromPeer = str[1]
        let amount = parseInt(str[2])
        tx = new Transaction(peersKeys.get(fromPeer).getPublic('hex'), myAddress, amount)
        return { tx: tx, peer: fromPeer }
    }

    function showAllBalance(myAddress,peersKeys) {
        let myBalance = supaChain.getBalanceOfAddress(myAddress)
        log("My balance: %d", myBalance)

        for (let i = 0; i < peersKeys.size; i++) {
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