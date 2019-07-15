const web3 = require('./web3');
const abi = require('../contracts/Escrow.json').abi;

function getContract(provider){
    return new provider.eth.Contract(abi, process.env.REACT_APP_CONTRACT_ADDRESS);
}

export default getContract;