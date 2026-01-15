import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/api/v1",  
  withCredentials: true,                   
});

// Add request interceptor to attach token from localStorage
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("bidgrid_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem("bidgrid_refresh");
      if (refreshToken) {
        try {
          const res = await axios.post(
            "http://localhost:5000/api/v1/users/refresh-token",
            {},
            { 
              withCredentials: true,
              headers: { Authorization: `Bearer ${refreshToken}` }
            }
          );
          
          const newToken = res.data.data?.accessToken;
          if (newToken) {
            localStorage.setItem("bidgrid_token", newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return instance(originalRequest);
          }
        } catch (refreshError) {
          // Clear storage on refresh failure
          localStorage.removeItem("bidgrid_user");
          localStorage.removeItem("bidgrid_token");
          localStorage.removeItem("bidgrid_refresh");
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default instance;

