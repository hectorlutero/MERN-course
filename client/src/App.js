import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";
import Landing from "./components/layout/Landing";
import { Navbar } from "./components/layout/Navbar";
import { Register } from "./components/auth/Register";
import { Login } from "./components/auth/Login";

function App() {
  return (
    <Router>
      <Navbar />
      <Switch>
        <Route exact path="/" component={Landing} />
        <section className="container">
          <Route exact path="/register" component={Register} />
          <Route exact path="/login" component={Login} />
        </section>
      </Switch>
    </Router>
  );
}

export default App;
