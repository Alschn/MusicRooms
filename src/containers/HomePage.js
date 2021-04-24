import { Avatar, Button, ButtonGroup, Grid, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Scopes, SpotifyAuth } from "react-spotify-auth";
import 'react-spotify-auth/dist/index.css';
import { authSpotifyLogin } from "../store/actions/auth";
import axiosClient from "../utils/axiosClient";
import { BASE_URL, CLIENT_ID, REDIRECT_URI } from "../utils/config"

const HomePage = ({history, error, authenticated}) => {
  // probably there should be another reducer for fetching data
  // or just connect fetching data to auth reducer

  const [roomCode, setRoomCode] = useState(null);

  const [fetched, setFetched] = useState(false);

  const [user, setUser] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  // these 2 don't work as intended
  useEffect(() => {
    axiosClient.get(
      BASE_URL + '/spotify/get-current-user'
    ).then((response) => {
      const {data: {user, image_url}} = response;
      setFetched(true);
      setUser(user);
      setImageUrl(image_url);
    }).catch(err => console.log(err))
  }, [])

  useEffect(() => {
    axiosClient.get(BASE_URL + "/api/user-in-room")
      .then(response => {
        const {data: {code}} = response;
        if (code) {
          setRoomCode(code);
        } else {
          setRoomCode(null);
        }
      }).catch(err => console.log(err));

  }, [])

  const clearRoomCode = () => {
    setRoomCode(null);
  };

  const renderHomePage = () => {
    return (
      <Grid container justify="center" alignItems="center" className="centeredContainer">
        {(fetched && authenticated) && (
          <Grid container direction="row" alignItems="center" justify="center">
            <Grid item>
              <Avatar src={imageUrl}/>
            </Grid>
            <Grid item>
              <Typography variant="h5" component="h5">{user}</Typography>
            </Grid>
          </Grid>
        )}

        <Grid item xs={12} align="center">
          <Typography variant="h3" component="h3">
            Music Rooms
          </Typography>
        </Grid>

        {authenticated ? (
          <Grid item xs={12} align="center">
            <ButtonGroup disableElevation variant="contained" color="primary">
              <Button color="primary" onClick={() => history.push("/join")}>
                Join a Room
              </Button>

              <Button color="secondary" onClick={() => history.push("/create")}>
                Create a Room
              </Button>
            </ButtonGroup>
          </Grid>
        ) : (
          <Grid item xs={12} align="center">
            <SpotifyAuth
              redirectUri={REDIRECT_URI}
              clientID={CLIENT_ID}
              scopes={
                [Scopes.all]
              }
              onAccessToken={token => {
                this.handleSpotifyLogin(token);
                localStorage.setItem('SpotifyToken', token);
              }}
            />

            {error && <p>{this.props.error.message}</p>}
          </Grid>
        )}
      </Grid>
    );
  }

  // replace later with <Redirect>
  if (roomCode !== null && roomCode !== undefined) return renderHomePage()
  return renderHomePage();
}

const mapStateToProps = state => {
  return {
    loading: state.auth.loading,
    error: state.auth.error,
    token: state.auth.token,
    authenticated: state.auth.token !== null,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    spotifyLogin: (token) => dispatch(authSpotifyLogin(token)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);