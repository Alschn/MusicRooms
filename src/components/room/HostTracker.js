import { Paper } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import React, { useEffect, useState } from "react";
import WebSocketInstance from "../../utils/websocketClient";

const HostTracker = ({connected}) => {
  const [playbackState, setPlaybackState] = useState({});

  useEffect(() => {
    WebSocketInstance.setCallbacks({set_current_song: ({state}) => setPlaybackState(state)},)
  }, [])

  return connected ? (
    <Grid container component={Paper} className="tracker-container">
      <h1>Now playing:</h1>
      {playbackState && JSON.stringify(playbackState, null, 2)}
    </Grid>
  ) : null;
};

export default HostTracker;