import { useEffect, useState } from "react";
import alertsData from "@/data/alerts.json";

interface Alert {
  message: string;
}

const AlertScroller = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // Load alerts from static JSON (can be replaced with API call later)
    setAlerts(alertsData);
  }, []);

  if (alerts.length === 0) return null;

  // Create a continuous string of alerts with separators
  const alertText = alerts.map((alert) => alert.message).join("     •     ");
  // Duplicate for seamless looping
  const scrollingText = `${alertText}     •     ${alertText}`;

  return (
    <div className="alert-scroller-container">
      <div className="alert-scroller-track">
        <span className="alert-scroller-text">{scrollingText}</span>
      </div>
    </div>
  );
};

export default AlertScroller;
