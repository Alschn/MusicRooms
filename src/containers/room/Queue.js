import IconButton from "@material-ui/core/IconButton";
import makeStyles from "@material-ui/core/styles/makeStyles";
import DeleteIcon from "@material-ui/icons/Delete";
import React from "react";
import "./queue.scss"

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
    },
  },
}));

const Queue = ({queue, setQueue}) => {
  const classes = useStyles();

  const deleteItemFromQueue = (index) => {
    let _queue = queue;
    _queue.splice(index, 1)
    setQueue([..._queue])
  }

  const getArtistsString = (artists) => {
    return artists.reduce((total, {name}, currentIndex, arr) => (
      total += currentIndex !== arr.length - 1 ? `${name}, ` : name
    ), ``)
  }

  return (
    <div className={"queue"}>
      <h2>Playlist</h2>
      {queue.length > 0 && queue.map((track, index) => (
        <div key={index + track.name} className={"queue-item"}>
          <img className="que-img" src={track.album.images[2].url} alt="album-art"/>
          <p>
            {track.name} - {getArtistsString(track.artists)}
          </p>
          <div className={classes.root}>
            <IconButton aria-label="delete">
              <DeleteIcon
                onClick={() => {
                  deleteItemFromQueue(index)
                }}
              />
            </IconButton>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Queue;
