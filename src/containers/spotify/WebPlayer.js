import axios from "axios";
import Cookies from "js-cookie";
import React, { createContext, useEffect, useState } from "react";
import useScript from "react-script-hook";

const spotifyToken = Cookies.get('spotifyAuthToken');

export const WebPlayerContext = createContext({});

const WebPlayer = ({children}) => {
  // Spotify Web Playback SDK
  const [loading, error] = useScript({
    src: "https://sdk.scdn.co/spotify-player.js",
    onload: () => {
      console.log('Script has been loaded');
    },
    checkForExisting: true,
  });
  const initialVolume = 0.3;

  // SDK object and user's device id
  const [sdk, setSdk] = useState(null);
  const [deviceID, setDeviceID] = useState(null);

  // Playback state
  const [currentTrack, setCurrentTrack] = useState({});
  const [playback, setPlayback] = useState(0);
  const [playbackState, setPlaybackState] = useState({
    play: false,
    shuffle: false,
    repeat: false,
    progress: 0,
    total_time: 0,
  });

  // If user is a participant of a valid room, load SDK
  const [canLoadSDK, setCanLoadSDK] = useState(false);

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

  useEffect(() => {
    if (canLoadSDK) {
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
        console.log("The Web Playback SDK has been loaded.");
        const sdk = new Player({
          name: "Music Rooms - music player",
          volume: initialVolume,
          getOAuthToken: (callback) => {
            callback(spotifyToken);
          },
        });

        sdk.on('initialization_error', ({message}) => {
          console.error('Failed to initialize', message);
        });

        sdk.on('authentication_error', ({message}) => {
          console.error('Failed to authenticate', message)
        })

        sdk.on('account_error', ({message}) => {
          console.error('Failed to validate Spotify account', message);
          alert(`Failed to validate Spotify account ${message}`);
        });

        setSdk(sdk);

        sdk.addListener("ready", ({device_id}) => {
          console.log('Ready with device: ' + device_id);
          setDeviceID(device_id);
        });

        sdk.addListener('not_ready', ({device_id}) => {
          console.log('Device ID is not ready for playback', device_id);
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
    }
  }, [spotifyToken, canLoadSDK]);

  return (
    <WebPlayerContext.Provider value={{
      sdk,
      deviceID,
      currentTrack,
      playback,
      playbackState,
      initialVolume,
      playFromDevice,
      setCanLoadSDK,
    }}>
      {children}
    </WebPlayerContext.Provider>
  )
}

export default WebPlayer;