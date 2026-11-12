import { useState, useEffect, useCallback, useRef } from "react";
import { safeGetItem, safeSetItem } from "@/lib/safe-storage";

export type HeadingPermissionStatus = "granted" | "denied" | "prompt" | "unsupported";

/** Persisted master switch for gyro/compass + GPS. Absence means ON. */
export const SENSORS_ENABLED_STORAGE_KEY = "autocomm.sensors.enabled";

export function readSensorsEnabledPreference(): boolean {
  if (typeof window === "undefined") return true;
  return safeGetItem(SENSORS_ENABLED_STORAGE_KEY) !== "0";
}

function requiresUserGesturePermission(): boolean {
  if (typeof window === "undefined") return false;
  const DeviceOrientationWithPermission = window.DeviceOrientationEvent as unknown as {
    requestPermission?: () => Promise<"granted" | "denied">;
  };
  return typeof DeviceOrientationWithPermission?.requestPermission === "function";
}

export interface UseDeviceHeadingResult {
  heading: number; // 0° - 360°
  isLiveSensor: boolean;
  permissionStatus: HeadingPermissionStatus;
  requestPermission: () => Promise<boolean>;
  setManualHeading: (deg: number) => void;
  turnHeadingBy: (delta: number) => void;
  /** Master sensor switch. Defaults to true; persisted across sessions. */
  sensorsEnabled: boolean;
  setSensorsEnabled: (enabled: boolean) => void;
}

export function useDeviceHeading(initialHeading = 45): UseDeviceHeadingResult {
  const [heading, setHeading] = useState<number>(initialHeading);
  const [isLiveSensor, setIsLiveSensor] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] = useState<HeadingPermissionStatus>("prompt");
  const [sensorsEnabled, setSensorsEnabledState] = useState<boolean>(() =>
    readSensorsEnabledPreference(),
  );

  // Performance Optimization: Throttle hardware sensor updates to prevent high-frequency React re-renders on budget Android CPUs
  const lastUpdateRef = useRef<number>(0);
  const lastHeadingRef = useRef<number>(initialHeading);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    const now = performance.now();
    // Throttle to max 20 FPS (~50ms) to protect mobile CPU
    if (now - lastUpdateRef.current < 50) return;

    // webkitCompassHeading is native to iOS Safari (0 = North)
    // alpha handles Android (requires absolute orientation pairing)
    const eventWithWebkit = event as unknown as { webkitCompassHeading?: number };
    let currentHeading: number | null = null;

    if (
      typeof eventWithWebkit.webkitCompassHeading === "number" &&
      !isNaN(eventWithWebkit.webkitCompassHeading)
    ) {
      currentHeading = eventWithWebkit.webkitCompassHeading;
    } else if (typeof event.alpha === "number" && !isNaN(event.alpha)) {
      currentHeading = (360 - event.alpha) % 360;
    }

    if (currentHeading !== null) {
      const rounded = Math.round(currentHeading);

      // Deadband filter: only propagate if changed by at least 1 degree or if 200ms have passed
      const delta = Math.abs(rounded - lastHeadingRef.current);
      if (delta >= 1 || now - lastUpdateRef.current > 200) {
        lastUpdateRef.current = now;
        lastHeadingRef.current = rounded;
        setHeading(rounded);
        setIsLiveSensor(true);
        setPermissionStatus("granted");
      }
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined") return false;

    const DeviceOrientationWithPermission = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    };

    if (typeof DeviceOrientationWithPermission?.requestPermission === "function") {
      try {
        const response = await DeviceOrientationWithPermission.requestPermission();
        if (response === "granted") {
          window.addEventListener("deviceorientation", handleOrientation, true);
          setPermissionStatus("granted");
          return true;
        } else {
          setPermissionStatus("denied");
          return false;
        }
      } catch {
        setPermissionStatus("denied");
        return false;
      }
    } else if ("DeviceOrientationEvent" in window) {
      window.addEventListener("deviceorientation", handleOrientation, true);
      setPermissionStatus("granted");
      return true;
    } else {
      setPermissionStatus("unsupported");
      return false;
    }
  }, [handleOrientation]);

  const setSensorsEnabled = useCallback(
    (enabled: boolean) => {
      safeSetItem(SENSORS_ENABLED_STORAGE_KEY, enabled ? "1" : "0");
      setSensorsEnabledState(enabled);
      if (!enabled) {
        // Master switch off: detach immediately and report manual mode.
        if (typeof window !== "undefined") {
          window.removeEventListener("deviceorientation", handleOrientation, true);
        }
        setIsLiveSensor(false);
      } else if (requiresUserGesturePermission()) {
        // A toggle tap is a user gesture, so request at once on iOS instead
        // of waiting for the next interaction.
        void requestPermission();
      }
    },
    [handleOrientation, requestPermission],
  );

  useEffect(() => {
    if (typeof window === "undefined" || !sensorsEnabled) return;

    // On standard browsers without iOS permission requirement, attach listener directly
    if (!requiresUserGesturePermission()) {
      if ("DeviceOrientationEvent" in window) {
        window.addEventListener("deviceorientation", handleOrientation, true);
      } else {
        setPermissionStatus("unsupported");
      }
      return () => {
        window.removeEventListener("deviceorientation", handleOrientation, true);
      };
    }

    // iOS requires requestPermission() inside a user gesture, so auto-request on
    // the first tap/keypress anywhere. One attempt per mount; the drawer button
    // stays as a manual fallback.
    let settled = false;
    const removeGestureListeners = () => {
      window.removeEventListener("pointerdown", autoRequestOnGesture);
      window.removeEventListener("touchend", autoRequestOnGesture);
      window.removeEventListener("keydown", autoRequestOnGesture);
    };
    const autoRequestOnGesture = () => {
      if (settled) return;
      settled = true;
      removeGestureListeners();
      void requestPermission();
    };
    window.addEventListener("pointerdown", autoRequestOnGesture);
    window.addEventListener("touchend", autoRequestOnGesture);
    window.addEventListener("keydown", autoRequestOnGesture);

    return () => {
      removeGestureListeners();
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, [handleOrientation, requestPermission, sensorsEnabled]);

  const setManualHeading = useCallback((deg: number) => {
    const normalized = ((deg % 360) + 360) % 360;
    lastHeadingRef.current = normalized;
    setHeading(normalized);
  }, []);

  const turnHeadingBy = useCallback((delta: number) => {
    setHeading((prev) => {
      const next = Math.round((prev + delta + 360) % 360);
      lastHeadingRef.current = next;
      return next;
    });
  }, []);

  return {
    heading,
    isLiveSensor,
    permissionStatus,
    requestPermission,
    setManualHeading,
    turnHeadingBy,
    sensorsEnabled,
    setSensorsEnabled,
  };
}
