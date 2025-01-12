"use server"

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, ExtendedSession } from "@/lib/auth";

async function handler() {
  const session:ExtendedSession | null = await getServerSession(authOptions);
  console.log("Session: ",session);

  try {
    const playlists = await prisma.playlist.findMany({
      where: session && session.user
        ? { userId: session.user.id } // Authenticated user's playlists
        : { isPublic: true }, // Public playlists for unauthenticated users
      include: { videos: true },
      orderBy: {
        fetchedAt: 'desc', // Order by fetchedAt in descending order
      },
    });
    return new Response(JSON.stringify(playlists), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Failed to fetch playlists" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export {handler as GET};
