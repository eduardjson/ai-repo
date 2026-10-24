import { useEffect } from 'react'
import { Outlet } from '@tanstack/react-router'
import { Box, Container, AppBar, Toolbar, Tabs, Tab, Typography } from '@mui/material'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { ThemeToggle } from '../components/ThemeToggle'
import { Profile } from '../components/Profile'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { useGetMeQuery } from '../api/authApi'
import { setUser, setLoading } from '../store/authSlice'

const TABS = [
  { label: 'Главная', path: '/' },
  { label: 'Позиции', path: '/products' },
  { label: 'Цены', path: '/prices' },
  { label: 'Склады', path: '/warehouses' },
  { label: 'Объекты', path: '/objects' },
  { label: 'Отгрузки', path: '/shipments' },
  { label: 'Перемещения', path: '/transfers' },
  { label: 'Конструктор', path: '/constructor' },
  { label: 'Чат', path: '/chat' },
  { label: 'Сотрудники', path: '/employees' },
]

export function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)

  const { data: user, isError } = useGetMeQuery()

  useEffect(() => {
    if (user) {
      dispatch(setUser(user))
    } else if (isError) {
      dispatch(setLoading(false))
    }
  }, [user, isError, dispatch])

  const currentTab = TABS.findIndex((tab) =>
    tab.path === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.path)
  )

  const isAuthPage = location.pathname === '/auth/login' || location.pathname === '/auth/register'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" color="default" elevation={2}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography
            variant="h6"
            noWrap
            sx={{ cursor: 'pointer', fontWeight: 700, color: 'primary.main' }}
            onClick={() => navigate({ to: '/' })}
          >
            СтройМат
          </Typography>
          {isAuthenticated && (
            <Tabs
              value={currentTab >= 0 ? currentTab : 0}
              onChange={(_e, v) => navigate({ to: TABS[v].path })}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ ml: 2, flex: 1 }}
            >
              {TABS.map((tab) => (
                <Tab key={tab.path} label={tab.label} />
              ))}
            </Tabs>
          )}
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isAuthenticated && !isAuthPage && (
              <>
                <Tab
                  label="Войти"
                  onClick={() => navigate({ to: '/auth/login' })}
                  sx={{ minWidth: 'auto', px: 2 }}
                />
                <Tab
                  label="Регистрация"
                  onClick={() => navigate({ to: '/auth/register' })}
                  sx={{ minWidth: 'auto', px: 2 }}
                />
              </>
            )}
            <Profile />
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flex: 1, py: 3 }}>
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>
      <ThemeToggle />
    </Box>
  )
}
