import Button from "@material-ui/core/Button";
import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { logout } from "../store/actions/auth";

class CustomLayout extends Component {
  render() {
    const {authenticated} = this.props;
    return (
      <div align="center">
        <Button variant="contained" href="/">
          Home
        </Button>
        {authenticated ? (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => this.props.logout()}
          >
            Logout
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            href="/login"
          >
            Login
          </Button>
        )}

        {this.props.children}
      </div>
    );
  }
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
