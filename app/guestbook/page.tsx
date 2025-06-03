'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Send, Heart, MessageSquare, Clock, CheckCircle, Reply, ChevronUp, ChevronDown, LogOut, Edit, Trash2 } from 'lucide-react';
import { siGithub } from 'simple-icons/icons';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

interface Reply {
  id: string;
  content: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    githubUrl: string;
  };
  createdAt: string;
  likes: number;
  hasLiked?: boolean;
  likedUsers?: Array<{
    id: string;
    name: string;
    avatar: string;
    githubUrl: string;
  }>;
}

interface Message {
  id: string;
  content: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    githubUrl: string;
  };
  createdAt: string;
  likes: number;
  hasLiked?: boolean;
  likedUsers?: Array<{
    id: string;
    name: string;
    avatar: string;
    githubUrl: string;
  }>;
  replies: Reply[];
}

export default function GuestbookPage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleMessages, setVisibleMessages] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<string[]>([]);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

  const maxLength = 500;

  // 获取当前用户ID的工具函数
  const getCurrentUserId = () => {
    if (!session?.user) return null;
    
    let userId = session.user.id;
    if (!userId || userId === '' || userId === null || userId === undefined) {
      userId = session.user.githubId || session.user.login || session.user.email || session.user.name || 'temp-user-' + Date.now();
    }
    return userId;
  };

  // 获取留言列表
  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/guestbook');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessages(data.messages);
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加载留言
  useEffect(() => {
    fetchMessages();
  }, []);

  // 消息进入视觉效果
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    
    messages.forEach((message) => {
      const element = messageRefs.current[message.id];
      if (element) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setVisibleMessages(prev => [...prev, message.id]);
              observer.disconnect();
            }
          },
          { threshold: 0.1 }
        );
        observer.observe(element);
        observers.push(observer);
      }
    });

    return () => observers.forEach(observer => observer.disconnect());
  }, [messages]);

  // 处理登录
  const handleSignIn = () => {
    signIn('github', { callbackUrl: '/guestbook' });
  };

  // 处理退出登录
  const handleSignOut = () => {
    signOut({ callbackUrl: '/guestbook' });
  };

  // 自动调整文本框高度
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  // 处理文本变化
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setNewMessage(value);
      adjustTextareaHeight();
    }
  };

  // 提交留言
  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSubmitting || !session) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/guestbook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessages(prev => [data.message, ...prev]);
          setNewMessage('');
          setSuccessMessage('发布成功！');
          
          // 重置文本框高度
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
          }
          
          // 3秒后隐藏成功提示
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          alert(data.error || '发布失败');
        }
      } else {
        alert('发布失败，请重试');
      }
    } catch (error) {
      console.error('Failed to submit message:', error);
      alert('发布失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理点赞
  const handleLike = async (messageId: string) => {
    if (!session) {
      alert('请先登录');
      return;
    }

    try {
      const response = await fetch('/api/guestbook', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          setMessages(prev => {
            const updatedMessages = prev.map(msg => 
              msg.id === messageId 
                ? { 
                    ...msg, 
                    likes: data.message.likes, 
                    hasLiked: data.message.hasLiked,
                    likedUsers: data.message.likedUsers
                  }
                : msg
            );
            
            return updatedMessages;
          });
        }
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  // 处理回复点击
  const handleReplyClick = (messageId: string) => {
    setReplyingTo(messageId);
    setReplyContent('');
    // 聚焦到回复输入框
    setTimeout(() => {
      replyTextareaRef.current?.focus();
    }, 100);
  };

  // 取消回复
  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyContent('');
  };

  // 切换回复展开状态
  const toggleReplies = (messageId: string) => {
    setExpandedReplies(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  // 提交回复
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || isSubmittingReply || !session || !replyingTo) return;

    setIsSubmittingReply(true);
    
    try {
      const response = await fetch('/api/guestbook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: replyContent,
          messageId: replyingTo 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // 更新对应留言的回复列表
          setMessages(prev => 
            prev.map(message => 
              message.id === data.messageId 
                ? { ...message, replies: [...message.replies, data.reply] }
                : message
            )
          );
          
          // 确保回复区域是展开的
          if (!expandedReplies.includes(replyingTo)) {
            setExpandedReplies(prev => [...prev, replyingTo]);
          }
          
          setReplyContent('');
          setReplyingTo(null);
          setSuccessMessage('回复成功！');
          
          // 3秒后隐藏成功提示
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          alert(data.error || '回复失败');
        }
      } else {
        alert('回复失败，请重试');
      }
    } catch (error) {
      console.error('Failed to submit reply:', error);
      alert('回复失败，请重试');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // 处理回复点赞
  const handleReplyLike = async (messageId: string, replyId: string) => {
    if (!session) {
      alert('请先登录');
      return;
    }

    try {
      const response = await fetch('/api/guestbook', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId, replyId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessages(prev => 
            prev.map(message => 
              message.id === data.messageId 
                ? {
                    ...message,
                    replies: message.replies.map(reply =>
                      reply.id === data.reply.id 
                        ? { 
                            ...reply, 
                            likes: data.reply.likes, 
                            hasLiked: data.reply.hasLiked,
                            likedUsers: data.reply.likedUsers
                          }
                        : reply
                    )
                  }
                : message
            )
          );
        }
      }
    } catch (error) {
      console.error('Failed to toggle reply like:', error);
    }
  };

  // 开始编辑留言
  const handleEditMessage = (messageId: string, currentContent: string) => {
    setEditingMessage(messageId);
    setEditContent(currentContent);
  };

  // 开始编辑回复
  const handleEditReply = (replyId: string, currentContent: string) => {
    setEditingReply(replyId);
    setEditContent(currentContent);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditingReply(null);
    setEditContent('');
  };

  // 提交编辑
  const handleSubmitEdit = async (messageId: string, replyId?: string) => {
    if (!editContent.trim() || isSubmittingEdit) return;

    setIsSubmittingEdit(true);

    try {
      const response = await fetch('/api/guestbook', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          replyId,
          action: 'edit',
          content: editContent
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (data.type === 'message') {
            // 更新留言
            setMessages(prev =>
              prev.map(msg =>
                msg.id === messageId
                  ? { ...msg, content: data.message.content }
                  : msg
              )
            );
          } else if (data.type === 'reply') {
            // 更新回复
            setMessages(prev =>
              prev.map(message =>
                message.id === messageId
                  ? {
                      ...message,
                      replies: message.replies.map(reply =>
                        reply.id === replyId
                          ? { ...reply, content: data.reply.content }
                          : reply
                      )
                    }
                  : message
              )
            );
          }
          
          // 清理编辑状态
          handleCancelEdit();
          setSuccessMessage('编辑成功！');
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          alert(data.error || '编辑失败');
        }
      } else {
        alert('编辑失败，请重试');
      }
    } catch (error) {
      console.error('Failed to edit:', error);
      alert('编辑失败，请重试');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // 删除留言
  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('确定要删除这条留言吗？此操作无法撤销。')) return;

    try {
      const response = await fetch('/api/guestbook', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          action: 'delete'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // 从列表中移除留言
          setMessages(prev => prev.filter(msg => msg.id !== messageId));
          setSuccessMessage('删除成功！');
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          alert(data.error || '删除失败');
        }
      } else {
        alert('删除失败，请重试');
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('删除失败，请重试');
    }
  };

  // 删除回复
  const handleDeleteReply = async (messageId: string, replyId: string) => {
    if (!confirm('确定要删除这条回复吗？此操作无法撤销。')) return;

    try {
      const response = await fetch('/api/guestbook', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          replyId,
          action: 'delete'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // 从回复列表中移除回复
          setMessages(prev =>
            prev.map(message =>
              message.id === messageId
                ? {
                    ...message,
                    replies: message.replies.filter(reply => reply.id !== replyId)
                  }
                : message
            )
          );
          setSuccessMessage('删除成功！');
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          alert(data.error || '删除失败');
        }
      } else {
        alert('删除失败，请重试');
      }
    } catch (error) {
      console.error('Failed to delete reply:', error);
      alert('删除失败，请重试');
    }
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // 1分钟内
    if (diffMinutes < 1) return '刚刚';
    // 1小时内
    if (diffMinutes < 60) return `${diffMinutes}分钟前`;
    // 今天内
    if (diffHours < 24 && date.toDateString() === now.toDateString()) {
      return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
    }
    // 昨天
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `昨天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
    }
    // 本年内
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('zh-CN', { 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    // 跨年
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取字符计数器的样式类
  const getCharCounterClass = () => {
    const ratio = newMessage.length / maxLength;
    if (ratio >= 0.95) return 'char-counter warning';
    if (ratio >= 0.8) return 'char-counter near-limit';
    return 'char-counter';
  };

  // 点赞者头像组件
  const LikedUsersAvatars = ({ 
    likedUsers, 
    totalLikes 
  }: { 
    likedUsers?: Array<{
      id: string;
      name: string;
      avatar: string;
      githubUrl: string;
    }>;
    totalLikes: number;
  }) => {
    // 如果没有点赞或没有用户信息，不显示任何内容
    if (totalLikes === 0 || !likedUsers || likedUsers.length === 0) return null;
    
    const displayUsers = likedUsers.slice(0, 3); // 最多显示3个头像
    const remainingCount = Math.max(0, totalLikes - displayUsers.length);
    
    return (
      <div className="flex items-center gap-1 ml-2">
        <div className="flex -space-x-1">
          {displayUsers.map((user) => (
            <a
              key={user.id}
              href={user.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group"
              title={user.name}
            >
              <Image
                src={user.avatar}
                alt={user.name}
                width={16}
                height={16}
                className="w-4 h-4 rounded-full border border-background ring-1 ring-border hover:scale-110 transition-transform duration-200"
              />
            </a>
          ))}
          {remainingCount > 0 && (
            <div 
              className="w-4 h-4 rounded-full bg-muted border border-background ring-1 ring-border flex items-center justify-center text-[8px] font-medium text-muted-foreground"
              title={`还有 ${remainingCount} 人点赞`}
            >
              +{remainingCount}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 检查当前用户是否为留言/回复作者
  const isCurrentUserAuthor = (authorId: string, authorName?: string) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return false;
    
    // 首先检查ID是否匹配
    if (currentUserId === authorId) {
      return true;
    }
    
    // 如果ID不匹配，检查用户名作为回退（用于处理旧数据）
    if (authorName && session?.user?.name === authorName) {
      return true;
    }
    
    return false;
  };

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <MessageSquare className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">
              留言板
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            在这里分享你的想法和建议。使用 GitHub 账号登录即可参与讨论！
          </p>
        </div>

        {/* 成功提示 */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg success-checkmark">
            <CheckCircle className="w-4 h-4" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 登录/发布区域 */}
        <div className="mb-8">
          <div className={`glass-effect rounded-2xl border p-6 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5`}>
            {status === 'loading' ? (
              // 加载状态
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">正在检查登录状态...</p>
              </div>
            ) : status !== 'authenticated' ? (
              // 未登录状态
              <div className="text-center py-8">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">使用 GitHub 账号登录</h3>
                  <p className="text-muted-foreground">
                    登录后即可发表留言，并与其他小伙伴交流互动喵~
                  </p>
                </div>
                <button
                  onClick={handleSignIn}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground border border-black dark:border-primary-foreground/20 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 hover:border-black dark:hover:border-primary-foreground/40 focus:outline-none focus:ring-4 focus:ring-primary/20"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d={siGithub.path} />
                  </svg>
                  GitHub 登录
                </button>
              </div>
            ) : (
              // 已登录状态
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Image
                    src={session.user?.avatar || session.user?.image || '/default-avatar.png'}
                    alt={session.user?.name || 'User'}
                    width={40}
                    height={40}
                    className="rounded-full border-2 border-primary/20"
                  />
                  <div>
                    <p className="font-medium">{session.user?.name}</p>
                    <p className="text-sm text-muted-foreground">分享你的想法...</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="ml-auto logout-button relative overflow-hidden button-ripple inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>退出登录</span>
                  </button>
                </div>
                
                <form onSubmit={handleSubmitMessage} className="space-y-4">
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={newMessage}
                      onChange={handleTextChange}
                      placeholder="写下你想说的话..."
                      rows={4}
                      className="message-input w-full px-4 py-3 rounded-lg border bg-background/50 backdrop-blur-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300"
                      disabled={isSubmitting}
                      style={{ minHeight: '100px' }}
                    />
                    <div className={`absolute bottom-3 right-3 text-xs ${getCharCounterClass()}`}>
                      {newMessage.length}/{maxLength}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      支持 Markdown 语法
                    </p>
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || isSubmitting || newMessage.length > maxLength}
                      className={`relative overflow-hidden gradient-publish-button button-ripple inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-400 hover:from-sky-500 hover:via-blue-500 hover:to-cyan-500 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-sky-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:from-gray-400 disabled:to-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 ${
                        isSubmitting ? 'publish-button-loading animate-pulse' : ''
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span>发布中...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          <span>发布留言</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* 留言列表 */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageSquare className="w-5 h-5" />
            <span className="message-count-updated">
              {isLoading ? '加载中...' : `共 ${messages.length} 条留言`}
            </span>
          </div>
          
          {isLoading ? (
            // 加载骨架屏
            <div className="space-y-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="glass-effect rounded-xl border p-6 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-16 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-1/6"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length > 0 ? (
            messages.map((message, index) => (
              <div
                key={message.id}
                ref={(el) => { messageRefs.current[message.id] = el; }}
                className={`message-card glass-effect rounded-xl border p-6 transition-all duration-700 transform ${
                  visibleMessages.includes(message.id)
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-4">
                  <a
                    href={message.user.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 group"
                  >
                    <Image
                      src={message.user.avatar}
                      alt={message.user.name}
                      width={48}
                      height={48}
                      className="message-avatar rounded-full transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20"
                    />
                  </a>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <a
                        href={message.user.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {message.user.name}
                      </a>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <time>{formatTime(message.createdAt)}</time>
                      </div>
                      
                      {/* 编辑和删除按钮 - 只对留言作者显示 */}
                      {isCurrentUserAuthor(message.user.id, message.user.name) && (
                        <div className="ml-auto flex items-center gap-1">
                          <button
                            onClick={() => handleEditMessage(message.id, message.content)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
                            title="编辑留言"
                          >
                            <Edit className="w-3 h-3" />
                            <span>编辑</span>
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                            title="删除留言"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>删除</span>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* 留言内容 - 编辑模式或显示模式 */}
                    {editingMessage === message.id ? (
                      // 编辑模式
                      <div className="mb-3">
                        <textarea
                          value={editContent}
                          onChange={(e) => {
                            if (e.target.value.length <= maxLength) {
                              setEditContent(e.target.value);
                            }
                          }}
                          rows={4}
                          className="w-full px-3 py-2 rounded border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300"
                          disabled={isSubmittingEdit}
                        />
                        <div className="flex items-center justify-between mt-2">
                          <div className={`text-xs ${
                            editContent.length > maxLength * 0.8 
                              ? 'text-destructive' 
                              : 'text-muted-foreground'
                          }`}>
                            {editContent.length}/{maxLength}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                              取消
                            </button>
                            <button
                              onClick={() => handleSubmitEdit(message.id)}
                              disabled={!editContent.trim() || isSubmittingEdit || editContent.length > maxLength}
                              className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {isSubmittingEdit ? '保存中...' : '保存'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // 显示模式
                      <div className="prose prose-sm max-w-none text-foreground mb-3 dark:prose-invert">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeSanitize]}
                          className="whitespace-pre-wrap leading-relaxed markdown-content"
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            code: ({ children, className }) => {
                              const isInline = !className;
                              return isInline ? (
                                <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
                                  {children}
                                </code>
                              ) : (
                                <code className="block bg-muted p-2 rounded text-sm font-mono overflow-x-auto">
                                  {children}
                                </code>
                              );
                            },
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-primary/30 pl-4 italic">
                                {children}
                              </blockquote>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc list-inside space-y-1">{children}</ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal list-inside space-y-1">{children}</ol>
                            ),
                            h1: ({ children }) => (
                              <h1 className="text-lg font-bold mb-2">{children}</h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-base font-bold mb-2">{children}</h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-sm font-bold mb-1">{children}</h3>
                            ),
                            a: ({ children, href }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <button 
                          onClick={() => handleLike(message.id)}
                          className={`like-button inline-flex items-center gap-1 text-sm transition-colors group ${
                            message.hasLiked 
                              ? 'text-red-500 hover:text-red-600' 
                              : 'text-muted-foreground hover:text-red-500'
                          }`}
                          disabled={!session}
                        >
                          {message.hasLiked ? (
                            <Heart className="heart-icon w-4 h-4 group-hover:scale-110 transition-transform fill-current" />
                          ) : (
                            <Heart className="heart-icon w-4 h-4 group-hover:scale-110 transition-transform" />
                          )}
                          <span>{message.likes}</span>
                        </button>
                        <LikedUsersAvatars likedUsers={message.likedUsers} totalLikes={message.likes} />
                      </div>
                      
                      <button 
                        onClick={() => handleReplyClick(message.id)}
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors group"
                        disabled={!session}
                      >
                        <Reply className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>回复</span>
                      </button>
                      
                      {message.replies.length > 0 && (
                        <button
                          onClick={() => toggleReplies(message.id)}
                          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors group"
                        >
                          {expandedReplies.includes(message.id) ? (
                            <ChevronUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          ) : (
                            <ChevronDown className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          )}
                          <span>{message.replies.length} 条回复</span>
                        </button>
                      )}
                    </div>
                    
                    {/* 回复输入框 */}
                    {replyingTo === message.id && (
                      <div className="mt-4 p-4 bg-muted/60 rounded-lg border border-border/70 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <Reply className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">回复 {message.user.name}</span>
                          <button
                            onClick={handleCancelReply}
                            className="ml-auto text-sm text-muted-foreground hover:text-destructive transition-colors"
                          >
                            取消
                          </button>
                        </div>
                        
                        <form onSubmit={handleSubmitReply} className="space-y-3">
                          <textarea
                            ref={replyTextareaRef}
                            value={replyContent}
                            onChange={(e) => {
                              if (e.target.value.length <= maxLength) {
                                setReplyContent(e.target.value);
                              }
                            }}
                            placeholder="写下你的回复..."
                            rows={3}
                            className="w-full px-3 py-2 rounded border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300"
                            disabled={isSubmittingReply}
                          />
                          
                          <div className="flex items-center justify-between">
                            <div className={`text-xs ${
                              replyContent.length > maxLength * 0.8 
                                ? 'text-destructive' 
                                : 'text-muted-foreground'
                            }`}>
                              {replyContent.length}/{maxLength}
                            </div>
                            
                            <button
                              type="submit"
                              disabled={!replyContent.trim() || isSubmittingReply || replyContent.length > maxLength}
                              className="reply-button relative overflow-hidden button-ripple inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:from-gray-400 disabled:to-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            >
                              {isSubmittingReply ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                  <span>发布中...</span>
                                </>
                              ) : (
                                <>
                                  <Send className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                  <span>发布回复</span>
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                    
                    {/* 回复列表 */}
                    {message.replies.length > 0 && expandedReplies.includes(message.id) && (
                      <div className="mt-4 pl-4 border-l-2 border-primary/20 space-y-3">
                        {message.replies.map((reply) => (
                          <div key={reply.id} className="bg-muted/40 rounded-lg p-3 border border-border/60 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <a
                                href={reply.user.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0"
                              >
                                <Image
                                  src={reply.user.avatar}
                                  alt={reply.user.name}
                                  width={32}
                                  height={32}
                                  className="rounded-full transition-all duration-300 hover:scale-110"
                                />
                              </a>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <a
                                    href={reply.user.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-sm text-foreground hover:text-primary transition-colors"
                                  >
                                    {reply.user.name}
                                  </a>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    <time>{formatTime(reply.createdAt)}</time>
                                  </div>
                                </div>
                              </div>
                              
                              {/* 回复的编辑和删除按钮 - 只对回复作者显示 */}
                              {isCurrentUserAuthor(reply.user.id, reply.user.name) && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleEditReply(reply.id, reply.content)}
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
                                    title="编辑回复"
                                  >
                                    <Edit className="w-2.5 h-2.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteReply(message.id, reply.id)}
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                    title="删除回复"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            {/* 回复内容 - 编辑模式或显示模式 */}
                            {editingReply === reply.id ? (
                              // 编辑模式
                              <div className="mb-2">
                                <textarea
                                  value={editContent}
                                  onChange={(e) => {
                                    if (e.target.value.length <= maxLength) {
                                      setEditContent(e.target.value);
                                    }
                                  }}
                                  rows={3}
                                  className="w-full px-2 py-1.5 text-sm rounded border bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300"
                                  disabled={isSubmittingEdit}
                                />
                                <div className="flex items-center justify-between mt-1.5">
                                  <div className={`text-xs ${
                                    editContent.length > maxLength * 0.8 
                                      ? 'text-destructive' 
                                      : 'text-muted-foreground'
                                  }`}>
                                    {editContent.length}/{maxLength}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={handleCancelEdit}
                                      className="px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                      取消
                                    </button>
                                    <button
                                      onClick={() => handleSubmitEdit(message.id, reply.id)}
                                      disabled={!editContent.trim() || isSubmittingEdit || editContent.length > maxLength}
                                      className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                      {isSubmittingEdit ? '保存中...' : '保存'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              // 显示模式
                              <div className="prose prose-sm max-w-none text-foreground mb-2 dark:prose-invert">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  rehypePlugins={[rehypeSanitize]}
                                  className="whitespace-pre-wrap leading-relaxed markdown-content"
                                  components={{
                                    p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                                    code: ({ children, className }) => {
                                      const isInline = !className;
                                      return isInline ? (
                                        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
                                          {children}
                                        </code>
                                      ) : (
                                        <code className="block bg-muted p-2 rounded text-xs font-mono overflow-x-auto">
                                          {children}
                                        </code>
                                      );
                                    },
                                  }}
                                >
                                  {reply.content}
                                </ReactMarkdown>
                              </div>
                            )}
                            
                            <div className="flex items-center">
                              <button 
                                onClick={() => handleReplyLike(message.id, reply.id)}
                                className={`like-button inline-flex items-center gap-1 text-xs transition-colors group ${
                                  reply.hasLiked 
                                    ? 'text-red-500 hover:text-red-600' 
                                    : 'text-muted-foreground hover:text-red-500'
                                }`}
                                disabled={!session}
                              >
                                {reply.hasLiked ? (
                                  <Heart className="heart-icon w-3 h-3 group-hover:scale-110 transition-transform fill-current" />
                                ) : (
                                  <Heart className="heart-icon w-3 h-3 group-hover:scale-110 transition-transform" />
                                )}
                                <span>{reply.likes}</span>
                              </button>
                              <LikedUsersAvatars likedUsers={reply.likedUsers} totalLikes={reply.likes} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            // 空状态
            <div className="empty-state text-center py-16">
              <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">还没有留言</h3>
              <p className="text-muted-foreground">成为第一个留言的人吧！</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 