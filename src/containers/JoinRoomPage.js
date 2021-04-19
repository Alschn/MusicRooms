import { Button, Grid, TextField, Typography } from "@material-ui/core";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BASE_URL } from "../utils/config";

const JoinRoomPage = (props) => {
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");

  const handleTextFieldChange = (e) => {
    setRoomCode(e.target.value);
  }

  const roomButtonPressed = () => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        code: roomCode,
      }),
    };

    fetch(`${BASE_URL}/api/join-room`, requestOptions)
      .then((response) => {
        if (response.ok) {
          props.history.push(`/room/${roomCode}`);
        } else {
          setError("Room not found");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }


  return (
    <div>
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Typography variant="h4" component="h4">
            Join a Room
          </Typography>
        </Grid>

        <Grid item xs={12} align="center">
          <TextField
            error={error}
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
    </div>
  );
}

export default JoinRoomPage;
