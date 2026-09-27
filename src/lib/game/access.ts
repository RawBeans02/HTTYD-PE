import { constantTimeEqual } from "@/lib/crypto";
import { AppError } from "@/lib/http";

/**
 * Who may start a game on this deployment.
 *
 * A real game is the only thing that spends OpenAI credits, and anyone who has the URL can
 * reach the landing page. So when HOST_ACCESS_CODE is set, only hosts who know it can start a
 * real game. A practice game never calls OpenAI, so it stays open to everyone — that is what a
 * visitor trying the app should land on.
 *
 * Unset in development means open, so local work and CI need no setup. Unset in production
 * means real games are off: a public deployment that forgot the variable fails closed, not
 * open to unbounded spend.
 */
export function assertCanCreateGame(input: { practiceMode?: boolean; accessCode?: string }) {
  if (input.practiceMode) {
    return;
  }

  const configured = process.env.HOST_ACCESS_CODE?.trim();
  if (!configured) {
    if (process.env.NODE_ENV === "production") {
      throw new AppError(
        "Live games are turned off on this site. Start a practice game instead.",
        403,
        "live_games_disabled"
      );
    }
    return;
  }

  if (!constantTimeEqual(input.accessCode?.trim(), configured)) {
    throw new AppError(
      "That host access code is not right. Ask the organizer for it, or start a practice game.",
      403,
      "access_code_invalid"
    );
  }
}
