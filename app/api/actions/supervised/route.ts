import { buildGovernanceActionResult } from "@/lib/governance";

export async function POST() {
  return Response.json(buildGovernanceActionResult("github_issue_create"));
}
