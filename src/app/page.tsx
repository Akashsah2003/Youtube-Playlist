"use client";

import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  interface Video {
    id: string;
    title: string;
    description: string | null;
    videoId: string; 
  }
  
  interface Playlist {
    id: string;
    title: string;
    description: string | null;
    userId: string | null;
    isPublic: boolean;
    fetchedAt: Date;
    videos: Video[];
  }
  const { data: session } = useSession();
  const [playlists, setPlaylists] = useState([]);
  const [channelId, setChannelId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchPlaylists = async () => {
    try {
      const res = await fetch("/api/playlists");
      if (!res.ok) throw new Error("Failed to fetch playlists");
      const data = await res.json();
      setPlaylists(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handleFetchPlaylist = async () => {
    if (channelId === "") {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Channel Id is required.",
      })
      return;
    }
    if (!session && apiKey === "") {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Sign In or Provide API key.",
      })
      return;
    }
    const res = await fetch("/api/fetch-playlist", {
      method: "POST",
      body: JSON.stringify({ channelId, apiKey }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      fetchPlaylists();
      toast({
        title: "Success",
        description: "Playlists data fetched successfully.",
      })
    } else {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Error occured while fetching Playlists.",
      })
    }
  };

  const filteredPlaylists = playlists.filter((playlist:Playlist) =>
    playlist.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Welcome to Playlist Viewer</h1>
        <div>
          {session ? (
            <Button variant="outline" onClick={() => signOut()}>
              Sign Out
            </Button>
          ) : (
            <Button variant="default" onClick={() => signIn()}>
              Sign In
            </Button>
          )}
        </div>
      </header>

      <main>
        <div className="mb-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Fetch Playlist</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Fetch Playlists</DialogTitle>
              <Input
                placeholder="Channel ID"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                className="mb-2"
              />
              {!session && 
              <Input
                placeholder="API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mb-2"
                required
              />
              }
              <Button onClick={handleFetchPlaylist}>Submit</Button>
            </DialogContent>
          </Dialog>
        </div>

        <Input
          placeholder="Search playlists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />

        {filteredPlaylists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlaylists.map((playlist:Playlist) => (
              <div key={playlist.id}>
                <Card
                  className="shadow-lg cursor-pointer"
                  onClick={() =>
                    setSelectedPlaylist(
                      selectedPlaylist && selectedPlaylist.id === playlist.id
                        ? null
                        : playlist
                    )
                  }
                >
                  <CardHeader>
                    <CardTitle>{playlist.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{playlist.description || "No description available"}</p>
                  </CardContent>
                </Card>

                {selectedPlaylist && selectedPlaylist.id === playlist.id && (
                  <div className="mt-4">
                    <h2 className="text-lg font-semibold mb-2">
                      Videos in &quot;{selectedPlaylist.title}&quot;
                    </h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedPlaylist.videos.map((video: Video) => (
                        <li key={video.id} className="mb-4">
                          <iframe
                            width="100%"
                            height="200"
                            src={`https://www.youtube.com/embed/${video.videoId}`}
                            title={video.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                          <p className="mt-2">{video.title}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">
            No playlists available. Fetch playlists to see them here.
          </p>
        )}

      </main>
    </div>
  );
}
