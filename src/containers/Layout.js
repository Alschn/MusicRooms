import React, {Component} from "react";
import {Link, withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {logout} from "../store/actions/auth";


class CustomLayout extends Component {
  render() {
    const {authenticated} = this.props;
    return (
      <div>
        <Link to="/">
          Home
        </Link>
        {authenticated ? (
          <button onClick={() => this.props.logout()}>
            Logout
          </button>
        ) : (
          <Link to="/login">
            Login
          </Link>
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
