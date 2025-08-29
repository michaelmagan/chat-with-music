"use client";

// Central configuration file for Tambo components and tools
// Read more about Tambo at https://tambo.co/docs

import { TamboComponent, TamboTool } from "@tambo-ai/react";

import { MusicCard } from "@/components/ui/music-card";
import { searchMusic } from "@/services/music-search";
import { songSchema, searchMusicSchema } from "@/lib/types";

// Tambo tools registered for AI use.
export const tools: TamboTool[] = [
  {
    name: "searchMusic",
    description:
      "Searches for music by song title, artist name, or any music-related query.",
    tool: searchMusic,
    toolSchema: searchMusicSchema,
  },
];

// Tambo components registered for AI use.
export const components: TamboComponent[] = [
  {
    name: "MusicCard",
    description: "A component that plays a song from Deezer.",
    component: MusicCard,
    propsSchema: songSchema,
  },
];