import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from '@material-ui/core/Grid';
import Paper from "@material-ui/core/Paper";
import Typography from '@material-ui/core/Typography';
import axios from "axios";
import Cookies from 'js-cookie';
import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { useHistory, useParams } from 'react-router-dom';
import useScript from "react-script-hook";
import { BASE_URL, sample_messages, SOCKET_URL } from "../utils/config";
import Chat from "./room/Chat"
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";
import Queue from "./room/Queue";

const spotifyToken = Cookies.get('spotifyAuthToken');

const MusicRoom = (props) => {
  // Hooks
  let history = useHistory();
  const {roomCode} = useParams();
  const ws = useRef(null);

  // Spotify Web Playback SDK
  const [loading, error] = useScript({
    src: "https://sdk.scdn.co/spotify-player.js",
    onload: () => {
      console.log('Script has been loaded');
    }
  });

  const [sdk, setSdk] = useState(null);
  const [deviceID, setDeviceID] = useState(null);

  const [currentTrack, setCurrentTrack] = useState({});
  const [playback, setPlayback] = useState(0);
  const [playbackState, setPlaybackState] = useState({
    play: false,
    shuffle: false,
    repeat: false,
    progress: 0,
    total_time: 0,
  });

  // room state
  const [votesToSkip, setVotesToSkip] = useState(2);
  const [guestCanPause, setGuestCanPause] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // chat input & content
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(sample_messages);

  const token = localStorage.getItem('token');
  const headers = {
    'Authorization': `Token ${token}`,
    'Content-Type': 'application/json',
  }


  useEffect(() => {
    getRoomDetails();
  }, [])

  useEffect(() => {
    ws.current = new WebSocket(`${SOCKET_URL}/ws/rooms/${roomCode}/`);

    ws.current.onopen = () => {
      console.log("WebSocket open");
    }

    ws.current.onclose = () => {
      console.log("WebSocket closed")
    }

    return () => {
      ws.current.close();
    }
  }, [])

  useEffect(() => {
    if (!ws.current) return;

    ws.current.onmessage = e => {
      const parsedData = JSON.parse(e.data);
      console.log(parsedData);
      if (parsedData.command === "new_message") {
        const {text, time} = parsedData;
        addMessage({text, time, user: 1});
      } else if (parsedData.command === "request_fetch") {
        if (isHost) {
          // send message with current player state
        }
      } else if (parsedData.command === "fetch_current_song" && !isHost) {
        // fetch host's player state
      }
    }
  }, [])

  useEffect(() => {
    const waitForSpotifyWebPlaybackSDKToLoad = async () => {
      return new Promise((resolve) => {
        if (window.Spotify) {
          resolve(window.Spotify);
        } else {
          window.onSpotifyWebPlaybackSDKReady = () => {
            resolve(window.Spotify);
          };
        }
      });
    }

    (async () => {
      const {Player} = await waitForSpotifyWebPlaybackSDKToLoad();
      console.log("The Web Playback SDK has loaded.");
      const sdk = new Player({
        name: "Music Rooms - music player",
        volume: 0.3,
        getOAuthToken: (callback) => {
          callback(spotifyToken);
        },
      });

      sdk.on('authentication_error', ({message}) => {
        console.error('Failed to authenticate', message)
      })

      setSdk(sdk);

      sdk.addListener("ready", ({device_id}) => {
        console.log('Ready with device: ' + device_id);
        setDeviceID(device_id);

        playFromDevice(device_id);
      });

      sdk.addListener("player_state_changed", (state) => {
        try {
          const {
            duration,
            position,
            paused,
            shuffle,
            repeat_mode,
            track_window,
          } = state;
          const {current_track} = track_window;

          setCurrentTrack(current_track);
          setPlayback(position);
          setPlaybackState((state) => ({
            ...state,
            is_playing: !paused,
            shuffle: shuffle,
            repeat: repeat_mode !== 0,
            progress: position,
            total_time: duration
          }))


        } catch (err) {
          console.log(err);
        }
      });

      sdk.connect().then((success) => {
        if (success) {
          console.log("The Web Playback SDK successfully connected to Spotify!");
        }
      });

    })();
  }, [spotifyToken]);

  const playFromDevice = (device_id) => {
    const offset = Math.floor(Math.random() * 240);
    const initialPlaylist = 'spotify:playlist:2nkpYhOstKgPYu5qy6Q5Xy';

    axios.put(
      `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`,
      {
        context_uri: initialPlaylist,
        offset: {position: offset}
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${spotifyToken}`
        }
      }
    ).then(() => {
    }).catch(err => console.error(err))
  }

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
      ws.current.send(JSON.stringify({...new_message}));
      setMessage("");
    }
  }

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  }

  const getRoomDetails = () => {
    axios.get(BASE_URL + "/api/get-room" + "?code=" + roomCode, {
      headers: headers
    })
      .then((response) => {
        setVotesToSkip(response.data.votes_to_skip);
        setGuestCanPause(response.data.guest_can_pause);
        setIsHost(response.data.is_host);
      }).catch(() => {
        history.push("/");
      }
    );
  }

  const leaveButtonPressed = () => {
    axios.post(BASE_URL + "/api/leave-room", {
      roomCode: roomCode
    }, {
      headers: headers
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

        {deviceID && <Queue />}
      </Grid>

      <Grid container item xs={12} md={6} lg={4} justify="center">
        <Chat
          messages={messages}
          handleChangeInput={handleInputChange}
          handleSendMessage={handleSendMessage}
        />
      </Grid>

      {isHost ? renderSettingsButton() : null}

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