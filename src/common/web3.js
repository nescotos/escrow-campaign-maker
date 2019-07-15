import Web3 from 'web3';

let web3;

if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    window.ethereum.enable();
    console.info('Using modern provider for Web3');
}else if(typeof window['web3'] !== undefined) {
    web3 = new Web3(window['web3'].currentProvider);
    console.info('Using current provider for Web3');
} else {
    console.error('Please install Metamask plugin for Google Chrome or use Mist Browser');
}

export default web3;