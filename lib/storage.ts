import fs from 'fs/promises'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json')

export interface Reply {
  id: string
  content: string
  user: {
    id: string
    name: string
    avatar: string
    githubUrl: string
  }
  createdAt: string
  likes: number
  likedBy: string[] // 存储点赞用户的ID列表
  likedUsers: Array<{   // 存储点赞用户的详细信息
    id: string
    name: string
    avatar: string
    githubUrl: string
  }>
}

export interface Message {
  id: string
  content: string
  user: {
    id: string
    name: string
    avatar: string
    githubUrl: string
  }
  createdAt: string
  likes: number
  likedBy: string[] // 存储点赞用户的ID列表
  likedUsers: Array<{   // 存储点赞用户的详细信息
    id: string
    name: string
    avatar: string
    githubUrl: string
  }>
  replies: Reply[] // 回复列表
}

// 确保数据目录存在
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch (error) {
    // 目录已存在或创建失败，忽略错误
  }
}

// 数据迁移：确保旧数据包含likedUsers字段
function migrateMessageData(message: any): Message {
  return {
    ...message,
    likedUsers: message.likedUsers || [],
    replies: message.replies?.map((reply: any) => ({
      ...reply,
      likedUsers: reply.likedUsers || []
    })) || []
  }
}

// 读取留言数据
export async function getMessages(): Promise<Message[]> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(MESSAGES_FILE, 'utf8')
    const messages = JSON.parse(data) as any[]
    
    // 执行数据迁移
    const migratedMessages = messages.map(migrateMessageData)
    
    // 按时间倒序排列
    return migratedMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (error) {
    // 文件不存在或解析失败，返回空数组
    return []
  }
}

// 保存留言数据
async function saveMessages(messages: Message[]): Promise<void> {
  await ensureDataDir()
  await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf8')
}

// 添加新留言
export async function addMessage(content: string, user: {
  id: string
  name: string
  avatar: string
  githubUrl: string
}): Promise<Message> {
  const messages = await getMessages()
  
  const newMessage: Message = {
    id: Date.now().toString(),
    content: content.trim(),
    user,
    createdAt: new Date().toISOString(),
    likes: 0,
    likedBy: [],
    likedUsers: [],
    replies: []
  }
  
  messages.unshift(newMessage)
  
  // 限制留言数量，避免文件过大
  if (messages.length > 1000) {
    messages.splice(1000)
  }
  
  await saveMessages(messages)
  return newMessage
}

// 点赞/取消点赞留言
export async function toggleLike(messageId: string, userId: string, userInfo?: {
  id: string
  name: string
  avatar: string
  githubUrl: string
}): Promise<Message | null> {
  const messages = await getMessages()
  const messageIndex = messages.findIndex(msg => msg.id === messageId)
  
  if (messageIndex === -1) {
    return null
  }
  
  const message = messages[messageIndex]
  const likedIndex = message.likedBy.indexOf(userId)
  
  if (likedIndex === -1) {
    // 用户未点赞，添加点赞
    message.likedBy.push(userId)
    if (userInfo) {
      // 确保likedUsers数组存在
      if (!message.likedUsers) {
        message.likedUsers = []
      }
      // 检查是否已存在该用户信息
      const existingUserIndex = message.likedUsers.findIndex(u => u.id === userId)
      if (existingUserIndex === -1) {
        message.likedUsers.push(userInfo)
      }
    }
    message.likes = message.likedBy.length
  } else {
    // 用户已点赞，取消点赞
    message.likedBy.splice(likedIndex, 1)
    if (message.likedUsers) {
      const userIndex = message.likedUsers.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        message.likedUsers.splice(userIndex, 1)
      }
    }
    message.likes = message.likedBy.length
  }
  
  await saveMessages(messages)
  return message
}

// 检查用户是否已点赞某条留言
export async function hasUserLiked(messageId: string, userId: string): Promise<boolean> {
  const messages = await getMessages()
  const message = messages.find(msg => msg.id === messageId)
  return message ? message.likedBy.includes(userId) : false
}

// 删除留言
export async function deleteMessage(messageId: string, userId: string): Promise<boolean> {
  const messages = await getMessages()
  const messageIndex = messages.findIndex(msg => msg.id === messageId)
  
  if (messageIndex === -1) {
    return false
  }
  
  const message = messages[messageIndex]
  
  // 只有留言作者可以删除自己的留言
  if (message.user.id !== userId) {
    return false
  }
  
  messages.splice(messageIndex, 1)
  await saveMessages(messages)
  return true
}

