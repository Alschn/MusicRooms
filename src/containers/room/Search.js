import { makeStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import React, { useState } from "react";
import axiosClient from "../../utils/axiosClient";
import { BASE_URL } from "../../utils/config";
import Queue from "./Queue";

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
}));

const Search = () => {
    const classes = useStyles();
    const [currentQuery, setCurrentQuery] = useState("");
    const [resultsCount, setResultsCount] = useState(5);
    const [nextPage, setNextPage] = useState(null);
    const [results, setResults] = useState([]);

    const [queue, setQueue] = useState([]);

    const addToQueue = (item) => {
      setQueue((state) => [...state, item])
    }

    const requestItemsSearch = () => {
      axiosClient.post(BASE_URL + "/spotify/search", {
        query: JSON.stringify(currentQuery),
        type: "track",
      }).then((response) => {
        const {
          data: {
            tracks: {items}
          }
        } = response;
        setResults(items);
        // console.log(items);
      }).catch(err => console.error(err))
    }

    const handleSearchChange = e => {
      setCurrentQuery(e.target.value);
    }

    const handleSearchConfirm = e => {
      if (e.key === "Enter") requestItemsSearch();
    }

    return (
      <Grid container component={Paper}>
        <Grid xs={12}>
          <TextField
            id="standard-search"
            label="Search field"
            type="search"
            onChange={e => handleSearchChange(e)}
            onKeyPress={e => handleSearchConfirm(e)}
            className={classes.root}
          />
        </Grid>

        <Grid container xs={12} component={Paper}>

          {results && results.map((item) => (
            <Grid item xs={3} onClick={() => addToQueue(item)}>
              <img src={item.album.images[2].url} alt=""/>
              {JSON.stringify(item.name)}
            </Grid>))}
        </Grid>

        {queue.length !== 0 && (<Queue queue={queue}/>)}
      </Grid>
    );

  }
;

export default Search;