const EC = require('elliptic').ec
const ec = new EC('secp256k1')

const key = ec.genKeyPair()

const publicKey = key.getPublic('hex') // public wallet
const privateKey = key.getPrivate('hex') // private wallet

