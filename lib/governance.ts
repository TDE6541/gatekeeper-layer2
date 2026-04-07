export const GOVERNANCE_DOMAINS = [
  "protected_destructive_ops",
  "pricing_quote_logic",
  "customer_data_pii",
  "database_schema",
  "auth_security_surfaces",
  "documentation_comments",
  "test_files",
  "ui_styling_content",
  "existing_file_modification",
  "new_file_creation"
] as const;

export const GOVERNANCE_TIERS = [
  "FULL_AUTO",
  "SUPERVISED",
  "HARD_STOP"
] as const;

export const GOVERNANCE_PROFILES = [
  "conservative",
  "balanced",
  "velocity"
] as const;

export type GovernanceDomain = (typeof GOVERNANCE_DOMAINS)[number];
export type GovernanceTier = (typeof GOVERNANCE_TIERS)[number];
export type GovernanceProfile = (typeof GOVERNANCE_PROFILES)[number];

/**
 * FEED CONTRACT - FROZEN at Wave 2
 *
 * This shape is the contract for green, yellow, red, and blue lanes.
 * Do not add, remove, or rename fields without a contract migration.
 *
 * Fields:
 *   timestamp            - ISO-8601 instant
 *   action               - action identifier (e.g. "google_calendar_read")
 *   domain               - governance domain
 *   tier                 - resolved governance tier
 *   outcome              - terminal result of the enforcement pass
 *   credential_requested - did the pass request a provider credential?
 *   approval_requested   - did the pass request supervisor approval?
 *   fga_checked          - did the pass consult OpenFGA?
 *   reason               - human-readable explanation
 */
export type GovernanceFeedEvent = {
  timestamp: string;
  action: string;
  domain: GovernanceDomain;
  tier: GovernanceTier;
  outcome: "allowed" | "success" | "stub_ready" | "stubbed" | "blocked" | "error";
  credential_requested: boolean;
  approval_requested: boolean;
  fga_checked: boolean;
  reason: string;
};

export type GovernanceDecisionTraceStep = {
  label: string;
  status: "complete" | "pending" | "blocked";
  detail?: string;
};

export type ProviderId = "google" | "github" | "internal";
export type DemoActionId =
  | "google_calendar_read"
  | "github_issue_create"
  | "pricing_rule_change";

export type GovernanceDecisionTrace = {
  actionId: DemoActionId;
  provider: ProviderId;
  domain: GovernanceDomain;
  tier: GovernanceTier;
  requiresApproval: boolean;
  requiresFGA: boolean;
  credentialRequested: boolean;
  steps: GovernanceDecisionTraceStep[];
};

export type GovernanceResolution = {
  actionId: DemoActionId;
  provider: ProviderId;
  domain: GovernanceDomain;
  tier: GovernanceTier;
  requiresApproval: boolean;
  requiresFGA: boolean;
};

export type HardStopReceipt = {
  receipt_type: "hard_stop_receipt";
  route: "/api/actions/hard-stop";
  action: "pricing_rule_change";
  provider: "internal";
  domain: "pricing_quote_logic";
  tier: "HARD_STOP";
  outcome: "blocked";
  credential_requested: false;
  approval_requested: false;
  provider_consulted: false;
  blocked_before_identity: true;
  reason: "governance denied before identity";
};

export type GovernanceActionResult = {
  event: GovernanceFeedEvent;
  trace: GovernanceDecisionTrace;
  receipt?: HardStopReceipt;
};

export type GovernanceOutcomeLabel = GovernanceFeedEvent["outcome"] | "HOLD";

const GOVERNANCE_HOLD_PREFIX = "HOLD:";
const GOVERNANCE_CREDENTIAL_GAP_PATTERN =
  /refresh token|connection access token|connection token|missing credential|credential gap/i;

export function isGovernanceHoldEvent(event: GovernanceFeedEvent): boolean {
  const reason = event.reason.trimStart();

  return (
    reason.startsWith(GOVERNANCE_HOLD_PREFIX) ||
    (event.outcome === "error" &&
      GOVERNANCE_CREDENTIAL_GAP_PATTERN.test(reason))
  );
}

export function getGovernanceOutcomeLabel(
  event: GovernanceFeedEvent
): GovernanceOutcomeLabel {
  return isGovernanceHoldEvent(event) ? "HOLD" : event.outcome;
}

type DomainPolicy = {
  tiers: Record<GovernanceProfile, GovernanceTier>;
  requiresFGA: boolean;
};

export type GovernanceMatrixEntry = {
  domain: GovernanceDomain;
  tier: GovernanceTier;
  requiresFGA: boolean;
};

