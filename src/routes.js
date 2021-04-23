import React from "react";
import { Route } from "react-router-dom";
import CreateRoomPage from "./containers/CreateRoomPage";
import HomePage from "./containers/HomePage";
import RoomJoinPage from "./containers/JoinRoomPage";
import Login from "./containers/Login";
import MusicRoom from "./containers/MusicRoom";
import Room from "./containers/Room";
import WebPlayer from "./containers/spotify/WebPlayer";
import Hoc from "./hoc/hoc";

const BaseRouter = () => (
  <Hoc>
    <Route path="/login" component={Login}/>
    <Route exact path="/" component={HomePage}/>
    <Route path="/join" component={RoomJoinPage}/>
    <Route path="/create" component={CreateRoomPage}/>
    <Route path="/room/:roomCode" component={Room}/>
    <Route path="/rooms/:roomCode">
      <WebPlayer>
        <MusicRoom/>
      </WebPlayer>
    </Route>
  </Hoc>
);

export default BaseRouter;
