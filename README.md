# A Natural Language Interface for Listening to Music (Cursor for Spotify)

Talk to your music player like you would to a friend: "Find some jazz music" or "Show me songs by The Beatles". The AI understands context and searches the Deezer music catalog. It can update and manage your playlist as you go.

## Demo
https://github.com/user-attachments/assets/7149c212-a383-4f1d-ba81-8e53fa30da43

## Live Demo (try it out!)

https://my-music-player-phi-six.vercel.app/

## How It Works

This app demonstrates the power of **Tambo AI** for building conversational interfaces with dynamic UI generation.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **Tambo AI SDK** - Conversational AI with dynamic UI generation
- **Deezer API** - Music search and streaming data
- **Tailwind CSS** - Styling and responsive design
- **TypeScript** - Type-safe development
- **Zod** - Runtime schema validation

## Run Locally

```bash
git clone https://github.com/michaelmagan/chat-with-music
cd chat-with-music
npm install
npx tambo init
npm run dev
```

## Notes

Deezer API only allows 30s previews, so the music player will only play 30s previews.
