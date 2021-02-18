import axios from "axios";
import * as actionTypes from "./actionTypes";

export const authStart = () => {
  return {
    type: actionTypes.AUTH_START
  };
};

export const authSuccess = token => {
  return {
    type: actionTypes.AUTH_SUCCESS,
    token: token
  };
};

export const authFail = error => {
  return {
    type: actionTypes.AUTH_FAIL,
    error: error
  };
};

export const logout = () => {
  // POST '/rest-auth/logout' to logout from django and delete token
  localStorage.removeItem("token");
  localStorage.removeItem("expirationDate");
  return {
    type: actionTypes.AUTH_LOGOUT
  };
};

export const checkAuthTimeout = expirationTime => {
  return dispatch => {
    setTimeout(() => {
      dispatch(logout());
    }, expirationTime * 1000);
  };
};

export const authSpotifyLogin = (token) => {
  return dispatch => {
    dispatch(authStart());
    axios.post('http://127.0.0.1:8000/rest-auth/spotify/', {
      access_token: token
    }).then(
        res => {
          const api_token = res.data.key;
          const expirationDate = new Date(new Date().getTime() + 3600 * 1000);
          localStorage.setItem("token", api_token);
          localStorage.setItem("expirationDate", expirationDate);
          dispatch(authSuccess(api_token));
          dispatch(checkAuthTimeout(3600));
        }
    ).catch(err => {
      dispatch(authFail(err));
      console.log(err);
    })
  }
}

export const authCheckState = () => {
  return dispatch => {
    const token = localStorage.getItem("token");
    if (token === undefined) {
      dispatch(logout());
    } else {
      const expirationDate = new Date(localStorage.getItem("expirationDate"));
      if (expirationDate <= new Date()) {
        dispatch(logout());
      } else {
        dispatch(authSuccess(token));
        dispatch(
          checkAuthTimeout(
            (expirationDate.getTime() - new Date().getTime()) / 1000
          )
        );
      }
    }
  };
};
