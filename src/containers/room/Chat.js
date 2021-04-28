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
import TimeAgo from 'javascript-time-ago';
import React from "react";

const timeAgo = new TimeAgo();

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

  const submitMessageWithEnter = e => {
    if (e.key === "Enter") handleSendMessage();
  }

  const formatTimestamp = timestamp => {
    const diff = Date.now() - new Date(timestamp);
    return timeAgo.format(Date.now() - diff);
  }

  const renderListItem = ({sender, content, timestamp}, key) => {
    let align;
    sender === 2 ? align = "right" : align = "left";
    return (
      <ListItem key={key}>
        <Grid container>
          <Grid item xs={12}>
            <ListItemText align={align} primary={content}/>
          </Grid>
          <Grid item xs={12}>
            <ListItemText align={align} secondary={formatTimestamp(timestamp)}/>
          </Grid>
        </Grid>
      </ListItem>
    );
  }

  return (
    <Grid container component={Paper}>
      <Grid item xs={12}>
        <List className={classes.messageArea}>
          {messages.map((message, i) => renderListItem(message, `${i}.message`))}
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