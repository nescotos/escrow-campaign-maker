import React, { Component } from 'react';
import web3 from '../common/web3';
import getContract from '../common/contract';

export default class Creator extends Component {


    componentDidMount = async () => {
        const address = await web3.eth.getAccounts();
        this.contract = getContract(web3);
        const stopped = await this.contract.methods.stopped.call();
        this.setState({
            address: address[0],
            stopped        
        });
    }    

    state = {

    }

    createEscrow = async e => {
        e.preventDefault();
        console.log(this.state);
        console.log('Creating Escrow')
        const contractNumber = await this.contract.methods.currentEscrow().call();
        this.setState({ contractNumber: parseInt(contractNumber) + 1 });
        const receipt = await this.contract.methods.addEscrow(this.state.sellerAddress)
        .send({
            from: this.state.address,
            value: web3.utils.toWei(this.state.amount, 'ether')

        });
        console.log(receipt)
        console.log(contractNumber);
    }

    render(){
        return(
            <div>
                <section className="hero is-primary">
                    <div className="hero-body">
                        <div className="container">
                            <h1 className="title">
                                Create your own Escrow
                                </h1>
                            <h2 className="subtitle">
                                Please fill up the following form in order to create your escrow
                            </h2>
                        </div>
                    </div>
                </section>                
                <section className="section">
                    <form onSubmit={this.createEscrow}>
                        {
                            this.state.stopped &&
                            <div className="field">
                                <label className="label">This contract is currently stopped by the admin =(</label>
                            </div>
                        }                        
                        {
                            !this.state.stopped && this.state.contractNumber && 
                            <div className="field">
                                <label className="label">Contract Created: {this.state.contractNumber}</label>
                            </div>
                        }
                        {
                            !this.state.stopped &&
                            <div>
                                <div className="field">
                                    <label className="label">Seller Address</label>
                                    <div className="control">
                                        <input onChange={e => { this.setState({ sellerAddress: e.target.value }) }} className="input" type="text" placeholder="Text Seller Address" />
                                    </div>
                                </div>
                                <div className="field">
                                    <label className="label">Amount</label>
                                    <div className="control">
                                        <input onChange={e => { this.setState({ amount: e.target.value }) }} className="input" type="number" min="0" step="any" placeholder="Input Amount (on ether)" />
                                    </div>
                                </div>
                                <div className="field is-grouped">
                                    <div className="control">
                                        <button className="button is-link">Submit</button>
                                    </div>
                                    <div className="control">
                                        <button className="button is-text">Cancel</button>
                                    </div>
                                </div>
                            </div>
                        }
                    </form>                    
                </section>
            </div>
        );
    }
}