export type DemoActionCard = {
  id: DemoActionId;
  tier: GovernanceTier;
  title: GovernanceTier;
  provider: ProviderId;
  domain: GovernanceDomain;
  route: string;
  summary: string;
};

export const ACTIVE_PROFILE: GovernanceProfile = "conservative";

export const DOMAIN_POLICIES: Record<GovernanceDomain, DomainPolicy> = {
  protected_destructive_ops: {
    tiers: {
      conservative: "HARD_STOP",
      balanced: "HARD_STOP",
      velocity: "HARD_STOP"
    },
    requiresFGA: true
  },
  pricing_quote_logic: {
    tiers: {
      conservative: "HARD_STOP",
      balanced: "SUPERVISED",
      velocity: "SUPERVISED"
    },
    requiresFGA: true
  },
  customer_data_pii: {
    tiers: {
      conservative: "HARD_STOP",
      balanced: "HARD_STOP",
      velocity: "HARD_STOP"
    },
    requiresFGA: true
  },
  database_schema: {
    tiers: {
      conservative: "HARD_STOP",
      balanced: "HARD_STOP",
      velocity: "SUPERVISED"
    },
    requiresFGA: true
  },
  auth_security_surfaces: {
    tiers: {
      conservative: "HARD_STOP",
      balanced: "HARD_STOP",
      velocity: "SUPERVISED"
    },
    requiresFGA: true
  },
  documentation_comments: {
    tiers: {
      conservative: "FULL_AUTO",
      balanced: "FULL_AUTO",
      velocity: "FULL_AUTO"
    },
    requiresFGA: false
  },
  test_files: {
    tiers: {
      conservative: "SUPERVISED",
      balanced: "FULL_AUTO",
      velocity: "FULL_AUTO"
    },
    requiresFGA: false
  },
  ui_styling_content: {
    tiers: {
      conservative: "SUPERVISED",
      balanced: "FULL_AUTO",
      velocity: "FULL_AUTO"
    },
    requiresFGA: false
  },
  existing_file_modification: {
    tiers: {
      conservative: "SUPERVISED",
      balanced: "SUPERVISED",
      velocity: "FULL_AUTO"
    },
    requiresFGA: false
  },
  new_file_creation: {
    tiers: {
      conservative: "SUPERVISED",
      balanced: "FULL_AUTO",
      velocity: "FULL_AUTO"
    },
    requiresFGA: false
  }
};

export const ACTION_CATALOG: Record<DemoActionId, DemoActionCard> = {
  google_calendar_read: {
    id: "google_calendar_read",
    tier: "FULL_AUTO",
    title: "FULL_AUTO",
    provider: "google",
    domain: "documentation_comments",
    route: "/api/actions/full-auto",
    summary:
      "Green lane. Token Vault exchanges Auth0 refresh token for Google access token, then reads Calendar FreeBusy."
  },
  github_issue_create: {
    id: "github_issue_create",
    tier: "SUPERVISED",
    title: "SUPERVISED",
    provider: "github",
    domain: "new_file_creation",
    route: "/api/actions/supervised",
    summary:
      "Yellow lane. Request approval first, then approved execute attempts a live GitHub issue create and returns success or HOLD."
  },
  pricing_rule_change: {
    id: "pricing_rule_change",
    tier: "HARD_STOP",
    title: "HARD_STOP",
    provider: "internal",
    domain: "pricing_quote_logic",
    route: "/api/actions/hard-stop",
    summary:
      "Red lane proof. Governance blocks the action on the server before identity is consulted."
  }
};

export function resolveTier(
  domain: GovernanceDomain,
  profile: GovernanceProfile
): GovernanceTier {
  return DOMAIN_POLICIES[domain].tiers[profile];
}

export function getGovernanceMatrix(
  profile: GovernanceProfile = ACTIVE_PROFILE
): GovernanceMatrixEntry[] {
  return GOVERNANCE_DOMAINS.map((domain) => ({
    domain,
    tier: resolveTier(domain, profile),
    requiresFGA: DOMAIN_POLICIES[domain].requiresFGA
  }));
}

export function getDemoActionCards(
  profile: GovernanceProfile = ACTIVE_PROFILE
): DemoActionCard[] {
  const order: Record<GovernanceTier, number> = {
    FULL_AUTO: 0,
    SUPERVISED: 1,
    HARD_STOP: 2
  };

  return Object.values(ACTION_CATALOG)
    .map((action) => {
      const tier = resolveTier(action.domain, profile);
      return {
        ...action,
        tier,
        title: tier
      };
    })
    .sort((left, right) => order[left.tier] - order[right.tier]);
}

