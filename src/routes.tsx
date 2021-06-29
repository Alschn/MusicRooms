import React from "react";
import { Route } from "react-router-dom";
import CreateRoomPage from "./components/CreateRoomPage";
import HomePage from "./components/HomePage";
import RoomJoinPage from "./components/JoinRoomPage";
import SpotifyCallback from "./components/spotify/SpotifyCallback";
import MusicRoom from "./components/MusicRoom";
import WebPlayer from "./components/spotify/WebPlayer";
import Hoc from "./hoc/hoc";

const BaseRouter = () => (
  <Hoc>
    <Route path="/callback" component={SpotifyCallback}/>

    <Route exact path="/" component={HomePage}/>
    <Route path="/join" component={RoomJoinPage}/>
    <Route path="/create" component={CreateRoomPage}/>
    <Route path="/rooms/:roomCode">
      <WebPlayer>
        <MusicRoom/>
      </WebPlayer>
    </Route>
  </Hoc>
);

export default BaseRouter;
