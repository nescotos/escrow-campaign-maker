import React from 'react';
import { Link } from 'react-router-dom';

export default function Home(){
    return (
        <div>
            <section className="hero is-medium is-primary">
                <div className="hero-body">
                    <div className="container">
                        <h1 className="title">
                            Escrow Maker
                        </h1>
                        <h2 className="subtitle">
                            Application that allows create Escrow Payments using Ether
                        </h2>
                    </div>
                </div>
            </section>
            <section className="hero is-medium is-info">
                <div className="hero-body">
                    <div className="container">
                        <h1 className="title">
                            Create my Escrow
                        </h1>
                        <h2 className="subtitle">
                            This will allow you to create your own Escrow Contract on the Blockchain, <Link to="/new">Click Here</Link>
                        </h2>
                    </div>
                </div>
            </section>
            <section className="hero is-medium is-warning">
                <div className="hero-body">
                    <div className="container">
                        <h1 className="title">
                            Read my Escrow
                        </h1>
                        <h2 className="subtitle">
                            Set the status of your Escrow Contract, get paid if the contract met the conditions, <Link to="/reader">Click Here</Link>
                        </h2>
                    </div>
                </div>
            </section>
            <section className="hero is-medium is-light">
                <div className="hero-body">
                    <div className="container">
                        <h1 className="title">
                            Admin
                        </h1>
                        <h2 className="subtitle">
                            This will allow you to perform Admin Tasks, <Link to="/admin">Click Here</Link>
                        </h2>
                    </div>
                </div>
            </section>
        </div>
    )
}