import { describe, expect, it } from "vitest";
import {
  explainResolution,
  type ShiftResolutionNote,
} from "../src/attendance/resolution-explanation";
import { sharedResources } from "../src/i18n/index";

const hora = (iso: string) => iso.slice(11, 16);

const nota = (over: Partial<ShiftResolutionNote>): ShiftResolutionNote => ({
  action: "count_as_worked",
  punchType: "in",
  punchAt: "2026-10-05T08:20:00.000Z",
  countedAt: null,
  overtimeMinutes: 0,
  breakAdjustMinutes: 0,
  ...over,
});

describe("explainResolution (orch #2, phase 4)", () => {
  it('"from the scheduled time" says both times: the punch and the one that counts', () => {
    expect(
      explainResolution(
        nota({
          action: "count_from_schedule",
          countedAt: "2026-10-05T09:00:00.000Z",
        }),
        hora,
      ),
    ).toEqual({
      key: "resolutionExplained.fromSchedule",
      values: { punch: "08:20", counted: "09:00" },
    });
  });

  it("when the decision left the punch as it was, it says it counted as recorded", () => {
    expect(
      explainResolution(nota({ action: "count_from_schedule" }), hora)?.key,
    ).toBe("resolutionExplained.asWorkedIn");
  });

  it("overtime and break minutes travel as count, for the plural", () => {
    expect(
      explainResolution(
        nota({
          action: "count_as_overtime",
          punchType: "out",
          overtimeMinutes: 40,
        }),
        hora,
      ),
    ).toEqual({
      key: "resolutionExplained.overtimeAfter",
      values: { count: 40 },
    });
    expect(
      explainResolution(
        nota({
          action: "deduct_planned",
          punchType: "break_end",
          breakAdjustMinutes: -15,
        }),
        hora,
      ),
    ).toEqual({
      key: "resolutionExplained.breakPlannedDeducted",
      values: { count: 15 },
    });
  });

  it("an action it does not know shows nothing rather than a wrong sentence", () => {
    expect(
      explainResolution(nota({ action: "something_new" }), hora),
    ).toBeNull();
  });

  it("every key it can return has a text in Spanish and in English", () => {
    const acciones = [
      "count_from_schedule",
      "count_to_schedule",
      "count_as_worked",
      "count_as_overtime",
      "accept_as_is",
      "excuse_to_schedule",
      "allow",
      "deduct_excess",
      "pay_as_worked",
      "deduct_planned",
    ];
    for (const lang of ["es", "en"] as const) {
      const textos = (
        sharedResources[lang].common as unknown as Record<
          string,
          Record<string, string>
        >
      ).resolutionExplained!;
      for (const action of acciones) {
        for (const punchType of ["in", "out"]) {
          for (const countedAt of [null, "2026-10-05T09:00:00.000Z"]) {
            const e = explainResolution(
              nota({
                action,
                punchType,
                countedAt,
                overtimeMinutes: 5,
                breakAdjustMinutes: 5,
              }),
              hora,
            );
            const clave = e!.key.replace("resolutionExplained.", "");
            const conPlural = e!.values.count !== undefined;
            expect([
              lang,
              conPlural ? textos[`${clave}_other`] : textos[clave],
            ]).toEqual([lang, expect.any(String)]);
            if (conPlural)
              expect(textos[`${clave}_one`]).toEqual(expect.any(String));
          }
        }
      }
    }
  });
});
