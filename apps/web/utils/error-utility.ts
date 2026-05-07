import { AxiosError } from "axios";
import { FormikErrors, FormikValues } from "formik";

const DEFAULT_ERROR_MSG = "Something went wrong.";

export function getError<T extends FormikValues>(
  error: AxiosError<FormikErrors<T>>
): {
  message: string;
  fieldErrors?: FormikErrors<T>;
} {
  if (typeof error.response?.data === "string") {
    return { message: error.response?.data };
  } else if (typeof (error.response?.data as any)?.detail === "string") {
    return { message: (error.response?.data as any)?.detail };
  } else if (
    (error.response?.data as any)?.non_field_errors instanceof Array &&
    typeof (error.response?.data as any)?.non_field_errors?.[0] === "string"
  ) {
    return {
      message: (error.response?.data as any)?.non_field_errors?.[0],
    };
  } else if (error.response?.status === 400 && error.response?.data) {
    return {
      fieldErrors: error.response.data,
      message: "Please fix below errors.",
    };
  } else {
    return { message: DEFAULT_ERROR_MSG };
  }
}

export async function throwWithJsonResponse(err: AxiosError): Promise<never> {
  if (!err.response) throw err;

  const blob = err.response.data as Blob;
  if (!blob) throw err;

  const text = await blob.text();
  err.response.data = JSON.parse(text);
  throw err;
}

function transformErrorKey(key: string) {
  const keys = key.split("_");
  if (keys.length < 1) return "-";
  return keys.join(" ");
}

export function getFieldErrorMessage<T>(fieldErr?: FormikErrors<T>) {
  if (!fieldErr) return DEFAULT_ERROR_MSG;

  let res = "Please fix: ";
  const collectedKeys = Object.keys(fieldErr ?? {});

  collectedKeys.forEach((it, ind) => {
    res += `${ind === 0 ? " " : ", "}${transformErrorKey(it)}`;
  });

  return res;
}

export function formatNestedErrors(error: any, prefix = ""): string {
  let messages: string[] = [];

  const errorData = error?.response?.data;
  if (!errorData || typeof errorData !== "object") return "";

  for (const key in errorData) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = errorData[key];

    if (Array.isArray(value)) {
      value.forEach((msg) => {
        if (typeof msg === "string") {
          messages.push(`${fullKey}: ${msg}`);
        }
      });
    } else if (typeof value === "object" && value !== null) {
      messages = messages.concat(
        formatNestedErrors({ response: { data: value } }, fullKey).split(", ")
      );
    }
  }

  return messages.join(", ");
}
