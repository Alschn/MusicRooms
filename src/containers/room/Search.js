import { makeStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import axiosClient from "../../utils/axiosClient";
import React, { useState } from "react";
import { BASE_URL } from "../../utils/config";

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
  const [results, setResults] = useState({});

  const requestItemsSearch = () => {
    axiosClient.post(BASE_URL + "/spotify/search", {
      query: JSON.stringify(currentQuery),
      type: "track",
    }).then((response) => {
      const {data} = response;
      setResults(data);
      console.log(data);
    }).catch(err => console.error(err))
  }

  const handleSearchChange = e => {
    setCurrentQuery(e.target.value);
  }

  const handleSearchConfirm = e => {
    if (e.key === "Enter") requestItemsSearch();
  }

  return (
    <div className={classes.root}>
      <Grid item xs={12} component={Paper}>
        <TextField
          id="standard-search"
          label="Search field"
          type="search"
          onChange={e => handleSearchChange(e)}
          onKeyPress={e => handleSearchConfirm(e)}
          className={classes.root}
        />
      </Grid>

      <Grid item xs={12} component={Paper}>
        Results
      </Grid>
    </div>

  );
};

export default Search;