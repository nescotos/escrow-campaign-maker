const abi = require('../contracts/Escrow.json').abi;

function getContract(provider){
    return new provider.eth.Contract(abi, process.env.REACT_APP_CONTRACT_ADDRESS, { transactionConfirmationBlocks: 0 });
}

export default getContract;