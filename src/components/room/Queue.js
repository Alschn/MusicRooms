import { Paper } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import React from "react";
import "./queue.scss";
import { getArtistsString } from "../utilities";

const Queue = ({queue, setQueue}) => {

  const deleteItemFromQueue = (index) => {
    let _queue = queue;
    _queue.splice(index, 1)
    setQueue([..._queue])
  }

  return (
    <Grid className="queue" component={Paper}>
      <h2>Playlist:</h2>
      {queue.length > 0 && queue.map((track, index) => (
        <div key={index + track.name} className="queue-item">
          <img className="queue-item-img" src={track.album.images[2].url} alt="album-cover"/>
          <p className="queue-item-desc">
            {track.name} - {getArtistsString(track.artists)}
          </p>
          <div className="queue-item-delete">
            <IconButton aria-label="delete" onClick={() => {
              deleteItemFromQueue(index)
            }}>
              <DeleteIcon/>
            </IconButton>
          </div>
        </div>
      ))}
    </Grid>
  )
}

export default Queue;
