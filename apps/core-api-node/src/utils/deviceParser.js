const UAParser = require("ua-parser-js");

const getDeviceName = (userAgent) => {
  const parser = new UAParser(userAgent);
  const ua = parser.getResult();

  const browser = ua.browser.name || "Unknown Browser";
  const os = ua.os.name || "Unknown OS";
  const deviceType = ua.device.type || "Desktop";

  return deviceType === "mobile" ? `${browser} - Mobile` : `${browser} - ${os}`;
};

module.exports = {
  getDeviceName,
};
