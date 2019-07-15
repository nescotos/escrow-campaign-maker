import React from 'react';
import 'bulma/css/bulma.min.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Creator from './components/Creator';
import Reader from './components/Reader';

function App() {
  return (
    <Router>
      <div className="App">
          <Header />
          <Route exact path="/" component={Home} />
          <Route exact path="/new" component={Creator} />
          <Route exact path="/reader" component={Reader} />
      </div>
    </Router>
  );
}

export default App;
