const DEBUG = true;
export const REDIRECT_URI = DEBUG ? process.env.REACT_APP_REDIRECT_URI_DEV : process.env.REACT_APP_REDIRECT_URI;
export const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;
export const BASE_URL = 'http://127.0.0.1:8000'

export const sample_messages = [
  {
    user: 1,
    text: "Hey man, What's up ?",
    time: "09:30"
  },
  {
    user: 2,
    text: "Hey, I am good, and you?",
    time: "09:31"
  },
  {
    user: 1,
    text: "Cool I am good",
    time: "09:32"
  },
]