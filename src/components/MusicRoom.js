import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useHistory, useParams } from 'react-router-dom';
import { usePlaybackState, usePlayerDevice } from "react-spotify-web-playback-sdk";
import axiosClient from "../api/axiosClient";
import { BASE_URL } from "../utils/config";
import WebSocketInstance from "../utils/websocketClient";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";
import "./MusicRoom.scss";
import Chat from "./room/Chat"
import HostTracker from "./room/HostTracker";
import Listeners from "./room/Listeners";
import Recommended from "./room/Recommended";
import Search from "./room/Search";


const MusicRoom = () => {
  // Hooks
  let history = useHistory();
  const {roomCode} = useParams();

  // Props from parent - Web Player Context

  const playbackState = usePlaybackState();
  const device = usePlayerDevice();

  // room state
  const [votesToSkip, setVotesToSkip] = useState(2);
  const [guestCanPause, setGuestCanPause] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // listeners inside the room
  const [listeners, setListeners] = useState([]);

  // chat input & content
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // initialize websocket connection only if user is in valid room
  const [canJoinChat, setCanJoinChat] = useState(false);

  const getRoomDetails = useCallback(() => {
    axiosClient.get(BASE_URL + "/api/get-room" + "?code=" + roomCode)
      .then((response) => {
        setVotesToSkip(response.data.votes_to_skip);
        setGuestCanPause(response.data.guest_can_pause);
        setIsHost(response.data.is_host);
        // setCanLoadSDK(true);
        setCanJoinChat(true);
      }).catch((err) => {
        history.push("/");
      }
    );
  }, [roomCode]);

  useEffect(() => {
    getRoomDetails();
  }, [getRoomDetails])

  // useEffect(() => {
  //   if (deviceID) playFromDevice(deviceID);
  // }, [deviceID])

  useEffect(() => {
    if (canJoinChat) {
      WebSocketInstance.setCallbacks(
        {set_new_message: addMessage},
        {set_fetched_messages: ({messages}) => setMessages([...messages])},
        {set_listeners: ({users}) => setListeners([...users])},
        {send_current_song: HostSendsCurrentSong},
        {set_current_song: (playbackState) => ClientReceivesCurrentSong(playbackState)},
      )
    }
  }, [canJoinChat])

  useEffect(() => {
    if (canJoinChat) {
      WebSocketInstance.connect(roomCode);
    }
  }, [canJoinChat, roomCode])

  const addMessage = (newMessage) => {
    setMessages(messages => [...messages, newMessage]);
  }

  const handleSendMessage = () => {
    if (message !== "") {
      let new_message = {
        command: 'get_new_message',
        sender: 2,
        room: roomCode,
        content: message,
        timestamp: new Date(),
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
      WebSocketInstance.fetchListeners(roomCode);
      history.push("/");
    }).catch(err => {
      console.log(err);
    });
  }

  const updateShowSettings = (value) => {
    setShowSettings(value);
  }

  const renderSettings = () => {
    return (
      <Grid container className="centeredContainer">
        <Grid item xs={12} align="center">
          <CreateRoomPage
            update={true}
            votesToSkip={votesToSkip}
            guestCanPause={guestCanPause}
            roomCode={roomCode}
            updateCallback={getRoomDetails}
            updateShowSettings={updateShowSettings}
          />
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

  useEffect(() => {
    if (isHost && playbackState !== null) {
      const interval = setInterval(() => {
        WebSocketInstance.sendMessage({...playbackState, command: "get_current_song"});
      }, 5000)
      return () => clearInterval(interval);
    }
  }, [playbackState])

  /* Temporary methods for development: */
  const HostSendsCurrentSong = () => {
    if (isHost && playbackState !== null) {
      WebSocketInstance.sendMessage({...playbackState, command: "get_current_song"});
      console.log("Host sent state");
    }
  }

  const ClientRequestsCurrentSong = () => {
    if (!isHost) WebSocketInstance.sendMessage({command: 'request_fetch'})
  }

  const ClientReceivesCurrentSong = (state) => {
    if (!isHost) console.log(state);
  }

  const FetchChatMessages = () => {
    WebSocketInstance.fetchChatMessages(roomCode);
  }


  if (showSettings) {
    return renderSettings();
  }

  return (
    <Grid container justify="center" className="room-root">
      <Grid item xs={12} className="room-header">
        <Typography variant="h4" component="h4">
          Code: {roomCode}
        </Typography>
      </Grid>

      <Grid container item xs={8} md={6} lg={8} className="room-left">
        {!isHost &&
        (<Grid item xs={12}>
          <HostTracker connected={canJoinChat} playbackState={ClientReceivesCurrentSong}/>
        </Grid>)}

        <Grid item xs={12}>
          {
            playbackState !== null
              ?
              <MusicPlayer
                code={roomCode}
              />
              :
              <div className="room-progress">
                <CircularProgress/>
              </div>
          }
        </Grid>

        {device && (
          <>
            <Grid item xs={12}>
              <Search/>
            </Grid>

            <Grid item xs={12}>
              <Recommended track_id={''}/>
            </Grid>
          </>

        )}
      </Grid>

      <Grid item xs={8} md={6} lg={4} className="room-right">
        <Grid container direction='column'>
          <Grid item xs={12}>
            <Listeners listeners={listeners} setListeners={setListeners}/>
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

      <Grid item xs={12} align="center" style={{margin: 100, border: "2px black dashed"}} className="DEBUG">
        <Button
          variant="contained"
          color="primary"
          onClick={HostSendsCurrentSong}
        >
          Send Current Song
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={ClientRequestsCurrentSong}
        >
          Request Current Song
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={FetchChatMessages}
        >
          Fetch Chat Messages
        </Button>
      </Grid>
    </Grid>
  );
}

export default MusicRoom;
