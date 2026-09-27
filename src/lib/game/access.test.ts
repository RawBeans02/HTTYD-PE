import { afterEach, describe, expect, it, vi } from "vitest";
import { assertCanCreateGame } from "@/lib/game/access";

describe("assertCanCreateGame", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("always allows a practice game, which never calls OpenAI", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("HOST_ACCESS_CODE", "");
    expect(() => assertCanCreateGame({ practiceMode: true })).not.toThrow();

    vi.stubEnv("HOST_ACCESS_CODE", "dragon-keeper");
    expect(() => assertCanCreateGame({ practiceMode: true, accessCode: "wrong" })).not.toThrow();
  });

  it("stays open in development when no code is configured", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("HOST_ACCESS_CODE", "");
    expect(() => assertCanCreateGame({})).not.toThrow();
  });

  it("turns real games off in production when no code is configured", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("HOST_ACCESS_CODE", "");
    expect(() => assertCanCreateGame({ accessCode: "anything" })).toThrow(
      expect.objectContaining({ status: 403, code: "live_games_disabled" })
    );
  });

  it("requires the configured code for a real game", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("HOST_ACCESS_CODE", "dragon-keeper");
    expect(() => assertCanCreateGame({})).toThrow(
      expect.objectContaining({ status: 403, code: "access_code_invalid" })
    );
    expect(() => assertCanCreateGame({ accessCode: "dragon-keeperx" })).toThrow(
      expect.objectContaining({ code: "access_code_invalid" })
    );
    expect(() => assertCanCreateGame({ accessCode: "dragon-keeper" })).not.toThrow();
  });

  it("ignores surrounding whitespace on either side", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("HOST_ACCESS_CODE", " dragon-keeper ");
    expect(() => assertCanCreateGame({ accessCode: "  dragon-keeper" })).not.toThrow();
  });
});
