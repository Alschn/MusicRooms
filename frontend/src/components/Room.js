import React, { Component } from "react";
import { Grid, Button, Typography } from "@material-ui/core";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";

export class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      votesToSkip: 2,
      guestCanPause: false,
      isHost: false,
      showSettings: false,
      spotifyAuthenticated: false,
      song: {},
    };
    this.roomCode = this.props.match.params.roomCode; // react router
    this.leaveButtonPressed = this.leaveButtonPressed.bind(this);
    this.updateShowSettings = this.updateShowSettings.bind(this);
    this.renderSettingsButton = this.renderSettingsButton.bind(this);
    this.renderSettings = this.renderSettings.bind(this);
    this.getRoomDetails = this.getRoomDetails.bind(this);
    this.authenticateSpotify = this.authenticateSpotify.bind(this);
    this.getCurrentSong = this.getCurrentSong.bind(this);
    this.getRoomDetails();
  }

  componentDidMount() {
    // if (window.Spotify == null) {
    //   const script = document.createElement("script");
    //   script.src = "https://sdk.scdn.co/spotify-player.js";
    //   script.async = true;
    //   document.body.appendChild(script);
    //   window.onSpotifyWebPlaybackSDKReady = () => {
    //     window.Spotify = Spotify;
    //     const token =
    //       "BQDcyZ2z6i8zhUv2Cyd05W5lcanjyN4BPnpfLCboAbdCEd2vYp0unQgob_6n7qpPFbJMpE7gsptk1b7YDq8LEon1LN-BpwXzBQSfPuXly_iXTiXkoQUg_J9sBEgmTkZXT2u7mXehg8MuWh6Wl1x85WxdSbF1gAQ4Ljs";
    //     const player = new Spotify.Player({
    //       name: "Web Playback SDK Quick Start Player",
    //       getOAuthToken: (cb) => {
    //         cb(token);
    //       },
    //     });
    //     // Error handling
    //     player.addListener("initialization_error", ({ message }) => {
    //       console.error(message);
    //     });
    //     player.addListener("authentication_error", ({ message }) => {
    //       console.error(message);
    //     });
    //     player.addListener("account_error", ({ message }) => {
    //       console.error(message);
    //     });
    //     player.addListener("playback_error", ({ message }) => {
    //       console.error(message);
    //     });
    //     // Playback status updates
    //     player.addListener("player_state_changed", (state) => {
    //       console.log(state);
    //     });
    //     // Ready
    //     player.addListener("ready", ({ device_id }) => {
    //       console.log("Ready with Device ID", device_id);
    //     });
    //     // Not Ready
    //     player.addListener("not_ready", ({ device_id }) => {
    //       console.log("Device ID has gone offline", device_id);
    //     });
    //     // Connect to the player!
    //     player.connect();
    //   };
    // }
    this.interval = setInterval(this.getCurrentSong, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  getRoomDetails() {
    fetch("/api/get-room" + "?code=" + this.roomCode)
      .then((response) => {
        if (!response.ok) {
          this.props.leaveRoomCallback();
          this.props.history.push("/");
        }
        return response.json();
      })
      .then((data) => {
        this.setState({
          votesToSkip: data.votes_to_skip,
          guestCanPause: data.guest_can_pause,
          isHost: data.is_host,
        });
        if (this.state.isHost) {
          this.authenticateSpotify();
        }
      });
  }

  authenticateSpotify() {
    fetch("/spotify/is-authenticated")
      .then((response) => response.json())
      .then((data) => {
        this.setState({ spotifyAuthenticated: data.status }); // status was returned in Response
        if (!data.status) {
          fetch("/spotify/get-auth-url")
            .then((response) => response.json())
            .then((data) => {
              window.location.replace(data.url); // JS redirect
            });
        }
      });
  }

  getCurrentSong() {
    fetch("/spotify/current-song")
      .then((response) => {
        if (!response.ok) {
          return { "Response Error": "Could not play the song!" };
        }
        return response.json();
      })
      .then((data) => this.setState({ song: data }));
  }

  leaveButtonPressed() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/api/leave-room", requestOptions).then((_response) => {
      this.props.leaveRoomCallback();
      this.props.history.push("/");
    });
  }

  updateShowSettings(value) {
    this.setState({
      showSettings: value,
    });
  }

  renderSettings() {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <CreateRoomPage
            update={true}
            votesToSkip={this.state.votesToSkip}
            guestCanPause={this.state.guestCanPause}
            roomCode={this.roomCode}
            updateCallback={this.getRoomDetails}
          />
        </Grid>

        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="secondary"
            onClick={() => this.updateShowSettings(false)}
          >
            Close
          </Button>
        </Grid>
      </Grid>
    );
  }

  renderSettingsButton() {
    // render if host
    return (
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => this.updateShowSettings(true)}
        >
          Settings
        </Button>
      </Grid>
    );
  }

  render() {
    if (this.state.showSettings) {
      return this.renderSettings();
    }
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Typography variant="h4" component="h4">
            Code: {this.roomCode}
          </Typography>
        </Grid>

        <MusicPlayer {...this.state.song} />

        {this.state.isHost ? this.renderSettingsButton() : null}

        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="secondary"
            onClick={this.leaveButtonPressed}
          >
            Leave Room
          </Button>
        </Grid>
      </Grid>
    );
  }
}

export default Room;
