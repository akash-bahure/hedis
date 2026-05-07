import axios from "axios";
import { AxiosHeaders, AxiosRequestConfig, AxiosResponse } from "axios";
import { installRefreshTokenInterceptor } from "../service/interceptor";

/**
 * Subset of AxiosRequestConfig
 */
export type RequestConfig<TData = unknown> = {
  url?: string;
  method: "GET" | "PUT" | "PATCH" | "POST" | "DELETE" | "OPTIONS";
  params?: unknown;
  data?: TData | FormData;
  responseType?:
    | "arraybuffer"
    | "blob"
    | "document"
    | "json"
    | "text"
    | "stream";
  signal?: AbortSignal;
  headers?: AxiosRequestConfig["headers"];
};

/**
 * Subset of AxiosResponse
 */
export type ResponseConfig<TData = unknown> = {
  data: TData;
  status: number;
  statusText: string;
  headers?: AxiosResponse["headers"];
};

/**
 * Error response configuration
 */
export type ResponseErrorConfig<TError = unknown> = {
  response?: {
    data: TError;
    status: number;
    statusText: string;
    headers?: AxiosResponse["headers"];
  };
  message: string;
};

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, ""),
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

installRefreshTokenInterceptor(axiosInstance);

axiosInstance.interceptors.request.use(
  (config) => {
    const userDetails = JSON.parse(localStorage.getItem("userDetail") || "{}");
    if (userDetails?.accessToken) {
      config.headers = new AxiosHeaders({
        ...config.headers,
        Authorization: `Bearer ${userDetails.accessToken}`,
      });
    }

    // if (userDetails?.access) {
    //   config.headers = new AxiosHeaders({
    //     ...config.headers,
    //     Authorization: `Bearer ${userDetails.accessToken}`,
    //   });
    // }

    // Handle FormData content type
    if (config.data instanceof FormData) {
      // Remove the Content-Type header to let the browser set it with the boundary
      if (config.headers instanceof AxiosHeaders) {
        config.headers.delete("Content-Type");
      } else if (config.headers && "Content-Type" in config.headers) {
        delete config.headers["Content-Type"];
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const client = async <TData, TVariables = unknown>(
  config: RequestConfig<TVariables>
): Promise<ResponseConfig<TData>> => {
  // Check if the data is FormData and handle it here as well
  if (config.data instanceof FormData) {
    // Make sure we don't include Content-Type for FormData
    config.headers = {
      ...config.headers,
    };

    // Delete the Content-Type header if it exists
    if (config.headers && "Content-Type" in config.headers) {
      delete config.headers["Content-Type"];
    }
  }

  try {
    const response = await axiosInstance.request<
      TVariables,
      ResponseConfig<TData>
    >({ ...config });
    return response;
  } catch (error: any) {
    throw error;
  }
};

export default client;
