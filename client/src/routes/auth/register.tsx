import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, TextField, Button, Typography, Link, Alert, Box } from '@mui/material'
import { useRegisterMutation } from '../../api/authApi'

const registerSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
  repeatPassword: z.string().min(1, 'Повторите пароль'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().optional(),
  phone: z.string().optional(),
}).refine((data) => data.password === data.repeatPassword, { message: 'Пароли не совпадают', path: ['repeatPassword'] })
type RegisterForm = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const [registerUser, { isLoading, error }] = useRegisterMutation()
  const { register: reg, handleSubmit, formState: { errors } } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterForm) => {
    try { await registerUser(data).unwrap(); navigate({ to: '/' }) } catch { /* handled */ }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Card sx={{ width: '100%', maxWidth: 420 }} elevation={4}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} textAlign="center" gutterBottom>Регистрация</Typography>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField label="Email" type="email" fullWidth margin="normal" {...reg('email')} error={!!errors.email} helperText={errors.email?.message} />
            <TextField label="Имя пользователя" fullWidth margin="normal" {...reg('username')} />
            <TextField label="Имя" fullWidth margin="normal" {...reg('firstName')} />
            <TextField label="Фамилия" fullWidth margin="normal" {...reg('lastName')} />
            <TextField label="Телефон" fullWidth margin="normal" {...reg('phone')} />
            <TextField label="Пароль" type="password" fullWidth margin="normal" {...reg('password')} error={!!errors.password} helperText={errors.password?.message} />
            <TextField label="Повторите пароль" type="password" fullWidth margin="normal" {...reg('repeatPassword')} error={!!errors.repeatPassword} helperText={errors.repeatPassword?.message} />
            {error && <Alert severity="error" sx={{ mt: 1 }}>{(error as { data?: { detail?: string } })?.data?.detail || 'Ошибка регистрации'}</Alert>}
            <Button type="submit" variant="contained" fullWidth size="large" loading={isLoading} sx={{ mt: 2 }}>Зарегистрироваться</Button>
          </form>
          <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
            Уже есть аккаунт? <Link component="button" onClick={() => navigate({ to: '/auth/login' })}>Войти</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
