export const formatPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }

  return value;
};

export const formatIndianPhoneNumber = (value: string) => {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("91")) {
    digits = digits.slice(2);
  }

  digits = digits.slice(0, 10);

  if (digits.length === 0) return "";

  if (digits.length <= 5) {
    return `+91 ${digits}`;
  }

  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
};

export const extractPhoneDigits = (value: string) => {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("91")) {
    digits = digits.slice(2);
  }

  return digits.slice(0, 10);
};

//Format time properly (15:00:00 → 3:00 PM)
export const formatTime = (time: string) => {
  if (!time) return "";
  const [h, m] = time.split(":");
  const hour = Number(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${m} ${ampm}`;
};

//todays label
export const todayLabel = new Date().toLocaleDateString("en-IN", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
};
