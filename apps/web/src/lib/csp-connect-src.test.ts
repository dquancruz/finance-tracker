import { describe, expect, it } from "vitest";
import {
  buildConnectSrcDirective,
  connectSourcesFor,
  contentSecurityPolicy,
  scriptSrcDirective,
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

  it("includes explicit ws/wss for the page origin when env URLs are unset", () => {
    expect(buildConnectSrcDirective("http://127.0.0.1:3100")).toContain(
      "ws://127.0.0.1:3100",
    );
  });
});

describe("scriptSrcDirective", () => {
  it("uses a nonce and strict-dynamic without unsafe-inline", () => {
    const directive = scriptSrcDirective("abc123", "production");
    expect(directive).toContain("'nonce-abc123'");
    expect(directive).toContain("'strict-dynamic'");
    expect(directive).toContain("'self'");
    expect(directive).not.toContain("'unsafe-inline'");
  });

  it("falls back to script-src self when no nonce is available", () => {
    expect(scriptSrcDirective(undefined, "production")).toBe("script-src 'self'");
  });

  it("allows unsafe-eval in development only", () => {
    expect(scriptSrcDirective("abc123", "development")).toContain(
      "'unsafe-eval'",
    );
    expect(scriptSrcDirective("abc123", "production")).not.toContain(
      "'unsafe-eval'",
    );
  });
});

describe("contentSecurityPolicy", () => {
  it("embeds the nonce script policy and connect-src websocket origins", () => {
    const policy = contentSecurityPolicy({
      nonce: "test-nonce",
      connectUrls: ["https://api.example.com"],
      nodeEnv: "production",
    });
    expect(policy).toContain("script-src 'self' 'nonce-test-nonce' 'strict-dynamic'");
    expect(policy).not.toMatch(/script-src[^;]*'unsafe-inline'/);
    expect(policy).toContain("wss://api.example.com");
  });
});
