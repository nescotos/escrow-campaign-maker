import React, { Component } from 'react';
import web3 from '../common/web3';
import getContract from '../common/contract';

export default class Reader extends Component {

    state = {
        contractData: null
    }

    componentDidMount = async () => {
        const address = await web3.eth.getAccounts();
        this.contract = getContract(web3);
        this.setState({
            address: address[0],
            contractData: null
        });
    }  

    withdraw = async () => {
        await this.contract.methods.withdraw(this.state.id).send({
            from: this.state.address
        });
    };

    readEscrow = async e => {
        e.preventDefault();
        const data = await this.contract.methods.getEscrow(this.state.id).call();
        this.setState({
            contractData: data,
            stringAmount: web3.utils.hexToNumberString(data.amount._hex)
        });
    }

    onVote = async vote => {
        console.log('Starting Voting')
        await this.contract.methods.vote(this.state.id, vote).send({
            from: this.state.address
        });
        console.log('vote done');
    };

    render(){
        return(
            <div>
                <section className="hero is-success">
                    <div className="hero-body">
                        <div className="container">
                            <h1 className="title">
                                Read your Escrow
                                </h1>
                            <h2 className="subtitle">
                                Insert the id to read the Escrow
                            </h2>
                        </div>
                    </div>
                </section>
                <section className="section">
                    <form onSubmit={this.readEscrow}>
                        <div className="field">
                            <label className="label">Escrow Id</label>
                            <div className="control">
                                <input onChange={e => { this.setState({ id: e.target.value }) }} className="input" min="0" type="number" placeholder="Text Escrow Id" />
                            </div>
                        </div>
                        <div className="field is-grouped">
                            <div className="control">
                                <button className="button is-link">Read</button>
                            </div>
                        </div>
                    </form>                   
                </section>
                {
                    this.state.contractData &&
                    <section className="section">
                        <div className="field">
                            <label className="label">Amount (in wei): {this.state.stringAmount}</label>
                        </div>
                        <div className="field">
                            <label className="label">Buyer Address: {this.state.contractData.buyer}</label>
                        </div>
                        <div className="field">
                            <label className="label">Seller Address: {this.state.contractData.seller}</label>
                        </div>
                        <div className="field">
                            <label className="label">Buyer Already Vote: {this.state.contractData.buyerVote.toString()}</label>
                            <label className="label">Buyer Vote: {this.state.contractData.buyerAgreement.toString()}</label>
                        </div>
                        <div className="field">
                            <label className="label">Seller Already Vote: {this.state.contractData.sellerVote.toString()}</label>
                            <label className="label">Seller Vote: {this.state.contractData.sellerAgreement.toString()}</label>
                        </div>
                    </section>
                }
                {
                    this.state.contractData && ((this.state.contractData.buyer === this.state.address && !this.state.contractData.buyerVote) || (this.state.contractData.seller === this.state.address && !this.state.contractData.sellerVote)) &&
                    <section className="section">
                        <div className="field">
                            <label className="label">Agree on contract?</label>
                        </div>
                        <div className="field is-grouped">
                            <div className="control">
                                <button onClick={() => {this.onVote(true)}} type="button" className="button is-success">Yes</button>
                                <button onClick={() => {this.onVote(false)}} type="button" className="button is-danger">No</button>
                            </div>
                        </div>
                    </section>
                }                
                {
                    this.state.contractData && ((this.state.contractData.buyerVote && !this.state.contractData.buyerAgreement) || (this.state.contractData.sellerVote && !this.state.contractData.sellerAgreement)) &&
                    <section className="section">
                        <div className="field">
                            <label className="label">This contract is LOCKED, please contact the owner to transfer determine who should receive the Ether</label>
                        </div>                        
                    </section>
                }                
                {
                    this.state.contractData && this.state.contractData.sellerAgreement
                    && this.state.contractData.buyerAgreement && this.state.contractData.seller === this.state.address && 
                    <section className="section">
                        <div className="field">
                            <label className="label">Withdraw: </label>
                        </div>
                        <div className="field is-grouped">
                            <div className="control">
                                <button onClick={() => { this.withdraw() }} type="button" className="button is-primary">Withdraw</button>
                            </div>
                        </div>
                    </section>                    
                }                
            </div>
        )
    }
}