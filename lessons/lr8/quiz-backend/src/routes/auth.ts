import { Hono } from 'hono'
import { sign, verify } from 'hono/jwt'
import { githubCallbackSchema } from '../utils/validation.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const auth = new Hono()

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'

// 🔹 Callback для GitHub (mock)
auth.post('/github/callback', async (c) => {
  const body = await c.req.json()
  const parsed = githubCallbackSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Invalid code' }, 400)
  }

  const { code } = parsed.data
  let githubUser

  // Mock режим
  if (code.startsWith('test_')) {
    githubUser = {
      id: '123456',
      email: 'test@example.com',
      name: 'Test User'
    }
  } else {
    return c.json({ error: 'Real GitHub mode not implemented yet' }, 400)
  }

  // Создание или обновление пользователя
  const user = await prisma.user.upsert({
    where: { githubId: githubUser.id },
    update: {
      email: githubUser.email,
      name: githubUser.name
    },
    create: {
      githubId: githubUser.id,
      email: githubUser.email,
      name: githubUser.name
    }
  })

  // Генерация JWT
  const token = await sign(
    {
      userId: user.id,
      email: user.email
    },
    JWT_SECRET,
    'HS256'
  )

  return c.json({
    token,
    user: {
        id: user.id,
        email: user.email,
        name: user.name,
        githubId: user.githubId,
        createdAt: user.createdAt,
    },
  })
})



// 🔹 Маршрут /me для получения текущего пользователя по токену
auth.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization') // Hono использует .header()
  if (!authHeader) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const payload: any = await verify(token, JWT_SECRET, 'HS256')

    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    })

    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json({ user })
  } catch (err) {
    return c.json({ error: 'Invalid token' }, 401)
  }
})

export default auth