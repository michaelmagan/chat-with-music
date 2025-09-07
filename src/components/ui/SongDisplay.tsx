"use client";
import { z } from "zod";
import { Music, ExternalLink } from 'lucide-react';

const songSchema = z.object({
  title: z.string(),
  artist: z.string(),
  album: z.string(),
  duration: z.number().optional(),
  link: z.string(),
  albumCover: z.string().optional(),
});

export const songDisplaySchema = z.object({
  songs: z.array(songSchema),
  showDuration: z.boolean().default(true),
  showLink: z.boolean().default(true),
  size: z.enum(['small', 'medium', 'large']).default('medium'),
  title: z.string().optional(),
});

type SongDisplayProps = z.infer<typeof songDisplaySchema>;

export function SongDisplay({
  songs,
  showDuration = true,
  showLink = true,
  size = 'medium',
  title,
}: SongDisplayProps) {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sizeClasses = {
    small: {
      container: 'p-2',
      image: 'w-12 h-12',
      title: 'text-sm font-medium',
      artist: 'text-xs text-gray-600',
      album: 'text-xs text-gray-500',
      duration: 'text-xs text-gray-500',
    },
    medium: {
      container: 'p-3',
      image: 'w-16 h-16',
      title: 'text-base font-semibold',
      artist: 'text-sm text-gray-600',
      album: 'text-sm text-gray-500',
      duration: 'text-sm text-gray-500',
    },
    large: {
      container: 'p-4',
      image: 'w-20 h-20',
      title: 'text-lg font-bold',
      artist: 'text-base text-gray-600',
      album: 'text-base text-gray-500',
      duration: 'text-base text-gray-500',
    },
  };

  const styles = sizeClasses[size] || sizeClasses.medium;

  if (!songs || songs.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        No songs to display
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {title && (
        <h2 className="text-lg font-semibold text-gray-800 mb-3">{title}</h2>
      )}
      
      {songs.map((song, index) => (
        <div key={`${song.title}-${song.artist}-${index}`} className={`bg-white rounded-lg border hover:shadow-md transition-shadow ${styles.container}`}>
          <div className="flex items-center space-x-3">
            {/* Album Cover */}
            <div className={`${styles.image} flex-shrink-0`}>
              {song.albumCover ? (
                <img 
                  src={song.albumCover} 
                  alt={song.album}
                  className={`${styles.image} rounded object-cover`}
                />
              ) : (
                <div className={`${styles.image} rounded bg-gray-100 flex items-center justify-center`}>
                  <Music className={`${size === 'small' ? 'w-6 h-6' : size === 'medium' ? 'w-8 h-8' : 'w-10 h-10'} text-gray-400`} />
                </div>
              )}
            </div>
            
            {/* Song Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className={`${styles.title} truncate`}>{song.title}</h3>
                  <p className={`${styles.artist} truncate`}>{song.artist}</p>
                  <p className={`${styles.album} truncate`}>{song.album}</p>
                </div>
                
                <div className="flex items-center space-x-2 ml-2">
                  {showDuration && song.duration && (
                    <span className={`${styles.duration} font-mono`}>
                      {formatDuration(song.duration)}
                    </span>
                  )}
                  
                  {showLink && (
                    <a
                      href={song.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Open in external player"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}