export function getTierTone(tier: GovernanceTier) {
  if (tier === "FULL_AUTO") {
    return {
      badge: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
      dot: "bg-emerald-400"
    };
  }

  if (tier === "SUPERVISED") {
    return {
      badge: "border-amber-400/30 bg-amber-400/10 text-amber-200",
      dot: "bg-amber-400"
    };
  }

  return {
    badge: "border-rose-400/30 bg-rose-400/10 text-rose-200",
    dot: "bg-rose-400"
  };
}

export function resolveGovernanceAction(
  actionId: DemoActionId,
  profile: GovernanceProfile = ACTIVE_PROFILE
): GovernanceResolution {
  const action = ACTION_CATALOG[actionId];
  const tier = resolveTier(action.domain, profile);

  return {
    actionId,
    provider: action.provider,
    domain: action.domain,
    tier,
    requiresApproval: tier === "SUPERVISED",
    requiresFGA: DOMAIN_POLICIES[action.domain].requiresFGA
  };
}

function baseTrace(actionId: DemoActionId): GovernanceDecisionTrace {
  const resolution = resolveGovernanceAction(actionId);

  return {
    ...resolution,
    credentialRequested: false,
    steps: [
      {
        label: "governance_resolver",
        status: resolution.tier === "HARD_STOP" ? "blocked" : "complete",
        detail: `Active profile ${ACTIVE_PROFILE} resolved ${resolution.domain} to ${resolution.tier}.`
      }
    ]
  };
}

function buildHardStopReceipt(): HardStopReceipt {
  return {
    receipt_type: "hard_stop_receipt",
    route: "/api/actions/hard-stop",
    action: "pricing_rule_change",
    provider: "internal",
    domain: "pricing_quote_logic",
    tier: "HARD_STOP",
    outcome: "blocked",
    credential_requested: false,
    approval_requested: false,
    provider_consulted: false,
    blocked_before_identity: true,
    reason: "governance denied before identity"
  };
}

export function buildHardStopActionResult(): GovernanceActionResult {
  const resolution = resolveGovernanceAction("pricing_rule_change");

  if (resolution.tier !== "HARD_STOP") {
    throw new Error(
      `Expected pricing_rule_change to resolve to HARD_STOP, received ${resolution.tier}.`
    );
  }

  return {
    event: {
      timestamp: new Date().toISOString(),
      action: resolution.actionId,
      domain: resolution.domain,
      tier: resolution.tier,
      outcome: "blocked",
      credential_requested: false,
      approval_requested: false,
      fga_checked: false,
      reason: "governance denied before identity"
    },
    trace: {
      ...resolution,
      credentialRequested: false,
      steps: [
        {
          label: "governance_resolver",
          status: "blocked",
          detail:
            "pricing_quote_logic resolved to HARD_STOP before any provider branch could be considered."
        },
        {
          label: "provider_consultation",
          status: "blocked",
          detail:
            "Provider logic was skipped. No Token Vault or Auth0 provider request was consulted."
        },
        {
          label: "identity_gate",
          status: "blocked",
          detail: "Credential request stayed false because governance denied before identity."
        }
      ]
    },
    receipt: buildHardStopReceipt()
  };
}

export function buildGovernanceActionResult(
  actionId: DemoActionId
): GovernanceActionResult {
  if (actionId === "pricing_rule_change") {
    return buildHardStopActionResult();
  }

  const trace = baseTrace(actionId);
  const timestamp = new Date().toISOString();

  if (actionId === "google_calendar_read") {
    trace.steps.push(
      {
        label: "approval_gate",
        status: "complete",
        detail: "No approval gate is required for the documentation_comments lane."
      },
      {
        label: "credential_handoff",
        status: "pending",
        detail:
          "Governance allowed the lane. Auth0 credential handoff is intentionally deferred until Wave 2."
      }
    );

    return {
      event: {
        timestamp,
        action: actionId,
        domain: trace.domain,
        tier: trace.tier,
        outcome: "stub_ready",
        credential_requested: false,
        approval_requested: false,
        fga_checked: false,
        reason:
          "Governance cleared the action. Identity is not requested yet because Wave 1 stops at the server stub."
      },
      trace
    };
  }

  trace.steps.push(
    {
      label: "approval_gate",
      status: "pending",
      detail:
        "Supervisor approval is required for new_file_creation under the conservative profile before approved execute can continue."
    },
    {
      label: "credential_handoff",
      status: "pending",
      detail:
        "GitHub credential handoff stays behind the approval gate until approved execute starts the supervised pass."
    }
  );

  return {
    event: {
      timestamp,
      action: actionId,
      domain: trace.domain,
      tier: trace.tier,
      outcome: "stubbed",
      credential_requested: false,
      approval_requested: false,
      fga_checked: false,
      reason:
        "Governance marked the action as supervised. Approval must be requested before GitHub credential handoff can begin."
    },
    trace
  };
}

