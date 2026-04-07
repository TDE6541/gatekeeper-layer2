"use client";

import { useState } from "react";

import { DecisionTracePanel } from "@/components/dashboard/decision-trace-panel";
import { EnforcementFeed } from "@/components/dashboard/enforcement-feed";
import {
  ReceiptLedger,
  type LedgerLane,
  type ReceiptLedgerEntry
} from "@/components/dashboard/receipt-ledger";
import type {
  DemoActionCard,
  GovernanceActionResult,
  GovernanceFeedEvent
} from "@/lib/governance";

type ActionSurfaceProps = {
  actions: DemoActionCard[];
};

type ActionRouteError = {
  error?: string;
};

function tierButtonClass(tier: DemoActionCard["tier"]) {
  if (tier === "FULL_AUTO") {
    return "border-emerald-400/30 bg-emerald-500/10 text-emerald-200 hover:border-emerald-300/60 hover:bg-emerald-500/20";
  }

  if (tier === "SUPERVISED") {
    return "border-amber-400/30 bg-amber-500/10 text-amber-200 hover:border-amber-300/60 hover:bg-amber-500/20";
  }

  return "border-rose-400/30 bg-rose-500/10 text-rose-200 hover:border-rose-300/60 hover:bg-rose-500/20";
}

function laneFromAction(actionId: string): LedgerLane | null {
  if (actionId === "google_calendar_read") {
    return "green";
  }

  if (actionId === "github_issue_create") {
    return "yellow";
  }

  if (actionId === "pricing_rule_change") {
    return "red";
  }

  return null;
}

function sortNewestFirst(events: GovernanceFeedEvent[]) {
  return [...events].sort((left, right) => {
    const timeDelta = Date.parse(right.timestamp) - Date.parse(left.timestamp);
    if (timeDelta !== 0) {
      return timeDelta;
    }

    return left.action.localeCompare(right.action);
  });
}

function createInitialLedger(actions: DemoActionCard[]): Record<LedgerLane, ReceiptLedgerEntry> {
  const green = actions.find((action) => action.id === "google_calendar_read");
  const yellow = actions.find((action) => action.id === "github_issue_create");
  const red = actions.find((action) => action.id === "pricing_rule_change");

  return {
    green: {
      lane: "green",
      title: "Green Receipt",
      subtitle: "Provider execution receipt",
      expectedAction: green?.id ?? "google_calendar_read",
      route: green?.route ?? "/api/actions/full-auto",
      provider: green?.provider ?? "google",
      event: null,
      trace: null,
      receipt: null
    },
    yellow: {
      lane: "yellow",
      title: "Yellow Receipt",
      subtitle: "Approval-gated receipt",
      expectedAction: yellow?.id ?? "github_issue_create",
      route: yellow?.route ?? "/api/actions/supervised",
      provider: yellow?.provider ?? "github",
      event: null,
      trace: null,
      receipt: null
    },
    red: {
      lane: "red",
      title: "Red Receipt",
      subtitle: "Governance hard-stop receipt",
      expectedAction: red?.id ?? "pricing_rule_change",
      route: red?.route ?? "/api/actions/hard-stop",
      provider: red?.provider ?? "internal",
      event: null,
      trace: null,
      receipt: null
    },
    blue: {
      lane: "blue",
      title: "Blue Access Decision",
      subtitle: "Session and access decision shell",
      expectedAction: "dashboard_access_decision",
      route: "pending artifact",
      provider: "auth session",
      event: null,
      trace: null,
      receipt: null
    }
  };
}

function isGovernanceActionResult(payload: unknown): payload is GovernanceActionResult {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "event" in payload &&
    "trace" in payload
  );
}

export function ActionSurface({ actions }: ActionSurfaceProps) {
  const [events, setEvents] = useState<GovernanceFeedEvent[]>([]);
  const [ledger, setLedger] = useState<Record<LedgerLane, ReceiptLedgerEntry>>(() =>
    createInitialLedger(actions)
  );
  const [activeLane, setActiveLane] = useState<LedgerLane>("red");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAction(action: DemoActionCard) {
    setPendingAction(action.id);
    setError(null);

    try {
      const response = await fetch(action.route, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const payload = (await response.json()) as GovernanceActionResult | ActionRouteError;

      if (isGovernanceActionResult(payload)) {
        setEvents((current) => sortNewestFirst([payload.event, ...current]));

        const lane = laneFromAction(payload.event.action);
        if (lane) {
          setLedger((current) => ({
            ...current,
            [lane]: {
              ...current[lane],
              event: payload.event,
              trace: payload.trace,
              receipt: payload.receipt ?? current[lane].receipt
            }
          }));
          setActiveLane(lane);
        }
      }

      if (!response.ok) {
        if ("error" in payload && payload.error) {
          throw new Error(payload.error);
        }

        if (isGovernanceActionResult(payload)) {
          throw new Error(payload.event.reason);
        }

        throw new Error("Route call failed.");
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unexpected route failure."
      );
    } finally {
      setPendingAction(null);
    }
  }

  const ledgerEntries: ReceiptLedgerEntry[] = [
    ledger.red,
    ledger.green,
    ledger.yellow,
    ledger.blue
  ];

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-slate-800 bg-panel/90 p-5 shadow-panel">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-200">
                Action Surface
              </h2>
              <p className="mt-2 text-xs text-slate-400">
                Client triggers server routes. Ledger and trace populate only from real responses.
              </p>
            </div>
            <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-300">
              execution lane
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            {actions.map((action) => (
              <article
                key={action.id}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                      {action.title}
                    </p>
                    <p className="mt-2 text-sm text-slate-100">{action.id}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      provider {action.provider} / domain {action.domain}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {action.summary}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void runAction(action)}
                    disabled={pendingAction !== null}
                    className={`rounded-lg border px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${tierButtonClass(action.tier)}`}
                  >
                    {pendingAction === action.id ? "Running..." : "Run route"}
                  </button>
                </div>
              </article>
            ))}
          </div>

          {error ? (
            <div className="mt-4 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </div>
          ) : null}
        </section>

        <ReceiptLedger
          entries={ledgerEntries}
          activeLane={activeLane}
          onSelectLane={setActiveLane}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <DecisionTracePanel entry={ledger[activeLane]} />
        <EnforcementFeed events={events} />
      </div>
    </div>
  );
}
