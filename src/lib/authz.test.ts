import { describe, it, expect } from "vitest";
import { canTransition, allowedNextStates, WORKFLOW_TRANSITIONS } from "./authz";
import type { Role, WorkflowState } from "@prisma/client";

describe("workflow transition matrix", () => {
  it("admin can perform any declared transition", () => {
    for (const t of WORKFLOW_TRANSITIONS) {
      expect(canTransition("admin", t.from, t.to)).toBe(true);
    }
  });

  it("marketing can move draft -> tech_review but not skip to legal_review", () => {
    expect(canTransition("marketing", "draft", "tech_review")).toBe(true);
    expect(canTransition("marketing", "draft", "legal_review")).toBe(false);
  });

  it("only dev_lead can move tech_review forward", () => {
    expect(canTransition("dev_lead", "tech_review", "positioning_review")).toBe(true);
    expect(canTransition("marketing", "tech_review", "positioning_review")).toBe(false);
    expect(canTransition("legal", "tech_review", "positioning_review")).toBe(false);
  });

  it("only ceo can approve from positioning_review", () => {
    expect(canTransition("ceo", "positioning_review", "approved")).toBe(true);
    expect(canTransition("dev_lead", "positioning_review", "approved")).toBe(false);
  });

  it("only legal can approve from legal_review", () => {
    expect(canTransition("legal", "legal_review", "approved")).toBe(true);
    expect(canTransition("ceo", "legal_review", "approved")).toBe(false);
  });

  it("only marketing (QA) can publish an approved item", () => {
    expect(canTransition("marketing", "approved", "published")).toBe(true);
    expect(canTransition("dev_lead", "approved", "published")).toBe(false);
    expect(canTransition("legal", "approved", "published")).toBe(false);
  });

  it("published items can only be archived, not re-published", () => {
    const roles: Role[] = ["marketing", "dev_lead", "ceo", "legal"];
    for (const role of roles) {
      expect(canTransition(role, "published", "approved")).toBe(false);
    }
  });

  it("allowedNextStates lists only roles-permitted transitions for a non-admin role", () => {
    const states = allowedNextStates("dev_lead", "tech_review" as WorkflowState);
    expect(states.sort()).toEqual(["draft", "legal_review", "positioning_review"].sort());
  });
});
