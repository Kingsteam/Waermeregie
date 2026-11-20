import { describe, expect, it } from "vitest";
import { addDevice, deviceValue, healthNote, removeDevice, togglePaused, unavailableDevices } from "../src/devices";
import { translator } from "../src/i18n";
import type { HassEntity, Room } from "../src/types";

const st = (entity_id: string, state: string, attributes: Record<string, unknown> = {}): HassEntity =>
  ({ entity_id, state, attributes }) as HassEntity;

function room(): Room {
  return {
    id: "wz",
    name: "Wohnzimmer",
    importance: 2,
    radiators: ["climate.hk"],
    temperature_sensors: [{ entity: "sensor.t", weight: 1 }],
    openings: ["binary_sensor.alarm", "binary_sensor.kontakt"],
    presence: [],
    paused: [],
    targets: {},
  };
}

describe("Geräte im Raum", () => {
  const t = translator("de");
  const states = {
    "climate.hk": st("climate.hk", "heat", { current_temperature: 21.5, temperature: 22 }),
    "sensor.t": st("sensor.t", "20.4"),
    "binary_sensor.alarm": st("binary_sensor.alarm", "unavailable"),
    "binary_sensor.kontakt": st("binary_sensor.kontakt", "on"),
  };
  it("zeigt Werte und erkennt nicht verfügbare", () => {
    expect(deviceValue(states["sensor.t"], "temperature_sensors", t, "de")).toBe("20,4 °C");
    expect(deviceValue(states["binary_sensor.kontakt"], "openings", t, "de")).toBe("offen");
    expect(deviceValue(states["binary_sensor.alarm"], "openings", t, "de")).toBe("nicht verfügbar");
    expect(deviceValue(undefined, "presence", t, "de")).toBe("nicht verfügbar");
    expect(deviceValue(states["climate.hk"], "radiators", t, "de")).toBe("21,5 °C → 22,0 °C");
    expect(unavailableDevices(room(), states)).toEqual(["binary_sensor.alarm"]);
  });
  it("pausiert, entfernt und fügt hinzu", () => {
    const r = room();
    togglePaused(r, "binary_sensor.alarm");
    expect(r.paused).toEqual(["binary_sensor.alarm"]);
    expect(unavailableDevices(r, states)).toEqual([]);
    togglePaused(r, "binary_sensor.alarm");
    expect(r.paused).toEqual([]);
    togglePaused(r, "sensor.t");
    removeDevice(r, "temperature_sensors", "sensor.t");
    expect(r.temperature_sensors).toEqual([]);
    expect(r.paused).toEqual([]);
    addDevice(r, "temperature_sensors", "sensor.neu");
    addDevice(r, "temperature_sensors", "sensor.neu");
    expect(r.temperature_sensors).toEqual([{ entity: "sensor.neu", weight: 1 }]);
  });
});

describe("Thermostat als Fühler", () => {
  it("zeigt die gemessene Temperatur", () => {
    const s = { entity_id: "climate.hk", state: "heat", attributes: { current_temperature: 19 } } as unknown as HassEntity;
    expect(deviceValue(s, "temperature_sensors", translator("de"), "de")).toBe("19,0 °C");
  });
});

describe("healthNote", () => {
  const t = translator("de");
  it("zeigt Überbrückung vor Ausfallzahl", () => {
    expect(healthNote({ drops_24h: 3, down_since: "x", held: true }, t)).toBe("kurz weg, letzter Wert gilt");
    expect(healthNote({ drops_24h: 3, down_since: null, held: false }, t)).toBe("3× weg (24 h)");
    expect(healthNote({ drops_24h: 0, down_since: null, held: false }, t)).toBeNull();
    expect(healthNote(undefined, t)).toBeNull();
  });
});

describe("Feuchtefühler", () => {
  it("hinzufügen, anzeigen, entfernen", () => {
    const t = translator("de");
    const room: Room = { id: "bad", name: "Bad", importance: 1, radiators: [], temperature_sensors: [], openings: [], presence: [], paused: [], targets: {} };
    addDevice(room, "humidity_sensors", "sensor.feuchte");
    addDevice(room, "humidity_sensors", "sensor.feuchte");
    expect(room.humidity_sensors).toEqual(["sensor.feuchte"]);
    const st = { entity_id: "sensor.feuchte", state: "55.2", attributes: {} } as HassEntity;
    expect(deviceValue(st, "humidity_sensors", t, "de")).toBe("55 %");
    const th = { entity_id: "climate.hk", state: "heat", attributes: { current_humidity: 48 } } as HassEntity;
    expect(deviceValue(th, "humidity_sensors", t, "de")).toBe("48 %");
    togglePaused(room, "sensor.feuchte");
    expect(room.paused).toEqual(["sensor.feuchte"]);
    removeDevice(room, "humidity_sensors", "sensor.feuchte");
    expect(room.humidity_sensors).toEqual([]);
    expect(room.paused).toEqual([]);
  });
});
