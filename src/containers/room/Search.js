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
    margin: 5,
  },
  searchBar: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
  searchResults: {
    padding: 10,
  },
  itemCard: {
    transition: "transform 0.15s ease-in-out",
    "&:hover": {
      transform: "scale3d(1.05, 1.05, 1)",
      boxShadow: "0 8px 16px 0 rgba(0,0,0,0.2)"
    },
  }
}));

const Search = () => {
    const classes = useStyles();
    // search field input
    const [currentQuery, setCurrentQuery] = useState("");

    const [resultsCount, setResultsCount] = useState(5);
    const [nextPage, setNextPage] = useState(null);

    // search results
    const [results, setResults] = useState([]);

    // tracks queue
    const [queue, setQueue] = useState([]);

    const addToQueue = (item) => {
      axiosClient.post(`${BASE_URL}/spotify/add-to-queue`, {
        uri: item.uri
      }).then(() => {
        setQueue((state) => [...state, item])
      }).catch(() => {
      });
    };

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
      }).catch(err => console.error(err))
    };

    const handleSearchChange = e => {
      setCurrentQuery(e.target.value);
    };

    const handleSearchConfirm = e => {
      if (e.key === "Enter") requestItemsSearch();
    };

    return (
      <Grid className={classes.root}>
        <Grid item xs={12} component={Paper} className={classes.searchRoot}>
          <TextField
            id="standard-search"
            label="Search field"
            type="search"
            onChange={e => handleSearchChange(e)}
            onKeyPress={e => handleSearchConfirm(e)}
            className={classes.searchBar}
          />
        </Grid>

        <Grid container item xs={12} className={classes.searchResults}>
          {results && results.map((item) => (
            <Grid item xs={12} md={6} lg={3} onClick={() => addToQueue(item)} className={classes.itemCard}>
              <Grid item xs={12}>
                <img src={item.album.images[1].url} alt="" height={200} width={200}/>
              </Grid>
              <Grid item xs={12}>
                {JSON.stringify(item.name)}
              </Grid>
            </Grid>))}
        </Grid>

        <Queue queue={queue} setQueue={setQueue}/>
      </Grid>
    );

  }
;

export default Search;