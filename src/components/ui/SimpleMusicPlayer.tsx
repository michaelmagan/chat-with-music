"use client";
import { withInteractable } from "@tambo-ai/react";
import { Pause, Play, SkipBack, SkipForward, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

const trackSchema = z.object({
  title: z.string(),
  artist: z.string(),
  album: z.string(),
  duration: z.number().optional(),
  preview: z.string(),
  link: z.string(),
  albumCover: z.string().optional(),
});

export const simpleMusicPlayerSchema = z.object({
  tracks: z
    .array(trackSchema)
    .default([])
    .describe("The playlist of tracks to play"),
  currentIndex: z.number().int().nonnegative().default(0),
  isPlaying: z.boolean().default(false),
  addTrack: z.union([trackSchema, z.array(trackSchema)])
    .optional()
    .describe("Add track(s) to the playlist - can be a single track or array of tracks"),
  removeIndex: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe("Remove track at this index (0-based)"),
  action: z
    .enum(["play", "pause", "toggle", "next", "previous"])
    .optional()
    .describe("Control playback: play, pause, toggle, next, or previous track"),
  replacePlaylist: z
    .array(trackSchema)
    .optional()
    .describe(
      "Replace entire playlist with new tracks. Use empty array [] to clear playlist. This is the only way to clear or bulk update tracks."
    ),
});

type SimpleMusicPlayerProps = z.infer<typeof simpleMusicPlayerSchema> & {
  onPropsUpdate?: (
    next: Partial<z.infer<typeof simpleMusicPlayerSchema>>
  ) => void;
};

function SimpleMusicPlayerBase({
  tracks: propTracks = [],
  currentIndex: propCurrentIndex = 0,
  isPlaying: propIsPlaying = false,
  addTrack,
  removeIndex,
  action,
  replacePlaylist,
  onPropsUpdate,
}: SimpleMusicPlayerProps) {
  // Use internal state as the source of truth
  const [tracks, setTracks] = useState(propTracks);
  const [currentIndex, setCurrentIndex] = useState(propCurrentIndex);
  const [isPlaying, setIsPlaying] = useState(propIsPlaying);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);

  // Sync with props on initial load only
  useEffect(() => {
    if (propTracks.length > 0) {
      setTracks(propTracks);
      setCurrentIndex(propCurrentIndex);
      setIsPlaying(propIsPlaying);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount - ignore prop dependencies

  // Report state changes back to AI
  useEffect(() => {
    onPropsUpdate?.({
      tracks,
      currentIndex,
      isPlaying,
    });
  }, [tracks, currentIndex, isPlaying, onPropsUpdate]);

  // Handle external prop changes (from AI)
  useEffect(() => {
    if (addTrack) {
      console.log("Adding track(s):", addTrack); // Debug log
      setTracks((prev) => {
        const tracksToAdd = Array.isArray(addTrack) ? addTrack : [addTrack];
        const newTracks = [...prev, ...tracksToAdd];
        console.log("New tracks array:", newTracks); // Debug log
        return newTracks;
      });
      // Clear the addTrack prop after processing
      onPropsUpdate?.({ addTrack: undefined });
    }
  }, [addTrack, onPropsUpdate]);

  useEffect(() => {
    if (removeIndex !== undefined && removeIndex < tracks.length) {
      setTracks((prev) => {
        const newTracks = prev.filter((_, i) => i !== removeIndex);
        // Adjust current index if needed
        if (removeIndex === currentIndex) {
          setCurrentIndex(0);
          setIsPlaying(false);
          if (audio) {
            audio.pause();
            setAudio(null);
          }
        } else if (removeIndex < currentIndex) {
          setCurrentIndex(currentIndex - 1);
        }
        return newTracks;
      });
      // Don't clear immediately - let the AI manage the prop lifecycle
    }
  }, [removeIndex, tracks.length, currentIndex, audio]);

  useEffect(() => {
    if (action) {
      switch (action) {
        case "play":
          setIsPlaying(true);
          break;
        case "pause":
          setIsPlaying(false);
          break;
        case "toggle":
          setIsPlaying((prev) => !prev);
          break;
        case "next":
          if (tracks.length > 0) {
            setCurrentIndex((currentIndex + 1) % tracks.length);
            // Don't automatically start playing - keep current play state
          }
          break;
        case "previous":
          if (tracks.length > 0) {
            setCurrentIndex((currentIndex - 1 + tracks.length) % tracks.length);
            // Don't automatically start playing - keep current play state
          }
          break;
      }
      // Don't clear immediately - let the AI manage the prop lifecycle
    }
  }, [action, tracks.length, currentIndex, audio]);

  // Handle replacePlaylist - replace entire playlist (including empty array to clear)
  useEffect(() => {
    if (replacePlaylist !== undefined) {
      console.log("Replace playlist with tracks:", replacePlaylist);
      // Stop current audio
      if (audio) {
        audio.pause();
        setAudio(null);
      }
      // Set new playlist (can be empty array to clear)
      setTracks(replacePlaylist);
      setCurrentIndex(0);
      // Don't auto-play, let user control playback
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [replacePlaylist]); // Remove audio from dependencies to prevent infinite loop

  const currentTrack = useMemo(
    () => tracks[currentIndex],
    [tracks, currentIndex]
  );

  // Handle audio creation when track changes
  useEffect(() => {
    if (!currentTrack) {
      if (audio) {
        audio.pause();
        setAudio(null);
      }
      setCurrentTime(0);
      return;
    }

    // Create new audio if track changed
    if (!audio || audio.src !== currentTrack.preview) {
      // Clean up old audio completely
      if (audio) {
        audio.pause();
        audio.removeEventListener("ended", () => {});
        audio.removeEventListener("loadedmetadata", () => {});
        audio.removeEventListener("timeupdate", () => {});
      }

      const newAudio = new Audio(currentTrack.preview);

      const handleEnded = () => {
        setCurrentIndex((prev) => (prev + 1) % tracks.length);
        setIsPlaying(tracks.length > 1);
      };

      const handleLoadedMetadata = () => setDuration(newAudio.duration || 30);
      const handleTimeUpdate = () => setCurrentTime(newAudio.currentTime);

      newAudio.addEventListener("ended", handleEnded);
      newAudio.addEventListener("loadedmetadata", handleLoadedMetadata);
      newAudio.addEventListener("timeupdate", handleTimeUpdate);

      setAudio(newAudio);
      setCurrentTime(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.preview, audio]); // Depend on preview URL and audio state

  // Handle play/pause changes independently
  useEffect(() => {
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying, audio]);

  // Button handlers - these work immediately
  const handlePlay = () => setIsPlaying(!isPlaying);

  const handleNext = () => {
    if (tracks.length > 0) {
      setCurrentIndex((currentIndex + 1) % tracks.length);
      // Keep current playing state - don't force play
    }
  };

  const handlePrevious = () => {
    if (tracks.length > 0) {
      setCurrentIndex((currentIndex - 1 + tracks.length) % tracks.length);
      // Keep current playing state - don't force play
    }
  };

  const handlePlayTrack = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const handleRemoveTrack = (index: number) => {
    const newTracks = tracks.filter((_, i) => i !== index);
    setTracks(newTracks);

    if (index === currentIndex) {
      setCurrentIndex(0);
      setIsPlaying(false);
      if (audio) {
        audio.pause();
        setAudio(null);
      }
    } else if (index < currentIndex) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleClearPlaylist = () => {
    setTracks([]);
    setCurrentIndex(0);
    setIsPlaying(false);
    if (audio) {
      audio.pause();
      setAudio(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg border">
      {/* Current Track Display */}
      {currentTrack ? (
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            {currentTrack.albumCover && (
              <img
                src={currentTrack.albumCover}
                alt={currentTrack.album}
                className="w-16 h-16 rounded object-cover"
              />
            )}
            <div className="flex-1">
              <h2 className="font-bold text-lg">{currentTrack.title}</h2>
              <p className="text-gray-600">{currentTrack.artist}</p>
              <p className="text-sm text-gray-500">{currentTrack.album}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-100"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>

          <div className="flex justify-between text-sm text-gray-500 mb-4">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex justify-center items-center space-x-4">
            <button
              onClick={handlePrevious}
              className="p-2 rounded-full hover:bg-gray-100"
              disabled={tracks.length === 0}
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={handlePlay}
              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700"
              disabled={!currentTrack}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={handleNext}
              className="p-2 rounded-full hover:bg-gray-100"
              disabled={tracks.length === 0}
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No tracks in playlist</p>
        </div>
      )}

      {/* Playlist */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Playlist ({tracks.length} tracks)</h3>
          {tracks.length > 0 && (
            <button
              onClick={handleClearPlaylist}
              className="text-red-600 text-sm hover:text-red-700"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {tracks.map((track, index) => (
            <div
              key={`${track.title}-${index}`}
              className={`flex items-center justify-between p-2 rounded ${
                index === currentIndex
                  ? "bg-blue-50 border border-blue-200"
                  : "hover:bg-gray-50"
              }`}
            >
              <div
                className="flex items-center space-x-3 flex-1 cursor-pointer"
                onClick={() => handlePlayTrack(index)}
              >
                {track.albumCover && (
                  <img
                    src={track.albumCover}
                    alt={track.album}
                    className="w-8 h-8 rounded object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">
                    {track.title}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {track.artist}
                  </div>
                </div>
                {index === currentIndex && isPlaying && (
                  <span className="text-blue-600 text-xs">♪</span>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveTrack(index);
                }}
                className="p-1 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const SimpleMusicPlayer = withInteractable(SimpleMusicPlayerBase, {
  componentName: "SimpleMusicPlayer",
  description:
    "A complete music player that can play, pause, skip tracks, and manage a playlist. Add tracks with addTrack, control playback with action, remove tracks with removeIndex.",
  propsSchema: simpleMusicPlayerSchema,
});
