import { FeedPost, SocialPlatform } from '../types';

export const INITIAL_MOCK_POSTS: FeedPost[] = [
  {
    id: 'x-post-1',
    platform: 'twitter',
    author: {
      name: 'Satya Nadella',
      username: 'satyanadella',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
      verified: true,
      profileUrl: 'https://twitter.com/satyanadella',
    },
    content: 'Excited to announce our new developer framework combining real-time streaming, multimodal AI intelligence, and edge-native deployment. Open web ecosystem continues to thrive! 🚀⚡ #TechInnovation #Cloud #AI',
    metrics: {
      likes: 18450,
      comments: 1420,
      shares: 4320,
      views: 382000,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 mins ago
    permalink: 'https://twitter.com/satyanadella/status/17823910293',
    tags: ['TechInnovation', 'Cloud', 'AI'],
  },
  {
    id: 'ig-post-1',
    platform: 'instagram',
    author: {
      name: 'National Geographic',
      username: 'natgeo',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      verified: true,
      profileUrl: 'https://instagram.com/natgeo',
    },
    content: 'Underneath the Arctic Aurora: Temperatures dropped below -35°C as green and violet ribbon lights danced above the Lofoten archipelago in Norway. Captured on long exposure by photographer Marcus Vance. 🌌✨',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&h=800&q=80',
        alt: 'Northern lights over snowy mountains in Norway',
        aspectRatio: '16/9',
      },
    ],
    metrics: {
      likes: 142800,
      comments: 3120,
      shares: 8900,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
    permalink: 'https://instagram.com/p/C6XYZ92019A',
    tags: ['Nature', 'Aurora', 'Photography', 'Norway'],
  },
  {
    id: 'fb-post-1',
    platform: 'facebook',
    author: {
      name: 'React Developers Community',
      username: 'react.developers',
      avatar: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=200&h=200&q=80',
      verified: true,
      profileUrl: 'https://facebook.com/groups/reactjs',
    },
    content: '🎉 Milestone Update: React 19 is officially transforming full-stack developer experience with Server Actions, async transitions, and unified metadata management! What has been your favorite feature in production so far? Drop your code patterns and thoughts in the comments below!',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&h=675&q=80',
        alt: 'Code editor with modern TypeScript and React components',
        aspectRatio: '16/9',
      },
    ],
    metrics: {
      likes: 5420,
      comments: 630,
      shares: 1120,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 70).toISOString(), // 1.1 hours ago
    permalink: 'https://facebook.com/react.developers/posts/9482710382',
    tags: ['ReactJS', 'WebDev', 'TypeScript', 'Frontend'],
  },
  {
    id: 'x-post-2',
    platform: 'twitter',
    author: {
      name: 'Vercel',
      username: 'vercel',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&h=200&q=80',
      verified: true,
      profileUrl: 'https://twitter.com/vercel',
    },
    content: 'Instant rollback, preview deployments per pull request, and zero-downtime serverless streaming at the edge. The modern frontend cloud has never been faster. Try the new Turbopack benchmarks in your terminal now: npx create-next-app@latest',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&h=675&q=80',
        alt: 'Analytics and deployment speed charts',
        aspectRatio: '16/9',
      },
    ],
    metrics: {
      likes: 8940,
      comments: 412,
      shares: 1890,
      views: 195000,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    permalink: 'https://twitter.com/vercel/status/17823999999',
    tags: ['Vercel', 'NextJS', 'DevTools', 'Cloud'],
  },
  {
    id: 'ig-post-2',
    platform: 'instagram',
    author: {
      name: 'Minimal Architecture & Design',
      username: 'minimal.arch',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
      verified: false,
      profileUrl: 'https://instagram.com/minimal.arch',
    },
    content: 'Cantilevered glass pavilion perched above Lake Como. Seamless harmony between raw concrete textures, cedar wood slats, and warm sunset illumination. Interior styling by Studio Forma. Would you live here? 🏡🌿',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&h=800&q=80',
        alt: 'Modern architectural villa with warm sunset lighting',
        aspectRatio: '16/9',
      },
    ],
    metrics: {
      likes: 58900,
      comments: 870,
      shares: 4120,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    permalink: 'https://instagram.com/p/C6ZBA88123',
    tags: ['Architecture', 'Design', 'Minimalism', 'LakeComo'],
  },
  {
    id: 'fb-post-2',
    platform: 'facebook',
    author: {
      name: 'TechCrunch',
      username: 'techcrunch',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&h=200&q=80',
      verified: true,
      profileUrl: 'https://facebook.com/techcrunch',
    },
    content: 'Global investment in autonomous clean energy grids surges by 44% year-over-year. Breakthroughs in long-duration solid-state batteries are making localized solar and wind micro-grids economical for small cities and industrial zones worldwide. Read the comprehensive investigative breakdown:',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&h=675&q=80',
        alt: 'Solar panels and modern wind turbines on rolling green hills',
        aspectRatio: '16/9',
      },
    ],
    metrics: {
      likes: 7290,
      comments: 890,
      shares: 2150,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    permalink: 'https://facebook.com/techcrunch/posts/84920192837',
    tags: ['CleanEnergy', 'Startups', 'Technology', 'Sustainability'],
  },
  {
    id: 'x-post-3',
    platform: 'twitter',
    author: {
      name: 'Guillermo Rauch',
      username: 'rauchg',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
      verified: true,
      profileUrl: 'https://twitter.com/rauchg',
    },
    content: 'The best products don\'t just add AI; they use AI to eliminate steps entirely. Great UI is disappearing UI. Build for speed, reduce cognitive load, and keep the user in pure flow state.',
    metrics: {
      likes: 14200,
      comments: 630,
      shares: 2890,
      views: 312000,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    permalink: 'https://twitter.com/rauchg/status/17823812901',
    tags: ['UX', 'ProductDesign', 'AI', 'Startups'],
  },
];

