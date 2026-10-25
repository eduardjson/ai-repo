import { useState } from 'react'
import { Avatar, IconButton, Drawer, Box, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import { Logout, Person } from '@mui/icons-material'
import { useNavigate } from '@tanstack/react-router'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { useAuthControllerLogoutMutation } from '../api/generated'
import { setAccessToken } from '../api/base'
import { clearUser } from '../store/authSlice'
import { ProfileCard } from './ProfileCard'

export function Profile() {
  const [open, setOpen] = useState(false)
  const user = useAppSelector((s) => s.auth.user)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [logout] = useAuthControllerLogoutMutation()

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      /* ignore */
    }
    setAccessToken(null)
    dispatch(clearUser())
    navigate({ to: '/auth/login' })
  }

  if (!user) return null

  return (
    <>
      <IconButton onClick={() => setOpen(true)} sx={{ ml: 'auto' }}>
        <Avatar src={user.avatar ?? undefined} sx={{ width: 36, height: 36 }}>
          {user.firstName?.[0] || user.email[0].toUpperCase()}
        </Avatar>
      </IconButton>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 320, p: 2 }}>
          <ProfileCard
            user={user}
            actions={
              <>
                <ListItemButton onClick={() => { navigate({ to: `/employees/${user.id}` }); setOpen(false) }}>
                  <ListItemIcon><Person /></ListItemIcon>
                  <ListItemText primary="Открыть профиль" />
                </ListItemButton>
                <ListItemButton onClick={handleLogout}>
                  <ListItemIcon><Logout color="error" /></ListItemIcon>
                  <ListItemText primary="Выйти" primaryTypographyProps={{ color: 'error' }} />
                </ListItemButton>
              </>
            }
          />
        </Box>
      </Drawer>
    </>
  )
}
