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
    // maxWidth: 360,
    // backgroundColor: theme.palette.background.paper,
    marginBottom: 10,
  },
}));

const Listeners = (props) => {
  const classes = useStyles();

  const [listeners, setListeners] = useState([{
    name: 'Adam',
  }, {
    name: 'Damian'
  }]);

  const addListeners = (listener) => {
    setListeners((state) => [...state, listener])
  }

  return (
    <List
      className={classes.root}
      component={Paper}
      subheader={
        <ListSubheader>
          Listeners ({listeners.length}):
        </ListSubheader>}
    >
      {listeners.map((listener, index) => (<ListItem key={`listener${index}`}>
        <ListItemText>{listener.name}</ListItemText>
      </ListItem>))}
    </List>
  );
};

export default Listeners;