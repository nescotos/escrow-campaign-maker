import React, { Component } from 'react';
import web3 from '../common/web3';
import getContract from '../common/contract';

export default class Admin extends Component {
    state = {

    }

    componentDidMount = async () => {
        const address = await web3.eth.getAccounts();
        this.contract = getContract(web3);
        const admin = await this.contract.methods.owner.call();
        this.setState({
            address: address[0],
            contractData: null,
            admin
        });
    } 

    transfer = async address => {
        await this.contract.methods.transferWhenBlocked(this.state.id, address).send({
            from: this.state.address
        });
    }

    readEscrow = async e => {
        e.preventDefault();
        const data = await this.contract.methods.getEscrow(this.state.id).call();
        this.setState({
            contractData: data,
            stringAmount: web3.utils.hexToNumberString(data.amount._hex)
        });
    }

    emergencyStop = async vote => {
        await this.contract.methods.setStopped(vote).send({
            from: this.state.address
        });
    }

    render() {
        return (            
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
                {
                    this.state.admin !== this.state.address &&
                    <section className="section">
                        <div className="field">
                            <label className="label">You are not the Admin, you should not be here</label>
                        </div>
                    </section>
                }
                {
                    this.state.admin === this.state.address &&
                    <section className="section">
                            <div className="field is-grouped">
                                <div className="control">
                                <button onClick={() => { this.emergencyStop(true) }} className="button is-danger">Stop Contract</button>
                                </div>
                                <div className="control">
                                <button onClick={() => { this.emergencyStop(false) }}  className="button is-success">Start Contract</button>
                                </div>
                            </div>
                    </section>
                }                            
                {
                    this.state.admin === this.state.address &&
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
                }                
                {
                    this.state.admin === this.state.address && this.state.contractData &&
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
                    this.state.admin === this.state.address && this.state.contractData && ((this.state.contractData.buyerVote && !this.state.contractData.buyerAgreement) || (this.state.contractData.sellerVote && !this.state.contractData.sellerAgreement)) &&
                    <section className="section">
                        <div className="field">
                            <label className="label">This contract is LOCKED, Select an account to transfer the Ether</label>
                        </div>
                        <div className="field is-grouped">
                            <div className="control">
                                <button onClick={ () => {this.transfer(this.state.contractData.buyer)}} className="button is-success">Transfer to Buyer</button>
                            </div>
                            <div className="control">
                                <button onClick={() => { this.transfer(this.state.contractData.seller) }} className="button is-primary">Transfer to Seller</button>
                            </div>
                        </div>
                    </section>
                }           
            </div>
        )
    }
}