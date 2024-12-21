import { createClient } from 'redis'

// Redisクライアントをオプショナルに
let client: ReturnType<typeof createClient> | null = null

// 接続関数を修正
async function getClient() {
  if (!client) {
    // 本番環境でのTLS接続を強制
    const url = process.env.REDIS_URL
    if (!url) {
      console.warn('Redis URL not configured')
      return null
    }

    client = createClient({
      url: url,
      socket: {
        tls: process.env.NODE_ENV === 'production',
        rejectUnauthorized: false // 本番環境での証明書検証を無効化
      }
    })

    client.on('error', (err) => {
      console.warn('Redis connection warning:', err)
      client = null // エラー時にクライアントをリセット
    })
  }

  if (!client.isOpen) {
    try {
      await client.connect()
    } catch (error) {
      console.warn('Redis connection failed:', error)
      client = null
      return null
    }
  }

  return client
}

// キャッシュの取得
export async function getCache(key: string) {
  try {
    const redis = await getClient()
    if (!redis) {
      console.log('⚠️ Redis not available, skipping cache')
      return null
    }

    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.warn('⚠️ Redis get warning:', error)
    return null
  }
}

// キャッシュの設定
export async function setCache(key: string, data: any, expireSeconds: number = 1800) {
  try {
    const redis = await getClient()
    if (!redis) {
      console.log('⚠️ Redis not available, skipping cache save')
      return
    }

    await redis.set(key, JSON.stringify(data), {
      EX: expireSeconds
    })
  } catch (error) {
    console.warn('⚠️ Redis set warning:', error)
  }
}