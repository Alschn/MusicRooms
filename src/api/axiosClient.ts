import axios from "axios";

const axiosClient = axios.create({
  headers: {'Content-Type': 'application/json'}
});

// before sending request attach auth token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  config.headers.Authorization = token ? `Token ${token}` : '';
  return config;
});

export default axiosClient;
