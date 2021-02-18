import React, { Component } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import { Grid, Button, ButtonGroup, Typography } from "@material-ui/core";
import { connect } from "react-redux";
import { authSpotifyLogin } from "../store/actions/auth";
import { Scopes, SpotifyAuth } from "react-spotify-auth";
import { REDIRECT_URI, CLIENT_ID } from "../utils/config"
import 'react-spotify-auth/dist/index.css';
import PrivateRoute from "./PrivateRoute";
import CreateRoomPage from "./CreateRoomPage";
import RoomJoinPage from "./RoomJoinPage";
import Room from "./Room";

export class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomCode: null,
    };
  }

  clearRoomCode = () => {
    this.setState({
      roomCode: null,
    });
  };

  async componentDidMount() {
    // check if user is in room
    // fetch("/api/user-in-room")
    //   .then((response) => response.json())
    //   .then((data) => {
    //     this.setState({
    //       roomCode: data.code,
    //     });
    //   });
  }

  renderHomePage() {
    const {error, token} = this.props;
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} align="center">
          <Typography variant="h3" component="h3">
            Music Rooms
          </Typography>
        </Grid>

        {token !== null ? (
          <Grid item xs={12} align="center">
            <ButtonGroup disableElevation variant="contained" color="primary">
              <Button color="primary" to="/join" component={Link}>
                Join a Room
              </Button>

              <Button color="secondary" to="/create" component={Link}>
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
    return (
      <div className="center">
        <Router>
          <Switch>
            <Route
              exact
              path="/"
              render={() => {
                return this.state.roomCode ? (
                  <Redirect to={`/room/${this.state.roomCode}`}/>
                ) : (
                  this.renderHomePage()
                );
              }}
            />
            <PrivateRoute path="/join" component={RoomJoinPage}/>
            <PrivateRoute path="/create" component={CreateRoomPage}/>
            <PrivateRoute
              path="/room/:roomCode"
              render={(props) => {
                return <Room {...props} leaveRoomCallback={this.clearRoomCode}/>;
              }}
            />
          </Switch>
        </Router>
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

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);