import React, { Component } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import { Grid, Button, ButtonGroup, Typography, Avatar } from "@material-ui/core";
import { connect } from "react-redux";
import { authSpotifyLogin } from "../store/actions/auth";
import { Scopes, SpotifyAuth } from "react-spotify-auth";
import { REDIRECT_URI, CLIENT_ID } from "../utils/config"
import 'react-spotify-auth/dist/index.css';
import axios from "axios";

export class HomePage extends Component {
  // probably there should be another reducer for fetching data
  // or just connect fetching data to auth reducer
  constructor(props) {
    super(props);
    this.state = {
      roomCode: null,
      fetched: false,
      user: null,
      image_url: null,
    };
  }

  clearRoomCode = () => {
    this.setState({
      roomCode: null,
    });
  };

  async componentDidMount() {
    const token = localStorage.getItem('token');

    if (token !== null) {
      const headers = {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      }

      axios.get("/api/user-in-room", {
        headers: headers
      })
        .then(response => {
          if (response.data.code) {
            this.setState({
              roomCode: response.data.code,
            });
          } else {
            this.setState({roomCode: null})
          }
        });

      const response = await axios.get(
        '/spotify/get-current-user', {
          headers: headers
        }
      )
      const data = response.data;
      this.setState({
        fetched: true,
        user: data.user,
        image_url: data.image_url
      })
    }
  }

  renderHomePage() {
    const {error, token, authenticated} = this.props;
    return (
      <Grid container spacing={3}>
        {(this.state.fetched && authenticated) ? (
          <Grid container direction="row" alignItems="center" justify="center" spacing={1}>
            <Grid item>
              <Avatar src={this.state.image_url}/>
            </Grid>
            <Grid item>
              <Typography variant="h5" component="h5">{this.state.user}</Typography>
            </Grid>
          </Grid>
        ) : (
          <></>
        )}

        <Grid item xs={12} align="center">
          <Typography variant="h3" component="h3">
            Music Rooms
          </Typography>
        </Grid>

        {authenticated ? (
          <Grid item xs={12} align="center">
            <ButtonGroup disableElevation variant="contained" color="primary">
              <Button color="primary" onClick={() => this.props.history.push("/join")}>
                Join a Room
              </Button>

              <Button color="secondary" onClick={() => this.props.history.push("/create")}>
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
                this.handleSpotifyLogin(token)
              }}
            />

            {error && <p>{this.props.error.message}</p>}
          </Grid>
        )}
      </Grid>
    );
  }

  render() {
    if (this.state.roomCode !== null && this.state.roomCode !== undefined) {
      return <Redirect to={`/room/${this.state.roomCode}`}/>
    } else {
      return (
        <div className="center">
          {this.renderHomePage()}
        </div>
      );
    }

  }
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