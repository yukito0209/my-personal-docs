import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getMessages, addMessage, toggleLike, hasUserLiked, addReply, toggleReplyLike, hasUserLikedReply, deleteMessage, editMessage, deleteReply, editReply } from '@/lib/storage'

// 从session中提取用户数据的工具函数
function extractUserData(session: any) {
  let userId = session.user.id
  if (!userId || userId === '' || userId === null || userId === undefined) {
    userId = session.user.githubId || session.user.login || session.user.email || session.user.name || 'temp-user-' + Date.now()
  }
  
  return {
    id: userId,
    name: session.user.name || 'Unknown User',
    avatar: session.user.avatar || session.user.image || '/default-avatar.png',
    githubUrl: session.user.githubUrl || '#'
  }
}

// 获取留言列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    const messages = await getMessages()
    
    // 如果用户已登录，为每条留言添加当前用户的点赞状态
    let messagesWithLikeStatus = messages
    if (session?.user) {
      const userData = extractUserData(session)
      const userId = userData.id
      
      if (userId) {
        messagesWithLikeStatus = await Promise.all(
          messages.map(async (message) => {
            // 为留言添加点赞状态
            const messageWithStatus = {
              ...message,
              hasLiked: await hasUserLiked(message.id, userId),
              // 确保likedUsers存在，如果为空且有likedBy，尝试用当前用户信息补充
              likedUsers: message.likedUsers || []
            }
            
            // 为回复添加点赞状态
            const repliesWithStatus = await Promise.all(
              message.replies.map(async (reply) => ({
                ...reply,
                hasLiked: await hasUserLikedReply(message.id, reply.id, userId),
                // 确保likedUsers存在
                likedUsers: reply.likedUsers || []
              }))
            )
            
            return {
              ...messageWithStatus,
              replies: repliesWithStatus
            }
          })
        )
      }
    }
    
    return NextResponse.json({
      success: true,
      messages: messagesWithLikeStatus,
      total: messages.length,
      isAuthenticated: !!session
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { success: false, error: '获取留言失败' },
      { status: 500 }
    )
  }
}

// 发布新留言或回复
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }
    
    const { content, messageId } = await request.json()
    
    // 验证数据
    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: '内容不能为空' },
        { status: 400 }
      )
    }
    
    if (content.length > 500) {
      return NextResponse.json(
        { success: false, error: '内容不能超过500字符' },
        { status: 400 }
      )
    }
    
    const userData = extractUserData(session)
    
    // 如果提供了messageId，说明这是回复
    if (messageId) {
      const newReply = await addReply(messageId, content, userData)
      
      if (!newReply) {
        return NextResponse.json(
          { success: false, error: '留言不存在' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        reply: {
          ...newReply,
          hasLiked: false // 新回复用户肯定没有点赞
        },
        messageId
      })
    } else {
      // 创建新留言
      const newMessage = await addMessage(content, userData)
      
      return NextResponse.json({
        success: true,
        message: {
          ...newMessage,
          hasLiked: false // 新留言用户肯定没有点赞
        }
      })
    }
    
  } catch (error) {
    console.error('Error creating message/reply:', error)
    return NextResponse.json(
      { success: false, error: '发布失败' },
      { status: 500 }
    )
  }
}

// 点赞/取消点赞留言或回复
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }
    
    const userData = extractUserData(session)
    const userId = userData.id
    
    const { messageId, replyId, action, content } = await request.json()
    
    if (!messageId) {
      return NextResponse.json(
        { success: false, error: '留言ID不能为空' },
        { status: 400 }
      )
    }
    
    // 根据action参数决定操作类型
    switch (action) {
      case 'delete':
        if (replyId) {
          // 删除回复
          const result = await deleteReply(messageId, replyId, userId)
          if (result) {
            return NextResponse.json({ success: true, action: 'delete', type: 'reply' })
          } else {
            return NextResponse.json(
              { success: false, error: '回复不存在或无权限删除' },
              { status: 404 }
            )
          }
        } else {
          // 删除留言
          const result = await deleteMessage(messageId, userId)
          if (result) {
            return NextResponse.json({ success: true, action: 'delete', type: 'message' })
          } else {
            return NextResponse.json(
              { success: false, error: '留言不存在或无权限删除' },
              { status: 404 }
            )
          }
        }
      
      case 'edit':
        if (!content || !content.trim()) {
          return NextResponse.json(
            { success: false, error: '内容不能为空' },
            { status: 400 }
          )
        }
        
        if (content.length > 500) {
          return NextResponse.json(
            { success: false, error: '内容不能超过500字符' },
            { status: 400 }
          )
        }
        
        if (replyId) {
          // 编辑回复
          const result = await editReply(messageId, replyId, userId, content)
          if (result) {
            return NextResponse.json({ 
              success: true, 
              action: 'edit', 
              type: 'reply',
              reply: result 
            })
          } else {
            return NextResponse.json(
              { success: false, error: '回复不存在或无权限编辑' },
              { status: 404 }
            )
          }
        } else {
          // 编辑留言
          const result = await editMessage(messageId, userId, content)
          if (result) {
            return NextResponse.json({ 
              success: true, 
              action: 'edit', 
              type: 'message',
              message: result 
            })
          } else {
            return NextResponse.json(
              { success: false, error: '留言不存在或无权限编辑' },
              { status: 404 }
            )
          }
        }
      
      default:
        // 默认是点赞操作（保持原有逻辑）
        if (replyId) {
          const updatedReply = await toggleReplyLike(messageId, replyId, userId, userData)
          
          if (!updatedReply) {
            return NextResponse.json(
              { success: false, error: '回复不存在' },
              { status: 404 }
            )
          }
          
          // 检查当前用户是否已点赞
          const hasLiked = await hasUserLikedReply(messageId, replyId, userId)
          
          return NextResponse.json({
            success: true,
            reply: {
              ...updatedReply,
              hasLiked
            },
            messageId
          })
        } else {
          // 点赞留言
          const updatedMessage = await toggleLike(messageId, userId, userData)
          
          if (!updatedMessage) {
            return NextResponse.json(
              { success: false, error: '留言不存在' },
              { status: 404 }
            )
          }
          
          // 检查当前用户是否已点赞
          const hasLiked = await hasUserLiked(messageId, userId)
          
          return NextResponse.json({
            success: true,
            message: {
              ...updatedMessage,
              hasLiked
            }
          })
        }
    }
    
  } catch (error) {
    console.error('Error updating message:', error)
    return NextResponse.json(
      { success: false, error: '操作失败' },
      { status: 500 }
    )
  }
} 