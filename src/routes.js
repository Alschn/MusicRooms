import React from "react";
import { Route, Switch } from "react-router-dom";
import Hoc from "./hoc/hoc";
import Login from "./containers/Login";
import HomePage from "./containers/HomePage";
import RoomJoinPage from "./containers/RoomJoinPage";
import CreateRoomPage from "./containers/CreateRoomPage";
import Room from "./containers/Room";
import MusicRoom from "./containers/MusicRoom";

const BaseRouter = () => (
  <Hoc>
    <Route path="/login" component={Login}/>
    <Route exact path="/" component={HomePage}/>
    <Route path="/join" component={RoomJoinPage}/>
    <Route path="/create" component={CreateRoomPage}/>
    <Route path="/room/:roomCode" component={Room}/>
    <Route path="/rooms/:roomCode" component={MusicRoom}/>
  </Hoc>
);

export default BaseRouter;
