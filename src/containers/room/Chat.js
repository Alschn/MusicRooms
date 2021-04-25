import { makeStyles } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import Fab from "@material-ui/core/Fab";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import SendIcon from "@material-ui/icons/Send";
import React from "react";

const useStyles = makeStyles(theme => ({
  messageArea: {
    height: "60vh",
    overflowY: "auto",
  },
  inputArea: {
    padding: 15,
  }
}));

const Chat = ({currentInput, messages, handleChangeInput, handleSendMessage}) => {
  const classes = useStyles();

  const submitMessageWithEnter = (e) => {
    if (e.key === "Enter") handleSendMessage();
  }

  const renderListItem = (message, key) => {
    const {user, text, time} = message;
    let align;
    user === 1 ? align = "right" : align = "left";
    return (
      <ListItem key={key}>
        <Grid container>
          <Grid item xs={12}>
            <ListItemText align={align} primary={text}/>
          </Grid>
          <Grid item xs={12}>
            <ListItemText align={align} secondary={time}/>
          </Grid>
        </Grid>
      </ListItem>
    );
  }

  return (
    <Grid container component={Paper}>
      <Grid item xs={12}>
        <List className={classes.messageArea}>
          {messages.map((obj, i) => renderListItem(obj, `msg${i}`))}
        </List>
        <Divider/>

        <Grid container className={classes.inputArea}>
          <Grid item xs={10}>
            <TextField id="outlined-basic-email" label="Type Something" fullWidth
                       onChange={handleChangeInput} value={currentInput} onKeyPress={submitMessageWithEnter}/>
          </Grid>
          <Grid item xs={2} align="right">
            <Fab color="primary" aria-label="add">
              <SendIcon onClick={handleSendMessage}/>
            </Fab>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Chat;