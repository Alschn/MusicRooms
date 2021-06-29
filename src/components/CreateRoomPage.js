import { Collapse } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import Grid from "@material-ui/core/Grid";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Alert from "@material-ui/lab/Alert";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../utils/axiosClient";
import { BASE_URL } from "../utils/config";


export class CreateRoomPage extends Component {
  static defaultProps = {
    votesToSkip: 2,
    guestCanPause: true,
    update: false,
    roomCode: null,
    updateCallback: () => {
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      guestCanPause: this.props.guestCanPause,
      votesToSkip: this.props.votesToSkip,
      successMsg: "",
      errorMsg: "",
    };
  }

  handleVotesChanged = e => {
    if (Number(e.target.value) > 1) {
      this.setState({
        votesToSkip: e.target.value,
      });
    }
  }

  handleGuestCanPauseChanged = e => {
    this.setState({
      guestCanPause: e.target.value === "true",
    });
  }

  handleCreateButtonPressed = () => {
    axiosClient.post(BASE_URL + "/api/create-room", {
      votes_to_skip: this.state.votesToSkip,
      guest_can_pause: this.state.guestCanPause,
    })
      .then((response) => {
        this.props.history.push("/rooms/" + response.data.code);
      }).catch(err => console.log(err));
  }

  handleUpdateButtonPressed = () => {
    axiosClient.patch(BASE_URL + "/api/update-room", {
      votes_to_skip: this.state.votesToSkip,
      guest_can_pause: this.state.guestCanPause,
      code: this.props.roomCode,
    }).then((res) => {
      this.setState({
        successMsg: "Room updated successfully!",
      });
      this.props.updateCallback();
    }).catch(err => {
      err.response && this.setState({
        errorMsg: `An error has occurred! Status: ${err.response.status}`,
      });
    });
  }

  renderCreateButtons() {
    return (
      <Grid container>
        <Grid item xs={12} align="center">
          <Button
            color="primary"
            variant="contained"
            onClick={this.handleCreateButtonPressed}
          >
            Create A Room
          </Button>
        </Grid>

        <Grid item xs={12} align="center">
          <Button color="secondary" variant="contained" to="/" component={Link}>
            Back
          </Button>
        </Grid>
      </Grid>
    );
  }

  renderUpdateButtons() {
    return (
      <Grid container direction="column">
        <Grid item xs={12}>
          <Button
            color="primary"
            variant="contained"
            onClick={this.handleUpdateButtonPressed}
          >
            Update Room
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => this.props.updateShowSettings(false)}
          >
            Close
          </Button>
        </Grid>
      </Grid>
    );
  }

  render() {
    const title = this.props.update ? "Update Room" : "Create Room";

    return (
      <Grid container className="centeredContainer">
        <Grid item xs={12} align="center">
          <Collapse
            in={this.state.errorMsg !== "" || this.state.successMsg !== ""}
          >
            {this.state.successMsg !== "" ? (
              <Alert
                severity="success"
                onClose={() => {
                  this.setState({successMsg: ""});
                }}
              >
                {this.state.successMsg}
              </Alert>
            ) : (
              <Alert
                severity="error"
                onClose={() => {
                  this.setState({errorMsg: ""});
                }}
              >
                {this.state.errorMsg}
              </Alert>
            )}
          </Collapse>
        </Grid>

        <Grid item xs={12} align="center">
          <Typography component="h4" variant="h4">
            {title}
          </Typography>
        </Grid>

        <Grid item xs={12} align="center">
          <FormControl component="fieldset">
            <FormHelperText style={{textAlign: "center"}}>
              Guest Control of Playback State
            </FormHelperText>
            <RadioGroup
              row
              defaultValue={this.props.guestCanPause.toString()}
              onChange={this.handleGuestCanPauseChanged}
            >
              <FormControlLabel
                value="true"
                control={<Radio color="primary"/>}
                label="Play/Pause"
                labelPlacement="bottom"
              />

              <FormControlLabel
                value="false"
                control={<Radio color="secondary"/>}
                label="No Control"
                labelPlacement="bottom"
              />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12} align="center">
          <FormControl>
            <TextField
              required={true}
              onChange={this.handleVotesChanged}
              type="number"
              defaultValue={this.props.votesToSkip}
              inputProps={{
                min: 1,
                style: {textAlign: "center"},
              }}
            />
            <FormHelperText style={{textAlign: "center"}}>
              Votes Required To Skip Song
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* if it is update view, then display update buttons, else Create buttons */}
        {this.props.update
          ? this.renderUpdateButtons()
          : this.renderCreateButtons()}
      </Grid>
    );
  }
}

export default CreateRoomPage;
