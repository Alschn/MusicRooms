import React, { Component } from "react";
import { Grid, Button, Typography } from "@material-ui/core";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";
import axios from "axios";
import { connect } from "react-redux";
import CircularProgress from "@material-ui/core/CircularProgress";


export class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      votesToSkip: 2,
      guestCanPause: false,
      isHost: false,
      showSettings: false,
      song: {},
    };
    this.roomCode = this.props.match.params.roomCode; // react router
    this.updateShowSettings = this.updateShowSettings.bind(this);
    this.renderSettingsButton = this.renderSettingsButton.bind(this);
    this.renderSettings = this.renderSettings.bind(this);
    this.getRoomDetails = this.getRoomDetails.bind(this);
    this.getRoomDetails();
  }

  componentDidMount() {
    this.interval = setInterval(this.getCurrentSong, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  getRoomDetails() {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    }
    axios.get("/api/get-room" + "?code=" + this.roomCode, {
      headers: headers
    })
      .then((response) => { // do something in case of error here
        this.setState({
          votesToSkip: response.data.votes_to_skip,
          guestCanPause: response.data.guest_can_pause,
          isHost: response.data.is_host,
        });
      }).catch(err => {
        this.props.history.push("/");
      }
    );
  }

  getCurrentSong = () => {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    }
    axios.post("/spotify/current-song", {
      roomCode: this.roomCode
    }, {
      headers: headers
    })
      .then((data) => this.setState({song: data}));
  }

  leaveButtonPressed = () => {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    }
    axios.post("/api/leave-room", {
      roomCode: this.roomCode
    }, {
      headers: headers
    }).then((response) => {
      this.props.history.push("/");
    }).catch(err => {
      console.log(err);
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
      <Grid container spacing={1} className="center">
        <Grid item xs={12} align="center">
          <Typography variant="h4" component="h4">
            Code: {this.roomCode}
          </Typography>
        </Grid>

        <div style={{marginLeft: "auto", marginRight: "auto"}}>
          { // check if song data has been fetched (object has any keys)
            Object.keys(this.state.song).length !== 0
              ?
              <MusicPlayer {...this.state.song.data} code={this.roomCode}/>
              :
              <div style={{paddingTop: "100px", paddingBottom: "100px"}}>
                <CircularProgress/>
              </div>
          }
        </div>

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

const mapStateToProps = state => {
  return {
    authenticated: state.auth.token !== null
  };
};

export default connect(mapStateToProps)(Room);
