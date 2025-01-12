import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions, ExtendedSession } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';

interface AccessToken {
  accessToken: string;
}


export async function POST(req: NextRequest) {
  const { channelId, apiKey } = await req.json();
  const session: ExtendedSession | null = await getServerSession(authOptions);

  const youtube = google.youtube('v3');
  const accessToken = await getToken({req}) as AccessToken | null;

  if (!accessToken && !apiKey) {
    return NextResponse.json(
      { error: 'No access token or API key provided' },
      { status: 400 }
    );
  }

  let authClient;

  if (accessToken) {
    // Use OAuth2Client for access token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken.accessToken });
    authClient = oauth2Client;
  } else {
    // Use API key for authentication
    authClient = apiKey;
  }
  try {
    // Fetch playlists of the channel
    const playlistsResponse = await youtube.playlists.list({
      channelId: channelId,
      part: ['snippet', 'contentDetails'],
      maxResults: 50, // Adjust as needed
      auth: authClient,
    });

    const playlists = playlistsResponse.data.items || [];

    if (playlists.length === 0) {
      return NextResponse.json({ error: 'No playlists found for this channel' }, { status: 404 });
    }

    // Map playlists to insert into the database
    const playlistDataPromises = playlists.map(async (playlist) => {
      // Fetch videos in each playlist
      const videosResponse = await youtube.playlistItems.list({
        playlistId: playlist.id!,
        part: ['snippet', 'contentDetails'],
        maxResults: 50, // Adjust as needed
        auth: authClient,
      });

      const videoItems = videosResponse.data.items || [];

      const videoData = videoItems.map((item) => ({
        title: item.snippet?.title || 'Untitled Video',
        videoId: item.contentDetails?.videoId || '',
      }));

      // Insert playlist and videos into the database
      return prisma.playlist.create({
        data: {
          title: playlist.snippet?.title || 'Untitled Playlist',
          description: playlist.snippet?.description || '',
          userId: session?.user?.id || null,
          isPublic: session ? false : true,
          videos: {
            create: videoData,
          },
        },
      });
    });

    // Resolve all playlist insertions
    await Promise.all(playlistDataPromises);

    return NextResponse.json(
      {message: "Success! Playlists added successfully."},
      {status: 200}
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch playlists or videos' },
      { status: 500 }
    );
  }
}
