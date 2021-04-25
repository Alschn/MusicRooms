import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import React from "react";

const Queue = ({queue}) => {

  return (
    <Grid item xs={12} component={Paper}>
      <h1>Queue</h1>
      {queue && queue.map((item) => (<p onClick={() => {
      }}>{JSON.stringify(item.name)}</p>))}
    </Grid>
  )
}

export default Queue;
