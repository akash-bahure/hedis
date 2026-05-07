import axios, { AxiosInstance } from "axios";

// Create an use a new instance of axios, separate from the one
// which has the interceptor installed.
// This avoids the deadlock where a failed refresh token request is
// indefinitely waiting for itself to complete.
const uninterceptedAxios = axios.create();
// const authApi = new AuthApi(undefined, undefined, uninterceptedAxios);

const REFRESH_TOKEN_ENDPOINT = "/api/auth/token/refresh";

// FIXME: Do we need mutual exclusion to control access to this?
let _currentRefreshPromise: Promise<{
  access: string;
  refresh: string;
}> | null = null;

async function refreshAuthToken(): Promise<{
  access: string;
  refresh: string;
}> {
  // Get user details from localStorage
  const userDetailString = localStorage.getItem("userDetail");

  const userDetail = JSON.parse(userDetailString ?? "{}");

  const refreshToken: string | undefined = userDetail.refreshToken;

  if (!refreshToken) {
    return Promise.reject("No refresh token available");
  }

  const reqBody: any = { refresh: refreshToken };
  const refreshUrl = import.meta.env.VITE_BACKEND_URL + REFRESH_TOKEN_ENDPOINT;

  // Attempt to refresh three times
  for (let i = 0; i < 3; i++) {
    try {
      const res = await uninterceptedAxios.post(refreshUrl, reqBody);

      if (!res.data?.access) {
        continue;
      }

      // Handle different response formats
      let newRefreshToken =
        res.data.refresh || res.data.refresh_token || refreshToken; // Use original if not provided

      return {
        access: res.data.access,
        refresh: newRefreshToken,
      };
    } catch (refreshTokenError: any) {
      // If we get a 401 or 403, the refresh token is likely expired
      if (
        refreshTokenError.response?.status === 401 ||
        refreshTokenError.response?.status === 403
      ) {
        break; // Don't retry if refresh token is invalid
      }
    }
  }

  return Promise.reject("Token refresh failed after all attempts");
}

async function refreshTokenInterceptor(error: any) {
  if (error.response?.status !== 401) {
    return Promise.reject(error);
  }

  let tokens: { access: string; refresh: string };

  const currentRefreshPromise = _currentRefreshPromise;

  if (currentRefreshPromise !== null) {
    // We arrived here while some other request is already trying to refresh
    // the access token. We wait for that attempt to complete instead of
    // launching our own.

    try {
      tokens = await currentRefreshPromise;
    } catch (refreshError) {
      return Promise.reject(error);
    }
  } else {
    // Set up a new token refresh request if one has not been created yet
    // Take the ownership of this request, i.e. being responsible for clearing the
    // `currentRefreshPromise` when done

    try {
      const refreshPromise = refreshAuthToken();
      _currentRefreshPromise = refreshPromise;

      try {
        tokens = await refreshPromise;
      } catch (refreshError) {
        // At this point, we have failed to refresh the token three times
        // Which is a good indication that the refresh token is itself expired or invalid
        // Clear everything and reload the entire site
        localStorage.clear();
        window.location.replace("/auth/login");
        return Promise.reject(error); // Ensure that we finish with the original error
      }
    } finally {
      // Regardless we succeeded or fail, the promise must be
      // Nulled out at the end so that a new token refresh request
      // is placed next time the token expires.
      _currentRefreshPromise = null;
    }
  }

  // Update localStorage with new tokens
  const user = JSON.parse(localStorage.getItem("userDetail") ?? "null");
  if (!user) {
    throw error;
  }

  const updatedUser = {
    ...user,
    accessToken: tokens.access,
    refreshToken: tokens.refresh,
  };

  localStorage.setItem("userDetail", JSON.stringify(updatedUser));

  const originalRequest = error.config;

  // Make sure not to retry the request if we have already done that before
  // To avoid infinite recursion
  if (originalRequest._retried) {
    throw error;
  }

  originalRequest._retried = true;
  originalRequest.headers["Authorization"] = "Bearer " + tokens.access;

  // Re-request
  return Promise.resolve(axios(originalRequest));
}

export function installRefreshTokenInterceptor(axiosInstance: AxiosInstance) {
  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      // Don't handle canceled requests
      if (error.code === "ERR_CANCELED" || !error.config) {
        return Promise.reject(error);
      }

      // Check if this was already retried to prevent infinite loops
      if (error.config._retried) {
        return Promise.reject(error);
      }
      // Try token refresh only if we have a response and it's 401
      if (error.response && error.response.status === 401) {
        return refreshTokenInterceptor(error);
      }
      return Promise.reject(error);
    }
  );
}
