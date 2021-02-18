import React, {Component} from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import {authSpotifyLogin} from "../store/actions/auth";
import {Scopes, SpotifyAuth} from "react-spotify-auth";
import 'react-spotify-auth/dist/index.css';

const REDIRECT_URI = 'http://127.0.0.1:8000/login'
const CLIENT_ID = '69eb0591190d4ce298dcccb1e20857f4'

class Login extends Component {
  state = {};

  handleSpotifyLogin = (token) => {
    this.props.spotifyLogin(token);
  }

  render() {
    const { error, token } = this.props;
    if (token) {
      return <Redirect to="/" />;
    }
    return (
        <div>
          <h2>
            Log-in to your account
          </h2>

          <SpotifyAuth
              redirectUri={REDIRECT_URI}
              clientID={CLIENT_ID}
              scopes={
                [Scopes.all]
              }
              onAccessToken={token => {
                this.handleSpotifyLogin(token)
              }}
          />

          {error && <p>{this.props.error.message}</p>}
        </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    loading: state.auth.loading,
    error: state.auth.error,
    token: state.auth.token
  };
};

const mapDispatchToProps = dispatch => {
  return {
    spotifyLogin: (token) => dispatch(authSpotifyLogin(token)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
