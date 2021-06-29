import { Card, Grid, IconButton, LinearProgress, Typography, } from "@material-ui/core";
import PauseIcon from "@material-ui/icons/Pause";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import React from "react";
import { usePlaybackState } from "react-spotify-web-playback-sdk";
import axiosClient from "../utils/axiosClient";
import { BASE_URL } from "../utils/config";
import VolumeSlider from "./room/VolumeSlider";
import { getArtistsString } from "./utilities";


const MusicPlayer = () => {
  const playbackState = usePlaybackState();

  const skipSong = (forward = true) => {
    axiosClient.post(BASE_URL + "/spotify/skip", {
      forward: forward,
    }).then(() => {
    });
  }

  const pauseSong = () => {
    axiosClient.put(BASE_URL + "/spotify/pause", {}).then(() => {
    });
  }

  const playSong = () => {
    axiosClient.put(BASE_URL + "/spotify/play", {}).then(() => {
    });
  }

  const isPlaying = () => playbackState?.paused;

  const track = playbackState?.track_window.current_track;
  const artists_str = getArtistsString(track.artists);

  const songProgressPercentage =
    (playbackState.position / playbackState.duration) * 100;

  return (
    <Card className="player">
      <Grid container alignItems="center" justify="center">
        <Grid item xs={4}>
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
            <IconButton onClick={() => skipSong(false)}>
              <SkipPreviousIcon/>
            </IconButton>

            <IconButton
              onClick={() =>
                isPlaying ? pauseSong() : playSong()
              }
            >
              {isPlaying ? <PauseIcon/> : <PlayArrowIcon/>}
            </IconButton>
            <IconButton onClick={() => skipSong()}>
              <SkipNextIcon/>
            </IconButton>
            <h3>
              {/*Votes: {props.votes} / {props.votes_required}*/}
            </h3>

            <VolumeSlider/>
          </div>
        </Grid>
      </Grid>
      <LinearProgress variant="determinate" value={songProgressPercentage}/>
    </Card>
  );
}

export default MusicPlayer;