// 编辑留言
export async function editMessage(messageId: string, userId: string, newContent: string): Promise<Message | null> {
  const messages = await getMessages()
  const messageIndex = messages.findIndex(msg => msg.id === messageId)
  
  if (messageIndex === -1) {
    return null
  }
  
  const message = messages[messageIndex]
  
  // 只有留言作者可以编辑自己的留言
  if (message.user.id !== userId) {
    return null
  }
  
  // 更新留言内容
  message.content = newContent.trim()
  
  await saveMessages(messages)
  return message
}

// 添加回复
export async function addReply(messageId: string, content: string, user: {
  id: string
  name: string
  avatar: string
  githubUrl: string
}): Promise<Reply | null> {
  const messages = await getMessages()
  const messageIndex = messages.findIndex(msg => msg.id === messageId)
  
  if (messageIndex === -1) {
    return null
  }
  
  const newReply: Reply = {
    id: Date.now().toString(),
    content: content.trim(),
    user,
    createdAt: new Date().toISOString(),
    likes: 0,
    likedBy: [],
    likedUsers: []
  }
  
  messages[messageIndex].replies.push(newReply)
  
  await saveMessages(messages)
  return newReply
}

// 点赞/取消点赞回复
export async function toggleReplyLike(messageId: string, replyId: string, userId: string, userInfo?: {
  id: string
  name: string
  avatar: string
  githubUrl: string
}): Promise<Reply | null> {
  const messages = await getMessages()
  const messageIndex = messages.findIndex(msg => msg.id === messageId)
  
  if (messageIndex === -1) {
    return null
  }
  
  const replyIndex = messages[messageIndex].replies.findIndex(reply => reply.id === replyId)
  
  if (replyIndex === -1) {
    return null
  }
  
  const reply = messages[messageIndex].replies[replyIndex]
  const likedIndex = reply.likedBy.indexOf(userId)
  
  if (likedIndex === -1) {
    // 用户未点赞，添加点赞
    reply.likedBy.push(userId)
    if (userInfo) {
      // 确保likedUsers数组存在
      if (!reply.likedUsers) {
        reply.likedUsers = []
      }
      // 检查是否已存在该用户信息
      const existingUserIndex = reply.likedUsers.findIndex(u => u.id === userId)
      if (existingUserIndex === -1) {
        reply.likedUsers.push(userInfo)
      }
    }
    reply.likes = reply.likedBy.length
  } else {
    // 用户已点赞，取消点赞
    reply.likedBy.splice(likedIndex, 1)
    if (reply.likedUsers) {
      const userIndex = reply.likedUsers.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        reply.likedUsers.splice(userIndex, 1)
      }
    }
    reply.likes = reply.likedBy.length
  }
  
  await saveMessages(messages)
  return reply
}

// 检查用户是否已点赞某条回复
export async function hasUserLikedReply(messageId: string, replyId: string, userId: string): Promise<boolean> {
  const messages = await getMessages()
  const message = messages.find(msg => msg.id === messageId)
  if (!message) return false
  
  const reply = message.replies.find(r => r.id === replyId)
  return reply ? reply.likedBy.includes(userId) : false
}

// 删除回复
export async function deleteReply(messageId: string, replyId: string, userId: string): Promise<boolean> {
  const messages = await getMessages()
  const messageIndex = messages.findIndex(msg => msg.id === messageId)
  
  if (messageIndex === -1) {
    return false
  }
  
  const replyIndex = messages[messageIndex].replies.findIndex(reply => reply.id === replyId)
  
  if (replyIndex === -1) {
    return false
  }
  
  const reply = messages[messageIndex].replies[replyIndex]
  
  // 只有回复作者可以删除自己的回复
  if (reply.user.id !== userId) {
    return false
  }
  
  messages[messageIndex].replies.splice(replyIndex, 1)
  await saveMessages(messages)
  return true
}

// 编辑回复
export async function editReply(messageId: string, replyId: string, userId: string, newContent: string): Promise<Reply | null> {
  const messages = await getMessages()
  const messageIndex = messages.findIndex(msg => msg.id === messageId)
  
  if (messageIndex === -1) {
    return null
  }
  
  const replyIndex = messages[messageIndex].replies.findIndex(reply => reply.id === replyId)
  
  if (replyIndex === -1) {
    return null
  }
  
  const reply = messages[messageIndex].replies[replyIndex]
  
  // 只有回复作者可以编辑自己的回复
  if (reply.user.id !== userId) {
    return null
  }
  
  // 更新回复内容
  reply.content = newContent.trim()
  
  await saveMessages(messages)
  return reply
} 