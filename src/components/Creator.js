import React, { Component } from 'react';
import web3 from '../common/web3';
import getContract from '../common/contract';

export default class Creator extends Component {


    componentDidMount = async () => {
        const address = await web3.eth.getAccounts();
        this.contract = getContract(web3);
        this.setState({
            address: address[0]            
        });
    }    

    createEscrow = async e => {
        e.preventDefault();
        console.log(this.state);
        console.log('Creating Escrow')
        const receipt = await this.contract.methods.addEscrow(this.state.sellerAddress)
        .send({
            from: this.state.address,
            value: web3.utils.toWei(this.state.amount, 'ether')

        });
        console.log('Done', receipt);
        const contractNumber = await this.contract.methods.currentEscrow().call();
        console.log('Id', contractNumber.toNumber());
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
                    </form>                    
                </section>
            </div>
        );
    }
}