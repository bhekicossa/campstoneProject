// import axios from "./axios";

// const instance = axios.create({
//   baseURL: "http://localhost:5000/api",
// });

// instance.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default instance;

import axios from "axios"; // ✅ import the npm package, not your file

const instance = axios.create({
  baseURL: "https://airbnbcampstone-fb23353c2f38.herokuapp.com/api",
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;