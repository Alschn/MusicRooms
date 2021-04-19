import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import React, { useState } from "react";

const Queue = (props) => {
  const [tracksQueue, setTracksQueue] = useState([]);

  return (
    <Grid item xs={12} component={Paper}>
      <h1>Queue</h1>
      {tracksQueue && tracksQueue.map((track) => (<h2>{track}</h2>))}
    </Grid>
  )
}

export default Queue;
