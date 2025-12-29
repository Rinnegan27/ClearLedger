import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { ConnectionManager } from "@/lib/sse/connection-manager";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const encoder = new TextEncoder();

  const customReadable = new ReadableStream({
    start(controller) {
      // Register client
      ConnectionManager.addClient(userId, controller);

      // Send connection event
      const connectionMessage = `data: ${JSON.stringify({ type: "connected" })}\n\n`;
      controller.enqueue(encoder.encode(connectionMessage));

      // Keep-alive ping every 30 seconds
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch (error) {
          clearInterval(interval);
          ConnectionManager.removeClient(userId, controller);
        }
      }, 30000);

      // Cleanup on disconnect
      return () => {
        clearInterval(interval);
        ConnectionManager.removeClient(userId, controller);
      };
    },
  });

  return new Response(customReadable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // Disable buffering in nginx
    },
  });
}
