import { useState, useEffect, useRef } from 'react'
import { Box, Typography, TextField, Button, Paper, IconButton, CircularProgress, Avatar } from '@mui/material'
import { Send, Edit, Delete } from '@mui/icons-material'
import { io } from 'socket.io-client'
import {
  useGetMessagesQuery,
  useCreateMessageMutation,
  useUpdateMessageMutation,
  useDeleteMessageMutation,
  chatApi,
} from '../../api/chatApi'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { getAccessToken } from '../../api/base'
import { ActionModal } from '../../components/ActionModal'

export function ChatPage() {
  const user = useAppSelector((s) => s.auth.user)
  const dispatch = useAppDispatch()
  const { data: messages, isLoading } = useGetMessagesQuery({ limit: 100 })
  const [createMessage] = useCreateMessageMutation()
  const [updateMessage] = useUpdateMessageMutation()
  const [deleteMessage] = useDeleteMessageMutation()
  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const socket = io('/chat', {
      auth: { token: getAccessToken() },
      transports: ['websocket', 'polling'],
    })

    const refresh = () => dispatch(chatApi.util.invalidateTags(['Message']))
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

  const handleSend = async () => {
    if (!text.trim() || !user) return
    try {
      await createMessage({ text: text.trim() }).unwrap()
      setText('')
    } catch {
      /* handled by RTK */
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
      await updateMessage({ id: editingId, data: { text: editText } }).unwrap()
      setEditingId(null)
      setEditText('')
    } catch {
      /* handled by RTK */
    }
  }

  const handleDelete = async () => {
    if (deleteTarget === null) return
    try {
      await deleteMessage(deleteTarget).unwrap()
      setDeleteTarget(null)
    } catch {
      /* handled by RTK */
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Чат</Typography>
      <Paper elevation={1} sx={{ flex: 1, overflow: 'auto', p: 2, mb: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>}
        {messages?.map((msg) => (
          <Box key={msg.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: msg.userId === user?.id ? 'flex-end' : 'flex-start' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>{msg.userName[0]}</Avatar>
              <Typography variant="caption" fontWeight={600}>{msg.userName}</Typography>
              <Typography variant="caption" color="text.secondary">{new Date(msg.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</Typography>
            </Box>
            <Paper variant="outlined" sx={{ p: 1.5, maxWidth: '70%', bgcolor: msg.userId === user?.id ? 'primary.main' : 'grey.100', color: msg.userId === user?.id ? 'primary.contrastText' : 'text.primary', borderRadius: 2 }}>
              {editingId === msg.id ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField size="small" value={editText} onChange={(e) => setEditText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleEdit() }} autoFocus />
                  <Button size="small" variant="contained" onClick={handleEdit}>OK</Button>
                </Box>
              ) : (
                <Typography variant="body2">{msg.text}</Typography>
              )}
            </Paper>
            {msg.userId === user?.id && (
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.25 }}>
                <IconButton size="small" onClick={() => { setEditingId(msg.id); setEditText(msg.text) }}><Edit sx={{ fontSize: 14 }} /></IconButton>
                <IconButton size="small" onClick={() => setDeleteTarget(msg.id)}><Delete sx={{ fontSize: 14 }} color="error" /></IconButton>
              </Box>
            )}
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Paper>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField fullWidth placeholder="Введите сообщение..." value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown} multiline maxRows={3} size="small" />
        <Button variant="contained" onClick={handleSend} disabled={!text.trim()} sx={{ minWidth: 100 }}><Send /></Button>
      </Box>
      <ActionModal open={deleteTarget !== null} title="Удалить сообщение" message="Вы уверены, что хотите удалить это сообщение?" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </Box>
  )
}
