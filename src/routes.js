import React from "react";
import { Route } from "react-router-dom";
import Hoc from "./hoc/hoc";
import Login from "./containers/Login";
import HomePage from "./containers/HomePage";

const BaseRouter = () => (
  <Hoc>
    <Route path="/login" component={Login} />
    <Route exact path="/" component={HomePage} />
  </Hoc>
);

export default BaseRouter;
