import Grid from "@material-ui/core/Grid";
import Slider from "@material-ui/core/Slider";
import { makeStyles } from "@material-ui/core/styles";
import withStyles from "@material-ui/core/styles/withStyles";
import Typography from "@material-ui/core/Typography";
import VolumeDown from "@material-ui/icons/VolumeDown";
import VolumeUp from "@material-ui/icons/VolumeUp";
import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../utils/config";
import axiosClient from "../../api/axiosClient";

const useStyles = makeStyles({
  root: {
    width: 200,
  },
});

const CustomSlider = withStyles({
  root: {
    color: "#9e9e9e",
    padding: "13px 0",
    height: 3,
    '&:hover': {
      color: "#1DB954",
      '& .MuiSlider-thumb': {
        visibility: 'visible',
      }
    },
  },
  track: {
    height: 4,
  },
  rail: {
    color: "#cccccc",
    height: 4,
  },
  active: {},
  thumb: {
    height: 15,
    width: 15,
    backgroundColor: "#fff",
    border: "1px solid currentColor",
    marginTop: -6,
    marginLeft: -6,
    visibility: "hidden",
    boxShadow: "#ebebeb 0 2px 2px",
    "&:focus, &:hover, &$active": {
      boxShadow: "#ccc 0 2px 3px 1px",
    },
    color: "#fff",
  },
})(Slider);


const VolumeSlider = () => {
  const classes = useStyles();

  const [playerVolume, setPlayerVolume] = useState(30);

  const handleChange = (e, newValue) => {
    setPlayerVolume(newValue);
  }

  const changeVolume = (volume) => {
    axiosClient.put(`${BASE_URL}/spotify/set-volume`, {
      volume: volume,
    }).then();
  };

  useEffect(() => {
    changeVolume(playerVolume);
  }, [playerVolume]);

  return (
    <div>
      <div className={classes.root}>
        <Typography id="continuous-slider" gutterBottom>
          Volume
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <VolumeDown/>
          </Grid>
          <Grid item xs>
            <CustomSlider
              defaultValue={30}
              onChange={handleChange}
              aria-labelledby="continuous-slider"
              key='custom-slider'
            />
          </Grid>
          <Grid item>
            <VolumeUp/>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default VolumeSlider;
