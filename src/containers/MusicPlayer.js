import { Card, Grid, IconButton, LinearProgress, Typography, } from "@material-ui/core";
import PauseIcon from "@material-ui/icons/Pause";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import React, { useContext } from "react";
import axiosClient from "../utils/axiosClient";
import { BASE_URL } from "../utils/config";
import VolumeSlider from "./room/VolumeSlider";
import { WebPlayerContext } from "./spotify/WebPlayer";
import { getArtistsString } from "./utilities";


const MusicPlayer = () => {
  const {playbackState, currentTrack} = useContext(WebPlayerContext);

  const skipSong = (forward = true) => {
    axiosClient.post(BASE_URL + "/spotify/skip", {
      forward: forward,
    }).then(() => {
    });
  }

  const pauseSong = () => {
    axiosClient.put(BASE_URL + "/spotify/pause").then(() => {
    });
  }

  const playSong = () => {
    axiosClient.put(BASE_URL + "/spotify/play").then(() => {
    });
  }

  let {is_playing, progress, total_time} = playbackState;
  let track = currentTrack;

  let artists_str = getArtistsString(track.artists);

  let songProgressPercentage =
    (progress / total_time) * 100;

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

            <VolumeSlider/>
          </div>
        </Grid>
      </Grid>
      <LinearProgress variant="determinate" value={songProgressPercentage}/>
    </Card>
  );
}

export default MusicPlayer;
