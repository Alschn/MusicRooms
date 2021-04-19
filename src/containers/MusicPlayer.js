import { Card, Grid, IconButton, LinearProgress, makeStyles, Typography, } from "@material-ui/core";
import PauseIcon from "@material-ui/icons/Pause";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import React from "react";
import { BASE_URL } from "../utils/config";

const headers = {
  "Authorization": `Token ${localStorage.getItem('token')}`,
  "Content-Type": "application/json",
};

const MusicPlayer = (props) => {
  const skipSong = () => {
    const requestOptions = {
      method: "POST",
      headers: headers,
    };
    fetch(BASE_URL + "/spotify/skip", requestOptions)
      .then(() => {
      });
  }

  const pauseSong = () => {
    const requestOptions = {
      method: "PUT",
      headers: headers,
    };
    fetch(BASE_URL + "/spotify/pause", requestOptions)
      .then(() => {
      });
  }

  const playSong = () => {
    const requestOptions = {
      method: "PUT",
      headers: headers,
    };
    fetch(BASE_URL + "/spotify/play", requestOptions)
      .then(() => {
      });
  }

  const getArtistsString = (artists) => (
    artists.reduce((total, {name}, currentIndex, arr) => (
      total += currentIndex !== arr.length - 1 ? `${name}, ` : name
    ), ``)
  )

  let {playbackState: {is_playing, progress, total_time}, track} = props;
  let artists_str = getArtistsString(track.artists);

  let songProgressPercentage =
    (progress / total_time) * 100;

  return (
    <Card className="player">
      <Grid container alignItems="center" justify="center">
        <Grid item align="center" xs={4}>
          <img src={track.album.images[0].url} height="100%" width="100%" alt=""/>
        </Grid>

        <Grid item align="center" xs={8}>
          <Typography component="h5" variant="h5">
            {track.name}
          </Typography>

          <Typography color="textSecondary" variant="subtitle1">
            {artists_str}
          </Typography>

          <div>
            <IconButton
              onClick={() =>
                is_playing ? pauseSong() : playSong()
              }
            >
              {is_playing ? <PauseIcon/> : <PlayArrowIcon/>}
            </IconButton>
            <IconButton onClick={() => skipSong()}>
              <SkipNextIcon/>
            </IconButton>
            <h3>
              {/*Votes: {props.votes} / {props.votes_required}*/}
            </h3>
          </div>
        </Grid>
      </Grid>
      <LinearProgress variant="determinate" value={songProgressPercentage}/>
    </Card>
  );
}

export default MusicPlayer;
