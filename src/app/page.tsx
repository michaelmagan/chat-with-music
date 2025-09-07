"use client";

import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import { SimpleMusicPlayer } from "@/components/ui/SimpleMusicPlayer";
import { components, tools } from "@/lib/tambo";
import { TamboProvider } from "@tambo-ai/react";
import { TamboMcpProvider } from "@tambo-ai/react/mcp";

export default function Home() {
  const mcpServers = useMcpServers();

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      <TamboProvider
        apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
        components={components}
        tools={tools}
        tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
      >
        <TamboMcpProvider mcpServers={mcpServers}>
          <div className="h-full w-full flex overflow-hidden">
            <div className="w-[520px] min-w-[380px] max-w-lg h-full border-r overflow-auto">
              <SimpleMusicPlayer 
                tracks={[
                  {
                    title: "SoundHelix Song 1",
                    artist: "SoundHelix",
                    album: "Demo Album",
                    duration: 30,
                    preview: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                    link: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                    albumCover: "https://picsum.photos/seed/1/256",
                  },
                  {
                    title: "SoundHelix Song 2",
                    artist: "SoundHelix",
                    album: "Demo Album", 
                    duration: 30,
                    preview: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
                    link: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
                    albumCover: "https://picsum.photos/seed/2/256",
                  },
                  {
                    title: "SoundHelix Song 3",
                    artist: "SoundHelix", 
                    album: "Demo Album",
                    duration: 30,
                    preview: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
                    link: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
                    albumCover: "https://picsum.photos/seed/3/256",
                  },
                ]}
                currentIndex={0}
                isPlaying={false}
              />
            </div>

            <div className="flex-1 min-w-0 h-full">
              <div className="h-full flex flex-col">
                <MessageThreadFull
                  className="right w-full max-w-none ml-0"
                  contextKey="tambo-template"
                />
              </div>
            </div>
          </div>
        </TamboMcpProvider>
      </TamboProvider>
    </div>
  );
}
