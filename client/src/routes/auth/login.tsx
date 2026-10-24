import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, TextField, Button, Typography, Link, Alert, Box } from '@mui/material'
import { useLoginMutation } from '../../api/authApi'

const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(1, 'Пароль обязателен'),
})
type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const [login, { isLoading, error }] = useLoginMutation()
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginForm) => {
    try { await login(data).unwrap(); navigate({ to: '/' }) } catch { /* handled by RTK */ }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Card sx={{ width: '100%', maxWidth: 420 }} elevation={4}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} textAlign="center" gutterBottom>Вход</Typography>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField label="Email" type="email" fullWidth margin="normal" {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
            <TextField label="Пароль" type="password" fullWidth margin="normal" {...register('password')} error={!!errors.password} helperText={errors.password?.message} />
            {error && <Alert severity="error" sx={{ mt: 1 }}>{(error as { data?: { detail?: string } })?.data?.detail || 'Ошибка входа'}</Alert>}
            <Button type="submit" variant="contained" fullWidth size="large" loading={isLoading} sx={{ mt: 2 }}>Войти</Button>
          </form>
          <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
            Нет аккаунта? <Link component="button" onClick={() => navigate({ to: '/auth/register' })}>Зарегистрироваться</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
