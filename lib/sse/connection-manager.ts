import { SSEController, SSEMessage } from "./types";

/**
 * Server-Sent Events Connection Manager
 * Manages SSE connections for real-time notifications
 */
class SSEConnectionManager {
  private connections: Map<string, Set<SSEController>> = new Map();

  /**
   * Add a client connection for a user
   */
  addClient(userId: string, controller: SSEController): void {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }

    this.connections.get(userId)!.add(controller);
    console.log(`[SSE] Client connected for user ${userId}. Total connections: ${this.connections.get(userId)!.size}`);
  }

  /**
   * Remove a client connection
   */
  removeClient(userId: string, controller?: SSEController): void {
    if (!this.connections.has(userId)) return;

    if (controller) {
      this.connections.get(userId)!.delete(controller);
      console.log(`[SSE] Client disconnected for user ${userId}. Remaining: ${this.connections.get(userId)!.size}`);

      // Clean up empty sets
      if (this.connections.get(userId)!.size === 0) {
        this.connections.delete(userId);
      }
    } else {
      // Remove all connections for user
      this.connections.delete(userId);
      console.log(`[SSE] All clients disconnected for user ${userId}`);
    }
  }

  /**
   * Send a message to a specific user
   */
  sendToUser(userId: string, message: SSEMessage): void {
    const userConnections = this.connections.get(userId);

    if (!userConnections || userConnections.size === 0) {
      console.log(`[SSE] No active connections for user ${userId}`);
      return;
    }

    const encoder = new TextEncoder();
    const data = `data: ${JSON.stringify(message)}\n\n`;
    const encoded = encoder.encode(data);

    let sentCount = 0;
    let failedCount = 0;

    userConnections.forEach((controller) => {
      try {
        controller.enqueue(encoded);
        sentCount++;
      } catch (error) {
        console.error(`[SSE] Failed to send to client for user ${userId}:`, error);
        failedCount++;
        // Remove failed connection
        this.removeClient(userId, controller);
      }
    });

    console.log(`[SSE] Sent message to user ${userId}. Success: ${sentCount}, Failed: ${failedCount}`);
  }

  /**
   * Broadcast a message to all connected users
   */
  broadcast(message: SSEMessage): void {
    console.log(`[SSE] Broadcasting to ${this.connections.size} users`);

    this.connections.forEach((_, userId) => {
      this.sendToUser(userId, message);
    });
  }

  /**
   * Get number of connections for a user
   */
  getConnectionCount(userId: string): number {
    return this.connections.get(userId)?.size || 0;
  }

  /**
   * Get total number of active users
   */
  getTotalUsers(): number {
    return this.connections.size;
  }

  /**
   * Get total number of connections across all users
   */
  getTotalConnections(): number {
    let total = 0;
    this.connections.forEach((connections) => {
      total += connections.size;
    });
    return total;
  }
}

// Singleton instance
export const ConnectionManager = new SSEConnectionManager();
