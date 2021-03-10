import React, { Component } from "react";
import {
  Grid,
  Typography,
  Card,
  IconButton,
  LinearProgress,
} from "@material-ui/core";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import PauseIcon from "@material-ui/icons/Pause";

const headers = {
  "Authorization": `Token ${localStorage.getItem('token')}`,
  "Content-Type": "application/json",
};

export default class MusicPlayer extends Component {
  constructor(props) {
    super(props);
    console.log(props);
  }

  skipSong() {
    const requestOptions = {
      method: "POST",
      headers: headers,
    };
    fetch("/spotify/skip", requestOptions)
      .then(() => {
      });
  }

  pauseSong() {
    const requestOptions = {
      method: "PUT",
      headers: headers,
    };
    fetch("/spotify/pause", requestOptions)
      .then(() => {
      });
  }

  playSong() {
    const requestOptions = {
      method: "PUT",
      headers: headers,
    };
    fetch("/spotify/play", requestOptions)
      .then(() => {
      });
  }

  render() {
    let artists_str = "";
    this.props.track.artists.map(
      (artist, i, arr) => artists_str += (i !== arr.length - 1 ? `${artist.name}, ` : `${artist.name}`)
    );
    const songProgressPercentage =
      (this.props.playbackState.progress / this.props.playbackState.total_time) * 100;
    return (
      <Card className="player">
        <Grid container alignItems="center" justify="center">
          <Grid item align="center" xs={4}>
            <img src={this.props.track.album.images[0].url} height="100%" width="100%" alt=""/>
          </Grid>

          <Grid item align="center" xs={8}>
            <Typography component="h5" variant="h5">
              {this.props.track.name}
            </Typography>

            <Typography color="textSecondary" variant="subtitle1">
              {artists_str}
            </Typography>

            <div>
              <IconButton
                onClick={() =>
                  this.props.playbackState.is_playing ? this.pauseSong() : this.playSong()
                }
              >
                {this.props.playbackState.is_playing ? <PauseIcon/> : <PlayArrowIcon/>}
              </IconButton>
              <IconButton onClick={() => this.skipSong()}>
                <SkipNextIcon/>
              </IconButton>
              <h3>
                {/*Votes: {this.props.votes} / {this.props.votes_required}*/}
              </h3>
            </div>
          </Grid>
        </Grid>
        <LinearProgress variant="determinate" value={songProgressPercentage}/>
      </Card>
    );
  }
}
