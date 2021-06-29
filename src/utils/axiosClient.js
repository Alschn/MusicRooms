import axios from "axios";

const client = (token = null) => {
  const defaultOptions = {
    headers: {
      Authorization: token ? `Token ${token}` : '',
      "Content-Type": "application/json",
    },
  };

  return {
    get: (url, options = {}) => axios.get(url, {...defaultOptions, ...options}),
    post: (url, data, options = {}) => axios.post(url, data, {...defaultOptions, ...options}),
    put: (url, data, options = {}) => axios.put(url, data, {...defaultOptions, ...options}),
    patch: (url, data, options = {}) => axios.patch(url, data, {...defaultOptions, ...options}),
    delete: (url, options = {}) => axios.delete(url, {...defaultOptions, ...options}),
  };
};

const axiosClient = client(localStorage.getItem('token'));
export default axiosClient;