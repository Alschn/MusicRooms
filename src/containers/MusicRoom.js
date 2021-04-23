import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import React, { useContext, useEffect, useState } from "react";
import { connect } from "react-redux";
import { useHistory, useParams } from 'react-router-dom';
import axiosClient from "../utils/axiosClient";
import { BASE_URL, sample_messages } from "../utils/config";
import WebSocketInstance from "../utils/websocketClient";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";
import Chat from "./room/Chat"
import Listeners from "./room/Listeners";
import Search from "./room/Search";
import { WebPlayerContext } from "./spotify/WebPlayer";

const MusicRoom = (props) => {
  // Hooks
  let history = useHistory();
  const {roomCode} = useParams();

  // Props from parent - Web Player Context
  const {sdk, deviceID, playback, playbackState, currentTrack} = useContext(WebPlayerContext);

  // room state
  const [votesToSkip, setVotesToSkip] = useState(2);
  const [guestCanPause, setGuestCanPause] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // chat input & content
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(sample_messages);

  useEffect(() => {
    const getRoomDetails = () => {
      axiosClient.get(BASE_URL + "/api/get-room" + "?code=" + roomCode)
        .then((response) => {
          setVotesToSkip(response.data.votes_to_skip);
          setGuestCanPause(response.data.guest_can_pause);
          setIsHost(response.data.is_host);
        }).catch(() => {
          history.push("/");
        }
      );
    }
    getRoomDetails();
  }, [])

  useEffect(() => {
    WebSocketInstance.addCallbacks(() => {
    }, addMessage);
  }, [])

  useEffect(() => {
    WebSocketInstance.connect(roomCode);
    return () => {
      WebSocketInstance.disconnect();
    }
  }, [])

  const addMessage = (newMessage) => {
    setMessages(messages => [...messages, newMessage]);
  }

  const handleSendMessage = () => {
    if (message !== "") {
      let new_message = {
        user: 1,
        text: message,
        time: new Date().toLocaleDateString(),
      }
      WebSocketInstance.sendMessage(new_message);
      setMessage("");
    }
  }

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  }

  const leaveButtonPressed = () => {
    axiosClient.post(BASE_URL + "/api/leave-room", {
      roomCode: roomCode
    }).then((response) => {
      props.history.push("/");
    }).catch(err => {
      console.log(err);
    });
  }

  const updateShowSettings = (value) => {
    setShowSettings(value);
  }

  const renderSettings = () => {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <CreateRoomPage
            update={true}
            votesToSkip={votesToSkip}
            guestCanPause={guestCanPause}
            roomCode={roomCode}
            updateCallback={getRoomDetails}
          />
        </Grid>

        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="secondary"
            onClick={() => updateShowSettings(false)}
          >
            Close
          </Button>
        </Grid>
      </Grid>
    );
  }

  const renderSettingsButton = () => {
    return (
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => updateShowSettings(true)}
        >
          Settings
        </Button>
      </Grid>
    );
  }

  if (showSettings) {
    return renderSettings();
  }

  return (
    <Grid container spacing={1} justify="center">
      <Grid item xs={12} align="center">
        <Typography variant="h4" component="h4">
          Code: {roomCode}
        </Typography>
      </Grid>

      <Grid container item xs={8} md={6} lg={8} justify="center" spacing={0}>
        <Grid item xs={12}>
          {
            Object.keys(currentTrack).length !== 0 && deviceID
              ?
              <MusicPlayer
                track={currentTrack}
                code={roomCode}
                playbackState={playbackState}
              />
              :
              <div style={{paddingTop: "100px", paddingBottom: "100px"}}>
                <CircularProgress/>
              </div>
          }
        </Grid>

        {deviceID && (
          <Grid item xs={12}>
            <Search/>
          </Grid>
        )}
      </Grid>

      <Grid container item xs={12} md={6} lg={4} justify="center" spacing={0}>
        <Grid item xs={12}>
          <Listeners/>
        </Grid>
        <Grid item xs={12}>
          <Chat
            messages={messages}
            handleChangeInput={handleInputChange}
            handleSendMessage={handleSendMessage}
            currentInput={message}
          />
        </Grid>
      </Grid>

      {isHost && renderSettingsButton()}

      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="secondary"
          onClick={leaveButtonPressed}
        >
          Leave Room
        </Button>
      </Grid>

    </Grid>
  );
}


const mapStateToProps = state => {
  return {
    authenticated: state.auth.token !== null,
    token: state.auth.token,
  };
};

export default connect(mapStateToProps, null)(MusicRoom);