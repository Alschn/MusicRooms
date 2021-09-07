import { Paper } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { BASE_URL } from "../../utils/config";
import "./recommended.scss";

const Recommended = ({track_id}) => {
  const [results, setResults] = useState([]);
  const [resultsLimit, setResultsLimit] = useState(12);

  useEffect(() => {
    const getRecommendations = (track_id) => {
      axiosClient.post(`${BASE_URL}/spotify/recommendations`, {
        seed_tracks: track_id,
        limit: resultsLimit,
      }).then((response) => {
        const {tracks} = response.data;
        setResults(tracks)
      }).catch();
    }
    if (track_id) getRecommendations(track_id);
  }, [track_id, resultsLimit])

  return (
    <Grid container direction="row" className="recommended-container" component={Paper}>
      <Grid item xs={12}>
        <h2>Recommended tracks:</h2>
      </Grid>
      {results && results.length > 0 && results.map((track, index) => (
        <Grid item xs={12} sm={6} lg={3} key={index + track.name} className="recommended-item">
          <img src={track.album.images[0].url} alt="album-cover"/>
          <p>
            {track.name}
          </p>
        </Grid>
      ))}
    </Grid>
  )
}

export default Recommended;
