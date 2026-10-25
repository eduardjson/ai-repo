import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  CircularProgress,
  Avatar,
  Tooltip,
} from '@mui/material'
import { Send, Edit, Delete, AttachFile, PictureAsPdf, Close, Download } from '@mui/icons-material'
import { io } from 'socket.io-client'
import {
  useChatControllerFindAllQuery,
  useChatControllerUpdateMutation,
  useChatControllerRemoveMutation,
} from '../../api/generated'
import { emptySplitApi } from '../../api/emptyApi'
import { getAccessToken, downloadAttachment } from '../../api/base'
import { uploadFormData } from '../../api/upload'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { ActionModal } from '../../components/ActionModal'

const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

const fmtSize = (n: number) =>
  n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} МБ` : `${Math.round(n / 1024)} КБ`

export function ChatPage() {
  const user = useAppSelector((s) => s.auth.user)
  const dispatch = useAppDispatch()
  const { data: messages, isLoading } = useChatControllerFindAllQuery({ limit: '100' })
  const [updateMessage] = useChatControllerUpdateMutation()
  const [deleteMessage] = useChatControllerRemoveMutation()

  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const socket = io('/chat', {
      auth: { token: getAccessToken() },
      transports: ['websocket', 'polling'],
    })

    const refresh = () => dispatch(emptySplitApi.util.invalidateTags(['chat']))
    socket.on('message:new', refresh)
    socket.on('message:updated', refresh)
    socket.on('message:deleted', refresh)

    return () => {
      socket.disconnect()
    }
  }, [dispatch])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const lastMessageId = messages && messages.length > 0 ? messages[messages.length - 1].id : null

  const handleSend = async () => {
    if ((!text.trim() && !file) || !user) return
    const formData = new FormData()
    if (text.trim()) formData.append('text', text.trim())
    if (file) formData.append('file', file)
    setSending(true)
    try {
      await uploadFormData('/chat/messages', 'POST', formData)
      setText('')
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch {
      /* handled */
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleEdit = async () => {
    if (editingId === null) return
    try {
      await updateMessage({ id: editingId, messageTextDto: { text: editText } }).unwrap()
      setEditingId(null)
      setEditText('')
    } catch {
      /* handled */
    }
  }

  const handleDelete = async () => {
    if (deleteTarget === null) return
    try {
      await deleteMessage({ id: deleteTarget }).unwrap()
      setDeleteTarget(null)
    } catch {
      /* handled */
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Чат</Typography>

      <Paper elevation={1} sx={{ flex: 1, overflow: 'auto', p: 2, mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
        )}

        {messages?.map((msg) => {
          const own = msg.userId === user?.id
          const canModify = own && msg.id === lastMessageId
          const initial = (msg.userName[0] ?? '?').toUpperCase()

          return (
            <Box
              key={msg.id}
              sx={{
                alignSelf: own ? 'flex-end' : 'flex-start',
                maxWidth: { xs: '90%', sm: '72%' },
                minWidth: 160,
                bgcolor: own ? 'primary.main' : 'background.paper',
                color: own ? 'primary.contrastText' : 'text.primary',
                borderRadius: 2,
                border: own ? 'none' : 1,
                borderColor: 'divider',
                p: 1.5,
                boxShadow: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Avatar
                  src={msg.user?.avatar ?? undefined}
                  sx={{ width: 30, height: 30, fontSize: 14, bgcolor: own ? 'primary.dark' : 'primary.main' }}
                >
                  {initial}
                </Avatar>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{msg.userName}</Typography>
              </Box>

              {editingId === msg.id ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    fullWidth
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleEdit() }}
                    autoFocus
                    sx={{
                      '& .MuiOutlinedInput-root': { color: own ? 'inherit' : 'text.primary' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: own ? 'rgba(255,255,255,0.5)' : 'divider' },
                    }}
                  />
                  <Button size="small" variant="contained" color={own ? 'inherit' : 'primary'} onClick={handleEdit}>OK</Button>
                </Box>
              ) : (
                msg.text && (
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {msg.text}
                  </Typography>
                )
              )}

              {msg.attachments?.map((a) => (
                <Box
                  key={a.id}
                  sx={{
                    mt: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 0.75,
                    borderRadius: 1,
                    bgcolor: own ? 'rgba(255,255,255,0.16)' : 'action.hover',
                  }}
                >
                  <PictureAsPdf fontSize="small" />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>{a.fileName}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>{fmtSize(a.fileSize)}</Typography>
                  </Box>
                  <Tooltip title="Скачать">
                    <IconButton size="small" color="inherit" onClick={() => downloadAttachment(msg.id, a.id, a.fileName).catch(() => {})}>
                      <Download fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, mt: 0.5 }}>
                <Typography variant="caption" sx={{ opacity: 0.75 }}>{fmtTime(msg.createdAt)}</Typography>
                {canModify && (
                  <>
                    <Tooltip title="Редактировать">
                      <IconButton size="small" color="inherit" onClick={() => { setEditingId(msg.id); setEditText(msg.text) }}>
                        <Edit sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton size="small" color="inherit" onClick={() => setDeleteTarget(msg.id)}>
                        <Delete sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Box>
            </Box>
          )
        })}

        <div ref={messagesEndRef} />
      </Paper>

      <Paper elevation={1} sx={{ p: 1 }}>
        {file && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, pb: 1 }}>
            <PictureAsPdf color="error" fontSize="small" />
            <Typography variant="body2" noWrap sx={{ flex: 1 }}>{file.name}</Typography>
            <Typography variant="caption" color="text.secondary">{fmtSize(file.size)}</Typography>
            <Tooltip title="Убрать файл">
              <IconButton size="small" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}>
                <Close fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            hidden
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <Tooltip title="Прикрепить PDF">
            <IconButton color="primary" onClick={() => fileInputRef.current?.click()}>
              <AttachFile />
            </IconButton>
          </Tooltip>
          <TextField
            fullWidth
            placeholder="Введите сообщение..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            multiline
            maxRows={4}
            size="small"
          />
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={(!text.trim() && !file) || sending}
            sx={{ minWidth: 100, py: 1 }}
          >
            {sending ? <CircularProgress size={20} color="inherit" /> : <Send />}
          </Button>
        </Box>
      </Paper>

      <ActionModal
        open={deleteTarget !== null}
        title="Удалить сообщение"
        message="Вы уверены, что хотите удалить это сообщение?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  )
}
