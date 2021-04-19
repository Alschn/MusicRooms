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

const Chat = (props) => {
  let {messages, handleChangeInput, handleSendMessage} = props;

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
    <Grid container component={Paper} className="chatSection">
      <Grid item xs={12}>
        <List className="messageArea">
          {messages.map((obj, i) => renderListItem(obj, `msg${i}`))}
        </List>
        <Divider/>

        <Grid container style={{padding: '15px'}}>
          <Grid item xs={10}>
            <TextField id="outlined-basic-email" label="Type Something" fullWidth
                       onChange={handleChangeInput}/>
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