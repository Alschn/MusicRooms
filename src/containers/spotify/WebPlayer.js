import axios from "axios";
import Cookies from "js-cookie";
import React, { createContext, useEffect, useState } from "react";
import useScript from "react-script-hook";

const spotifyToken = Cookies.get('spotifyAuthToken');

export const WebPlayerContext = createContext({
  sdk: null,
  deviceID: null,
  currentTrack: {},
  playback: 0,
  playbackState: {
    play: false,
    shuffle: false,
    repeat: false,
    progress: 0,
    total_time: 0,
  },
  initialVolume: 0.3,
});

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
        volume: initialVolume,
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

  return (
    <WebPlayerContext.Provider value={{
      sdk,
      deviceID,
      currentTrack,
      playback,
      playbackState,
      initialVolume
    }}>
      {children}
    </WebPlayerContext.Provider>
  )
}

export default WebPlayer;