const DEBUG = true;
export const REDIRECT_URI = DEBUG ? process.env.REACT_APP_REDIRECT_URI_DEV : process.env.REACT_APP_REDIRECT_URI;
export const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;
export const BASE_URL = 'http://127.0.0.1:8000';
