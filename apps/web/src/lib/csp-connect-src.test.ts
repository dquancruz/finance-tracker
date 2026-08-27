import { describe, expect, it } from "vitest";
import {
  buildConnectSrcDirective,
  connectSourcesFor,
} from "./csp-connect-src";

describe("connectSourcesFor", () => {
  it("emits matching WebSocket schemes for http(s) origins", () => {
    expect(connectSourcesFor("https://api.example.com")).toEqual([
      "https://api.example.com",
      "wss://api.example.com",
    ]);
    expect(connectSourcesFor("http://127.0.0.1:3001")).toEqual([
      "http://127.0.0.1:3001",
      "ws://127.0.0.1:3001",
    ]);
  });

  it("strips trailing paths so CSP matches the origin", () => {
    expect(connectSourcesFor("https://api.example.com/socket.io")).toEqual([
      "https://api.example.com",
      "wss://api.example.com",
    ]);
  });

  it("returns an empty list when the URL is unset", () => {
    expect(connectSourcesFor(undefined)).toEqual([]);
    expect(connectSourcesFor("")).toEqual([]);
  });
});

describe("buildConnectSrcDirective", () => {
  it("always includes 'self' and de-duplicates sources", () => {
    expect(
      buildConnectSrcDirective(
        "http://localhost:3001",
        "http://localhost:3001",
      ),
    ).toBe("'self' http://localhost:3001 ws://localhost:3001");
  });
});
