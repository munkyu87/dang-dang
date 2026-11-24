export type Mode = "DUAL" | "SOLO";
export type Role = "A" | "B";
export type VerdictType = "FAULT_RATIO" | "NO_FAULT" | "INCONCLUSIVE" | "BLOCKED";
export type SourceKind = "DIRECT" | "REPORTED" | "NONE";

export type PublicVerdict = {
  verdictType: VerdictType;
  title: string;
  issues: string[];
  claims: { A: string; B: string };
  agreedFacts: string[];
  disputedFacts: string[];
  fault: { A: number; B: number } | null;
  reason: string;
  limitations: string;
  order: string;
  mode: Mode;
  statementSources: { A: SourceKind; B: SourceKind };
  judgeName: string;
  judgePersona: string;
  caseNumber: string;
  createdAt: number;
};

export type CaseView = {
  id: string;
  caseNumber: string;
  mode: Mode;
  title: string;
  summary: string | null;
  category: string;
  judge: { id: string; name: string; personaKey: string };
  status: string;
  trialNo: number;
  role: Role;
  mine: { body: string; reportedOther: string | null } | null;
  mySubmitted: boolean;
  otherSubmitted: boolean | null;
  question: { text: string; expiresAt: number } | null;
  verdict: PublicVerdict | null;
  consents: { mine: boolean; other: boolean | null; shareReady: boolean };
  expiresAt: number;
  holdReason: string | null;
};

export type CasePage =
  | { kind: "missing" }
  | { kind: "closed"; caseNumber: string }
  | { kind: "ok"; view: CaseView };

export type ShareView = {
  caseNumber: string;
  mode: Mode;
  category: string;
  title: string | null;
  sourceLabel: string;
  judgeName: string;
  judgePersona: string;
  verdictType: VerdictType;
  fault: { A: number; B: number } | null;
  reason: string;
  order: string;
  limitations: string;
};

export type InvitePreview = {
  caseId: string;
  caseNumber: string;
  title: string;
  category: string;
  mode: Mode;
  role: Role;
  judgeName: string;
};
