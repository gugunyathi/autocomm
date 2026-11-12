/**
 * Device sensor default-on behavior.
 *
 * Gyro/compass + GPS must be active by default with no manual enable step:
 * - sensorsEnabled defaults to true and persists across sessions
 * - standard browsers attach the orientation listener on mount
 * - iOS (permission-gated) auto-requests on the first user tap anywhere
 * - disabling removes listeners; re-enabling restores them
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useDeviceHeading,
  SENSORS_ENABLED_STORAGE_KEY,
  readSensorsEnabledPreference,
} from "../hooks/useDeviceHeading";

interface TestWindowWithOrientation {
  DeviceOrientationEvent?: unknown;
}

function testWindow(): TestWindowWithOrientation {
  return window as unknown as TestWindowWithOrientation;
}

function mockStandardBrowser() {
  testWindow().DeviceOrientationEvent = function DeviceOrientationEvent() {};
}

function mockIosBrowser(onGrant: () => void = () => {}) {
  testWindow().DeviceOrientationEvent = {
    requestPermission: vi.fn(async () => {
      onGrant();
      return "granted" as const;
    }),
  };
}

function orientationListenerCalls(spy: ReturnType<typeof vi.spyOn>) {
  return (spy.mock.calls as unknown[][]).filter(([type]) => type === "deviceorientation");
}

// This jsdom setup ships without localStorage; provide a fresh in-memory
// Storage per test so preference persistence is exercised honestly.
function installMemoryStorage() {
  const store = new Map<string, string>();
  const storage = {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (index: number) => [...store.keys()][index] ?? null,
    get length() {
      return store.size;
    },
  };
  Object.defineProperty(window, "localStorage", {
    value: storage,
    writable: true,
    configurable: true,
  });
  return storage;
}

describe("sensor enabled preference", () => {
  beforeEach(() => {
    installMemoryStorage();
  });

  it("defaults to enabled when nothing is stored", () => {
    expect(readSensorsEnabledPreference()).toBe(true);
  });

  it("reads back a stored disabled preference", () => {
    window.localStorage.setItem(SENSORS_ENABLED_STORAGE_KEY, "0");
    expect(readSensorsEnabledPreference()).toBe(false);
  });
});

describe("useDeviceHeading default-on", () => {
  let addSpy: ReturnType<typeof vi.spyOn>;
  let removeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    installMemoryStorage();
    delete testWindow().DeviceOrientationEvent;
    addSpy = vi.spyOn(window, "addEventListener");
    removeSpy = vi.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete testWindow().DeviceOrientationEvent;
  });

  it("is enabled by default and attaches the compass listener on mount", () => {
    mockStandardBrowser();
    const { result } = renderHook(() => useDeviceHeading(45));

    expect(result.current.sensorsEnabled).toBe(true);
    expect(orientationListenerCalls(addSpy)).toHaveLength(1);
  });

  it("does not attach any listener when sensors were disabled previously", () => {
    window.localStorage.setItem(SENSORS_ENABLED_STORAGE_KEY, "0");
    mockStandardBrowser();
    const { result } = renderHook(() => useDeviceHeading(45));

    expect(result.current.sensorsEnabled).toBe(false);
    expect(orientationListenerCalls(addSpy)).toHaveLength(0);
  });

  it("auto-requests iOS permission on the first tap anywhere, with no manual step", async () => {
    mockIosBrowser();
    const { result } = renderHook(() => useDeviceHeading(45));
    const requestPermission = (
      testWindow().DeviceOrientationEvent as { requestPermission: () => Promise<string> }
    ).requestPermission;

    expect(result.current.sensorsEnabled).toBe(true);
    expect(requestPermission).not.toHaveBeenCalled();

    await act(async () => {
      window.dispatchEvent(new Event("pointerdown"));
    });

    expect(requestPermission).toHaveBeenCalledTimes(1);
    expect(result.current.permissionStatus).toBe("granted");
    expect(orientationListenerCalls(addSpy).length).toBeGreaterThanOrEqual(1);
  });

  it("disabling removes the listener and persists off; re-enabling restores it", () => {
    mockStandardBrowser();
    const { result } = renderHook(() => useDeviceHeading(45));
    expect(orientationListenerCalls(addSpy)).toHaveLength(1);

    act(() => {
      result.current.setSensorsEnabled(false);
    });

    expect(result.current.sensorsEnabled).toBe(false);
    expect(result.current.isLiveSensor).toBe(false);
    expect(window.localStorage.getItem(SENSORS_ENABLED_STORAGE_KEY)).toBe("0");
    expect(orientationListenerCalls(removeSpy).length).toBeGreaterThanOrEqual(1);

    act(() => {
      result.current.setSensorsEnabled(true);
    });

    expect(result.current.sensorsEnabled).toBe(true);
    expect(window.localStorage.getItem(SENSORS_ENABLED_STORAGE_KEY)).toBe("1");
    expect(orientationListenerCalls(addSpy).length).toBeGreaterThanOrEqual(2);
  });
});