const SIMULATED_AUTHORS = [
  {
    platform: 'twitter' as SocialPlatform,
    name: 'OpenAI Devs',
    username: 'OpenAIDevs',
    avatar: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=200&h=200&q=80',
    verified: true,
    contents: [
      'Just rolled out fine-tuning updates with lower latency and higher context recall. Check out the playground examples! 🧠✨',
      'Structured Outputs are now live across all modern completions endpoints. Reliable JSON schema enforcement with 100% adherence! 🛡️',
      'Real-time streaming audio API is now available in public preview. Talk directly to your code! 🎙️⚡',
    ],
    tags: ['OpenAI', 'Devs', 'AI', 'APIs'],
  },
  {
    platform: 'instagram' as SocialPlatform,
    name: 'Travel & Horizons',
    username: 'travelhorizons',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
    verified: true,
    contents: [
      'Hidden crystal lagoon found between the sea cliffs of Palawan, Philippines. Pure turquoise bliss! 🌊🏝️',
      'Golden hour reflection over the ancient temples of Kyoto during cherry blossom peak season. Pure tranquility. 🌸🏯',
      'Wandering through the colorful cobblestone alleys of Chefchaouen, the blue pearl of Morocco. 💙✨',
    ],
    mediaUrls: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&h=800&q=80',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&h=800&q=80',
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&h=800&q=80',
    ],
    tags: ['Travel', 'Wanderlust', 'Photography', 'Explore'],
  },
  {
    platform: 'facebook' as SocialPlatform,
    name: 'TypeScript Official Community',
    username: 'typescriptlang',
    avatar: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=200&h=200&q=80',
    verified: true,
    contents: [
      '⚡ TypeScript 5.8 is in release candidate! Featuring faster type-checking passes, improved editor auto-imports, and const type parameters refinement.',
      'Discussion of the week: How does your team handle strict null checking in massive monorepos? Share your tips & eslint configurations!',
    ],
    mediaUrls: [
      'https://images.unsplash.com/photo-1516116211227-bbc03a744211?auto=format&fit=crop&w=1200&h=675&q=80',
    ],
    tags: ['TypeScript', 'JavaScript', 'Coding', 'OpenSource'],
  },
];

/**
 * Dynamically generate a fresh, realistic post to simulate live incoming feeds over WebSocket
 */
export function generateSimulatedPost(preferredPlatform?: SocialPlatform): FeedPost {
  const authorCandidates = preferredPlatform
    ? SIMULATED_AUTHORS.filter((a) => a.platform === preferredPlatform)
    : SIMULATED_AUTHORS;

  const authorData = authorCandidates[Math.floor(Math.random() * authorCandidates.length)];
  const content = authorData.contents[Math.floor(Math.random() * authorData.contents.length)];
  const mediaUrl = authorData.mediaUrls
    ? authorData.mediaUrls[Math.floor(Math.random() * authorData.mediaUrls.length)]
    : undefined;

  const timestamp = new Date().toISOString();
  const id = `live-${authorData.platform}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  return {
    id,
    platform: authorData.platform,
    author: {
      name: authorData.name,
      username: authorData.username,
      avatar: authorData.avatar,
      verified: authorData.verified,
      profileUrl: `https://${authorData.platform}.com/${authorData.username}`,
    },
    content,
    media: mediaUrl
      ? [
          {
            type: 'image',
            url: mediaUrl,
            alt: 'Live simulated media feed image',
            aspectRatio: '16/9',
          },
        ]
      : undefined,
    metrics: {
      likes: Math.floor(Math.random() * 500) + 12,
      comments: Math.floor(Math.random() * 50) + 2,
      shares: Math.floor(Math.random() * 90) + 1,
      views: authorData.platform === 'twitter' ? Math.floor(Math.random() * 5000) + 200 : undefined,
    },
    createdAt: timestamp,
    permalink: `https://${authorData.platform}.com/${authorData.username}/status/${Date.now()}`,
    tags: authorData.tags,
  };
}
