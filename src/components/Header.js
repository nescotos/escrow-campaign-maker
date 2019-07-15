import React from 'react';
import { Link } from 'react-router-dom';

function Header(){
    return (
        <nav className="navbar is-dark" role="navigation" aria-label="main navigation">
            <div className="navbar-brand">
                <Link to='/' className="navbar-item">
                    Home
                </Link>
                <Link to='/admin' className="navbar-item">
                    Admin
                </Link>
                <Link to='/new' className="navbar-item">
                    Create Escrow
                </Link>
                <Link to='/reader' className="navbar-item">
                    Read Escrow
                </Link>
            </div>
        </nav>
    )
}

export default Header;