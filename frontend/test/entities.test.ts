import { describe, expect, it } from "vitest";
import { filterEntities, friendlyName, notifyServices } from "../src/entities";
import type { HassEntity } from "../src/types";

const st = (entity_id: string, friendly_name: string, device_class?: string): HassEntity => ({
  entity_id,
  state: "on",
  attributes: { friendly_name, ...(device_class ? { device_class } : {}) },
});

const states: Record<string, HassEntity> = Object.fromEntries(
  [
    st("climate.heizung_wohnzimmer", "Heizung Wohnzimmer"),
    st("climate.heizung_kueche", "Heizung Küche"),
    st("sensor.temperatur_wohnzimmer", "Temperatur Wohnzimmer", "temperature"),
    st("sensor.feuchte_wohnzimmer", "Feuchte Wohnzimmer", "humidity"),
    st("binary_sensor.fenster_kueche", "Fenster Küche", "window"),
    st("binary_sensor.bewegung_flur", "Bewegung Flur", "motion"),
  ].map((e) => [e.entity_id, e]),
);

describe("filterEntities", () => {
  it("filtert nach Domain und sortiert nach Name", () => {
    expect(filterEntities(states, { domains: ["climate"] }).map((e) => e.entity_id)).toEqual([
      "climate.heizung_kueche",
      "climate.heizung_wohnzimmer",
    ]);
  });
  it("filtert nach device_class", () => {
    const r = filterEntities(states, { domains: ["sensor"], deviceClasses: ["temperature"] });
    expect(r.map((e) => e.entity_id)).toEqual(["sensor.temperatur_wohnzimmer"]);
  });
  it("sucht in Name und ID, ohne Akzente, alle Wörter", () => {
    expect(filterEntities(states, { domains: [], query: "kuche fenster" }).map((e) => e.entity_id)).toEqual([
      "binary_sensor.fenster_kueche",
    ]);
    expect(filterEntities(states, { domains: ["climate"], query: "WOHN" }).length).toBe(1);
  });
  it("schließt gewählte aus und begrenzt", () => {
    const r = filterEntities(states, { domains: ["climate"], exclude: ["climate.heizung_kueche"] });
    expect(r.map((e) => e.entity_id)).toEqual(["climate.heizung_wohnzimmer"]);
    expect(filterEntities(states, { domains: [], limit: 2 }).length).toBe(2);
  });
  it("friendlyName fällt auf entity_id zurück", () => {
    expect(friendlyName(states, "climate.heizung_wohnzimmer")).toBe("Heizung Wohnzimmer");
    expect(friendlyName(states, "climate.gibt_es_nicht")).toBe("climate.gibt_es_nicht");
  });
  it("notifyServices", () => {
    expect(notifyServices({ notify: { mobile_app_telefon: {}, persistent_notification: {} } })).toEqual([
      "notify.mobile_app_telefon",
      "notify.persistent_notification",
    ]);
    expect(notifyServices({})).toEqual([]);
  });
});
