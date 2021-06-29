import Button from "@material-ui/core/Button";
import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { logout } from "../../store/actions/auth";

const CustomLayout = ({authenticated, logout, children}) => {
  return (
    <div align="center">
      <Button variant="contained" href="/">
        Home
      </Button>
      {authenticated ? (
        <Button
          variant="contained"
          color="secondary"
          onClick={() => logout()}
        >
          Logout
        </Button>
      ) : (
        <Button
          variant="contained"
          color="primary"
          href="/"
        >
          Login
        </Button>
      )}

      {children}
    </div>
  );
}

const mapStateToProps = state => {
  return {
    authenticated: state.auth.token !== null
  };
};

const mapDispatchToProps = dispatch => {
  return {
    logout: () => dispatch(logout())
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(CustomLayout)
);
