import React from "react";
import {Route, Redirect} from "react-router-dom";
import {connect} from "react-redux";

// TO BE FIXED
const PrivateRoute = ({component: Component, auth, ...rest}) => (
  <Route
    {...rest}
    render={props => {
      if (auth.loading) {
        return <h2>Loading...</h2>
      } else if (auth.token === null) {
        return <Redirect to="/login"/>
      } else {
        return <Component {...props} />;
      }
    }}
  />

);

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps)(PrivateRoute);