import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Redirect, useLocation } from "react-router-dom";
import 'react-spotify-auth/dist/index.css';
import { authSpotifyLogin } from "../../store/actions/auth";
import axiosClient from "../../utils/axiosClient";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SpotifyCallback = ({spotifyLogin, token, error}) => {
  let query = useQuery();

  const [code] = useState(query.get("code"));
  const [_error] = useState(query.get("error"));


  useEffect(() => {
    async function login() {
      const token_response = await axiosClient.post('http://localhost:8000/api/auth/spotify-token', {
        code: code,
      })

      spotifyLogin(token_response);
    }

    if (code) {
      login().then()
    }

  }, [code])

  if (token) {
    return <Redirect to="/"/>;
  }
  return (
    <div>
      <p>Code: {code}</p>
      <p>Error: {_error}</p>
    </div>
  );

}

const mapStateToProps = state => {
  return {
    error: state.auth.error,
    token: state.auth.token
  };
};

const mapDispatchToProps = dispatch => {
  return {
    spotifyLogin: (tokenResponse) => dispatch(authSpotifyLogin(tokenResponse)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SpotifyCallback);
