import { AxiosError } from "axios";

export function formatNestedErrors(
  error: AxiosError<any>
): string {
  if (!error) return "Something went wrong. Please try again.";

  const errorData = error.response?.data;

  if (!errorData) {
    return error.message || "Server is not responding.";
  }

  const messages: string[] = [];

  const extractErrors = (data: unknown, parentKey = ""): void => {
    if (typeof data === "string") {
      messages.push(data);
      return;
    }

    if (Array.isArray(data)) {
      data.forEach((item) => extractErrors(item, parentKey));
      return;
    }

    if (typeof data === "object" && data !== null) {
      Object.entries(data).forEach(([key, value]) => {
        const formattedKey =
          key === "non_field_errors"
            ? ""
            : parentKey
            ? `${parentKey}.${key}`
            : key;

        if (typeof value === "string") {
          messages.push(
            formattedKey ? `${formattedKey}: ${value}` : value
          );
        } else {
          extractErrors(value, formattedKey);
        }
      });
    }
  };

  extractErrors(errorData);

  return messages.length
    ? [...new Set(messages)].join(", ")
    : "Something went wrong. Please try again.";
}