import { auth0 } from "@/lib/auth0";
import { buildHardStopActionResult } from "@/lib/governance";

export async function POST() {
  const session = await auth0.getSession();

  if (!session) {
    return Response.json(
      {
        error: "authentication required"
      },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }

  return Response.json(buildHardStopActionResult(), {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
