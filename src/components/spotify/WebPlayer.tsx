import React, {createContext, FC, ReactNode, useCallback} from "react";
import axiosClient from "../../api/axiosClient";
import {WebPlaybackSDK} from "react-spotify-web-playback-sdk";

const INITIAL_VOLUME = 0.3;

export const WebPlayerContext = createContext<any>({});

interface WebPlaybackProps {
  children: ReactNode;
}

const WebPlayer: FC<WebPlaybackProps> = ({children}) => {
  const fetchSpotifyToken = () => {
    return axiosClient.get(`http://localhost:8000/api/spotify/token`)
      .then(res => res.data.token)
      .catch(err => console.log(err));
  };

  const getOAuthToken = useCallback(callback => {
    const token = fetchSpotifyToken();
    callback(token);
  }, []);

  return (
    <WebPlayerContext.Provider value={{

    }}>
      <WebPlaybackSDK
        deviceName="MusicRooms v1"
        getOAuthToken={getOAuthToken}
        volume={INITIAL_VOLUME}
        connectOnInitialized
      >
        {children}
      </WebPlaybackSDK>
    </WebPlayerContext.Provider>
  );
}

export default WebPlayer;
