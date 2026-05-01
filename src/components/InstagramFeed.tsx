import { useEffect, useRef, useState } from 'react'

const TOKEN = import.meta.env.VITE_INSTAGRAM_TOKEN
const IG_ID = '17841401447773936'
const BASE = 'https://graph.facebook.com/v21.0'

interface IGProfile {
  followers_count: number
  username: string
  profile_picture_url: string
}

interface IGPost {
  id: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url: string
  thumbnail_url?: string
  permalink: string
  like_count: number
  comments_count: number
}

function formatFollowers(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return String(n)
}

const CARD_WIDTH = 160
const GAP = 12
const SPEED = 0.5 // px per frame

export default function InstagramFeed() {
  const [profile, setProfile] = useState<IGProfile | null>(null)
  const [posts, setPosts] = useState<IGPost[]>([])
  const trackRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const xRef = useRef(0)
  const pausedRef = useRef(false)

  useEffect(() => {
    async function load() {
      const [prof] = await Promise.all([
        fetch(`${BASE}/${IG_ID}?fields=followers_count,username,profile_picture_url&access_token=${TOKEN}`)
          .then((r) => r.json()),
      ])
      if (!prof.error) setProfile(prof)

      // Paginate through all posts
      const all: IGPost[] = []
      let url: string | null = `${BASE}/${IG_ID}/media?fields=id,media_type,media_url,thumbnail_url,permalink,like_count,comments_count&limit=100&access_token=${TOKEN}`
      while (url) {
        const res = await fetch(url).then((r) => r.json())
        if (res.error || !res.data) break
        all.push(...res.data)
        url = res.paging?.next ?? null
      }

      const sorted = all.sort(
        (a, b) => (b.like_count + b.comments_count * 3) - (a.like_count + a.comments_count * 3)
      )
      setPosts(sorted.slice(0, 20))
    }
    load()
  }, [])

  // Auto-scroll loop — duplicated items for seamless infinite scroll
  useEffect(() => {
    if (posts.length === 0) return
    const track = trackRef.current
    if (!track) return

    const halfWidth = posts.length * (CARD_WIDTH + GAP)

    const tick = () => {
      if (!pausedRef.current) {
        xRef.current += SPEED
        if (xRef.current >= halfWidth) xRef.current = 0
        track.style.transform = `translateX(-${xRef.current}px)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [posts])

  if (!profile && posts.length === 0) return null

  const doubled = [...posts, ...posts]

  return (
    <div className="mt-10 sm:mt-14">
      {/* Header */}
      <a
        href="https://www.instagram.com/demicherifitness"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-3 mb-6 group no-underline"
      >
        {profile?.profile_picture_url && (
          <img
            src={profile.profile_picture_url}
            alt="Dani Demicheri"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#9580A6]/40"
          />
        )}
        <div className="text-left">
          <p className="text-[#1A1820] font-bold text-[14px] leading-none m-0 group-hover:text-[#9580A6] transition-colors">
            @demicherifitness
          </p>
          {profile && (
            <p className="text-[#9580A6] text-[12px] font-semibold m-0 mt-0.5">
              {formatFollowers(profile.followers_count)} seguidores
            </p>
          )}
        </div>
        <svg
          className="w-5 h-5 text-[#9580A6] ml-1 opacity-60 group-hover:opacity-100 transition-opacity"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <circle cx="12" cy="12" r="4.5" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      </a>

      {/* Carousel */}
      {posts.length > 0 && (
        <div
          className="overflow-hidden -mx-4 sm:-mx-8 md:-mx-12"
          onMouseEnter={() => { pausedRef.current = true }}
          onMouseLeave={() => { pausedRef.current = false }}
        >
          <div
            ref={trackRef}
            className="flex will-change-transform"
            style={{ gap: GAP, width: 'max-content' }}
          >
            {doubled.map((post, i) => {
              const thumb = post.thumbnail_url ?? post.media_url
              return (
                <a
                  key={`${post.id}-${i}`}
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex-shrink-0 overflow-hidden rounded-[10px] bg-[#f0eaf5] group block"
                  style={{ width: CARD_WIDTH, height: CARD_WIDTH * 1.6 }}
                >
                  <img
                    src={thumb}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    draggable={false}
                  />
                  {post.media_type === 'VIDEO' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                      </div>
                    </div>
                  )}
                  {/* Stats overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex flex-col justify-end p-2.5 opacity-0 group-hover:opacity-100">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-white text-[12px] font-semibold leading-none">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        {post.like_count >= 1000 ? `${(post.like_count / 1000).toFixed(1)}K` : post.like_count}
                      </span>
                      <span className="flex items-center gap-1 text-white text-[12px] font-semibold leading-none">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        {post.comments_count}
                      </span>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
