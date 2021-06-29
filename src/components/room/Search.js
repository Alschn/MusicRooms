import { makeStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import React, { useRef, useState } from "react";
import axiosClient from "../../utils/axiosClient";
import { BASE_URL } from "../../utils/config";
import { getArtistsString } from "../utilities";
import Queue from "./Queue";
import "./search.scss";

const useStyles = makeStyles((theme) => ({
  root: {
    margin: 5,
  },
  searchRoot: {
    width: "90%",
    margin: "10px auto",
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
    },
    marginBottom: theme.spacing(1),
  }
}));

const Search = () => {
    const classes = useStyles();
    // search field input
    const [currentQuery, setCurrentQuery] = useState("");

    // spotify data pagination
    const [resultsLimit, setResultsLimit] = useState(12);
    const [nextPage, setNextPage] = useState(null);

    // search results
    const [results, setResults] = useState([]);

    // tracks queue
    const [queue, setQueue] = useState([]);

    // ref to textfield input
    const searchInputRef = useRef();

    const addToQueue = (item) => {
      axiosClient.post(`${BASE_URL}/spotify/queue`, {
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
        limit: resultsLimit,
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

    const handleSearchButtonClick = () => {
      if (searchInputRef.current.value !== "") requestItemsSearch();
    }

    const handleSearchConfirm = e => {
      if (e.key === "Enter") requestItemsSearch();
    };

    return (
      <Grid className={classes.root}>
        <Queue queue={queue} setQueue={setQueue}/>

        <Grid item xs={12} component={Paper} className="search-container">
          <TextField
            id="search-field"
            label="Search for a song"
            type="search"
            onChange={e => handleSearchChange(e)}
            onKeyPress={e => handleSearchConfirm(e)}
            className="search-bar"
            inputRef={searchInputRef}
          />

          <input className="search-button" type="submit" value="🔎" onClick={handleSearchButtonClick}/>
        </Grid>

        <Grid container item xs={12} className={classes.searchResults}>
          {results && results.map((item, index) => (
            <Grid
              item
              xs={6} md={6} lg={3}
              onClick={() => addToQueue(item)}
              className={classes.itemCard}
              key={`${index}. ${item.name}`}
            >
              <Grid item xs={12}>
                <img src={item.album.images[0].url} alt="" className="search-item-img"/>
              </Grid>

              <Grid item xs={12}>
                {JSON.stringify(item.name)}
              </Grid>

              <Grid item xs={12}>
                {getArtistsString(item.artists)}
              </Grid>
            </Grid>
          ))}
        </Grid>

      </Grid>
    );

  }
;

export default Search;