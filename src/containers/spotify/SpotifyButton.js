import Button from "@material-ui/core/Button";
import React from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/config";

const SpotifyLogin = () => {
  const handleSpotifyLogin = () => {
    axios.get(`${BASE_URL}/api/spotify-url`).then(
      (res) => {
        const {data: {url}} = res;
        window.location.replace(url);
      }
    ).catch(err => console.error(err));
  }

  return (
    <Button
      onClick={handleSpotifyLogin}
      variant="contained"
      color="primary"
    >
      Log in with Spotify
    </Button>
  )
};

export default SpotifyLogin;