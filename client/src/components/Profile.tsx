import { useState } from 'react'
import {
  Avatar,
  IconButton,
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material'
import { Logout, Person } from '@mui/icons-material'
import { useNavigate } from '@tanstack/react-router'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { useLogoutMutation } from '../api/authApi'
import { clearUser } from '../store/authSlice'

export function Profile() {
  const [open, setOpen] = useState(false)
  const user = useAppSelector((s) => s.auth.user)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [logout] = useLogoutMutation()

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      /* ignore */
    }
    dispatch(clearUser())
    localStorage.removeItem('access_token')
    navigate({ to: '/auth/login' })
  }

  if (!user) return null

  return (
    <>
      <IconButton onClick={() => setOpen(true)} sx={{ ml: 'auto' }}>
        <Avatar src={user.avatar} sx={{ width: 36, height: 36 }}>
          {user.firstName?.[0] || user.email[0].toUpperCase()}
        </Avatar>
      </IconButton>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 280, p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mb: 2 }}>
            <Avatar src={user.avatar} sx={{ width: 72, height: 72 }}>
              {user.firstName?.[0] || user.email[0].toUpperCase()}
            </Avatar>
            <Typography variant="h6">
              {user.firstName || user.username || user.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
              {user.role?.map((r) => (
                <Chip key={r} label={r} size="small" color="primary" variant="outlined" />
              ))}
            </Box>
          </Box>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => { navigate({ to: `/employees/${user.id}` }); setOpen(false) }}>
                <ListItemIcon><Person /></ListItemIcon>
                <ListItemText primary="Профиль" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon><Logout color="error" /></ListItemIcon>
                <ListItemText primary="Выйти" primaryTypographyProps={{ color: 'error' }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  )
}
