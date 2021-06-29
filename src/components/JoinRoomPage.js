import { Button, Grid, TextField, Typography } from "@material-ui/core";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import axiosClient from "../utils/axiosClient";
import { BASE_URL } from "../utils/config";

const JoinRoomPage = () => {
  let history = useHistory();
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");

  const handleTextFieldChange = (e) => {
    setRoomCode(e.target.value);
  }

  const roomButtonPressed = () => {
    axiosClient.post(`${BASE_URL}/api/join-room`, {
      code: roomCode,
    })
      .then(() => {
        history.push(`/rooms/${roomCode}`);
      })
      .catch((error) => {
        setError("Room not found");
        console.log(error);
      });
  }

  return (
    <Grid container className="centeredContainer">
      <Grid item xs={12} align="center">
        <Typography variant="h4" component="h4">
          Join a Room
        </Typography>
      </Grid>

      <Grid item xs={12} align="center">
        <TextField
          error={error !== ""}
          label="Code"
          placeholder="Enter a Room Code"
          value={roomCode}
          helperText={error}
          variant="outlined"
          onChange={handleTextFieldChange}
        />
      </Grid>

      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="primary"
          onClick={roomButtonPressed}
        >
          Enter Room
        </Button>
      </Grid>

      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="secondary"
          to="/"
          component={Link}
        >
          Back
        </Button>
      </Grid>
    </Grid>
  );
}

export default JoinRoomPage;
