import React, { Component } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import { Grid, Button, ButtonGroup, Typography } from "@material-ui/core";
import CreateRoomPage from "./CreateRoomPage";
import RoomJoinPage from "./RoomJoinPage";
import Room from "./Room";

export class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomCode: null,
      spotifyAuthenticated: false,
    };
  }

  clearRoomCode = () => {
    this.setState({
      roomCode: null,
    });
  };

  isAuthenticated = () => {
    fetch("/spotify/is-authenticated")
      .then((response) => response.json())
      .then((data) => {
        this.setState({ spotifyAuthenticated: data.status });
        return data.status;
      });
  };

  authenticateSpotify = () => {
    if (!this.state.spotifyAuthenticated) {
      fetch("/spotify/get-auth-url")
        .then((response) => response.json())
        .then((data) => {
          window.location.replace(data.url);
        });
    }
  };

  async componentDidMount() {
    // check if authenticated and set state
    this.isAuthenticated();
    // check if user is in room
    fetch("/api/user-in-room")
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          roomCode: data.code,
        });
      });
  }

  renderHomePage() {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} align="center">
          <Typography variant="h3" component="h3">
            Music Rooms
          </Typography>
        </Grid>

        {this.state.spotifyAuthenticated ? (
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
            <ButtonGroup disableElevation variant="contained" color="primary">
              <Button
                onClick={this.authenticateSpotify}
                component={Link}
                style={{ backgroundColor: "#1DB954", fontWeight: 900 }}
              >
                Login in with Spotify
              </Button>
            </ButtonGroup>
          </Grid>
        )}
      </Grid>
    );
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route
            exact
            path="/"
            render={() => {
              return this.state.roomCode ? (
                <Redirect to={`/room/${this.state.roomCode}`} />
              ) : (
                this.renderHomePage()
              );
            }}
          ></Route>
          <Route path="/join" component={RoomJoinPage}></Route>
          <Route path="/create" component={CreateRoomPage}></Route>
          <Route
            path="/room/:roomCode"
            render={(props) => {
              return <Room {...props} leaveRoomCallback={this.clearRoomCode} />;
            }}
          ></Route>
        </Switch>
      </Router>
    );
  }
}

export default HomePage;
