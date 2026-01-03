import { useTheme } from "../../../contexts/ThemeContext";
import { useState, useEffect } from "react";
import CustomCheckbox from "../../../hooks/customCheckbox";

const SecuritySettings = () => {
  const { currentColors } = useTheme();
  const [aiLearning, setAiLearning] = useState(false);
  const [saveHistory, setSaveHistory] = useState(false);
  const [sessionInfo, setSessionInfo] = useState({
    os: "Unknown",
    browser: "Unknown",
    location: "Unknown",
  });

  useEffect(() => {
    // Get browser info
    const getBrowser = () => {
      const ua = navigator.userAgent;
      if (ua.includes("Edg")) return "Edge";
      if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
      if (ua.includes("Firefox")) return "Firefox";
      if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
      if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
      if (ua.includes("Brave")) return "Brave";
      return "Unknown";
    };

    // Get OS info
    const getOS = () => {
      const ua = navigator.userAgent;
      if (ua.includes("Win")) return "Windows";
      if (ua.includes("Mac")) return "macOS";
      if (ua.includes("Linux")) return "Linux";
      if (ua.includes("Android")) return "Android";
      if (ua.includes("iOS") || ua.includes("iPhone")) return "iOS";
      return "Unknown";
    };

    // Get location (using timezone as fallback)
    const getLocation = () => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (
        timezone.includes("Asia/Kolkata") ||
        timezone.includes("Asia/Calcutta")
      )
        return "India";
      if (timezone.includes("America/New_York")) return "United States";
      if (timezone.includes("Europe/London")) return "United Kingdom";
      if (timezone.includes("Asia/Tokyo")) return "Japan";
      return timezone.split("/")[1]?.replace("_", " ") || "Unknown";
    };

    setSessionInfo({
      os: getOS(),
      browser: getBrowser(),
      location: getLocation(),
    });
  }, []);


  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Security & Privacy</h3>
      {/* Preferences */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">AI Language</label>
          <select className="w-full p-2 border rounded-lg">
            <option>English</option>
            <option>Hindi</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            System Language
          </label>
          <select className="w-full p-2 border rounded-lg">
            <option>English</option>
            <option>Hindi</option>
          </select>
        </div>
      </div>

      {/* Active Sessions */}
      <div>
        <h4 className="font-medium mb-2">Active Sessions</h4>
        <div className="space-y-2">
          <div
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ backgroundColor: `${currentColors.bg}` }}
          >
            <div>
              <div className="font-medium">Current Session</div>
              <div
                className="text-sm"
                style={{ color: currentColors.textSecondary }}
              >
                {sessionInfo.os} • {sessionInfo.browser} •{" "}
                {sessionInfo.location}
              </div>
            </div>
            <span className="text-green-600 text-sm">Active</span>
          </div>
        </div>
      </div>

      {/* Data Privacy */}
      <div className="space-y-2">
        <h4 className="font-medium" style={{ color: currentColors.text }}>
          Data & Privacy
        </h4>
        <CustomCheckbox
          checked={aiLearning}
          onChange={() => setAiLearning(!aiLearning)}
          label="Allow AI to learn from my email patterns"
        />
        <CustomCheckbox
          checked={saveHistory}
          onChange={() => setSaveHistory(!saveHistory)}
          label="Save conversation history for 30 days"
        />
        <button className="text-red-600 hover:text-red-700 text-sm hover:underline cursor-pointer">
          Delete All My Data
        </button>
      </div>
    </div>
  );
};

export default SecuritySettings;
