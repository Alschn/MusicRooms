import { Paper } from "@material-ui/core";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import makeStyles from "@material-ui/core/styles/makeStyles";
import React, { useState } from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    marginBottom: 10,
    // maxWidth: 360,
    // backgroundColor: theme.palette.background.paper,
  },
}));

const Listeners = ({listeners, setListeners}) => {
  const classes = useStyles();

  return (
    <List
      className={classes.root}
      component={Paper}
      subheader={
        <ListSubheader>
          Listeners ({listeners.length}):
        </ListSubheader>}
    >
      {listeners.map(({username}, index) => (<ListItem key={`listener${index}`}>
        <ListItemText>{username}</ListItemText>
      </ListItem>))}
    </List>
  );
};

export default Listeners;