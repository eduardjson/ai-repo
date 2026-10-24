import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Box, Typography, Button, Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Paper, Avatar, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControl, InputLabel, Select,
  MenuItem, Tooltip, Alert, Checkbox, ListItemText,
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import { format } from 'date-fns'
import { useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation } from '../../api/warehouseApi'
import { useAppSelector } from '../../store/hooks'
import { ActionModal } from '../../components/ActionModal'
import type { UserDto } from '@shared/types'

const ROLE_LABELS: Record<string, string> = { ADMIN: 'Администратор', USER: 'Сотрудник' }

interface EmployeeFormState {
  email: string
  password: string
  firstName: string
  lastName: string
  username: string
  phone: string
  role: string[]
}

const emptyForm: EmployeeFormState = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  username: '',
  phone: '',
  role: ['USER'],
}

export function EmployeeListPage() {
  const navigate = useNavigate()
  const currentUser = useAppSelector((s) => s.auth.user)
  const isAdmin = currentUser?.role?.includes('ADMIN') ?? false

  const { data: users } = useGetUsersQuery()
  const [createUser, { isLoading: creating, error: createError }] = useCreateUserMutation()
  const [updateUser, { isLoading: updating, error: updateError }] = useUpdateUserMutation()
  const [deleteUser] = useDeleteUserMutation()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<UserDto | null>(null)
  const [form, setForm] = useState<EmployeeFormState>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<UserDto | null>(null)

  const openCreate = () => {
    setEditTarget(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (u: UserDto) => {
    setEditTarget(u)
    setForm({
      email: u.email,
      password: '',
      firstName: u.firstName ?? '',
      lastName: u.lastName ?? '',
      username: u.username ?? '',
      phone: u.phone ?? '',
      role: u.role?.length ? [...u.role] : ['USER'],
    })
    setDialogOpen(true)
  }

  const set = <K extends keyof EmployeeFormState>(field: K, value: EmployeeFormState[K]) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async () => {
    if (editTarget) {
      await updateUser({
        id: editTarget.id,
        data: {
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          username: form.username,
          phone: form.phone,
          role: form.role,
        },
      }).unwrap()
    } else {
      await createUser({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        phone: form.phone,
        role: form.role,
      }).unwrap()
    }
    setDialogOpen(false)
  }

  const error = editTarget ? updateError : createError
  const errorMsg = (error as { data?: { message?: string | string[] } })?.data?.message
  const readableError = Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg

  const valid = form.email.includes('@') && (editTarget ? true : form.password.length >= 6)

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Сотрудники</Typography>
        {isAdmin && (
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Добавить сотрудника</Button>
        )}
      </Box>

      <TableContainer component={Paper} elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Сотрудник</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Телефон</TableCell>
              <TableCell>Роль</TableCell>
              <TableCell>Дата регистрации</TableCell>
              {isAdmin && <TableCell align="right">Действия</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {users?.map((u) => (
              <TableRow key={u.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate({ to: `/employees/${u.id}` })}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar src={u.avatar} sx={{ width: 36, height: 36 }}>{u.firstName?.[0] || u.email[0].toUpperCase()}</Avatar>
                    <Typography variant="body2" fontWeight={500}>{u.firstName || u.username || u.email}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.phone || '-'}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {u.role?.map((r) => <Chip key={r} label={ROLE_LABELS[r] ?? r} size="small" variant="outlined" />)}
                  </Box>
                </TableCell>
                <TableCell>{format(new Date(u.createdAt), 'dd.MM.yyyy')}</TableCell>
                {isAdmin && (
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Редактировать">
                      <IconButton size="small" onClick={() => openEdit(u)}><Edit fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton size="small" color="error" disabled={u.id === currentUser?.id} onClick={() => setDeleteTarget(u)}><Delete fontSize="small" /></IconButton>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {(!users || users.length === 0) && (
              <TableRow><TableCell colSpan={isAdmin ? 6 : 5} align="center" sx={{ py: 4, color: 'text.secondary' }}>Нет сотрудников</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editTarget ? 'Редактировать сотрудника' : 'Новый сотрудник'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Email *" type="email" fullWidth value={form.email} onChange={(e) => set('email', e.target.value)} />
          {!editTarget && (
            <TextField label="Пароль *" type="password" fullWidth value={form.password} onChange={(e) => set('password', e.target.value)} helperText="Минимум 6 символов" />
          )}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField label="Имя" fullWidth value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
            <TextField label="Фамилия" fullWidth value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
          </Box>
          <TextField label="Имя пользователя" fullWidth value={form.username} onChange={(e) => set('username', e.target.value)} />
          <TextField label="Телефон" fullWidth value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          <FormControl fullWidth>
            <InputLabel>Роль</InputLabel>
            <Select
              multiple
              label="Роль"
              value={form.role}
              onChange={(e) => set('role', e.target.value as string[])}
              renderValue={(selected) => (selected as string[]).map((r) => ROLE_LABELS[r] ?? r).join(', ')}
            >
              {(['ADMIN', 'USER'] as const).map((r) => (
                <MenuItem key={r} value={r}>
                  <Checkbox checked={form.role.includes(r)} />
                  <ListItemText primary={ROLE_LABELS[r]} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {readableError && <Alert severity="error">{readableError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!valid || creating || updating}>
            {editTarget ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      <ActionModal
        open={!!deleteTarget}
        title="Удалить сотрудника"
        message={`Удалить сотрудника «${deleteTarget?.email}»? Это действие необратимо.`}
        onConfirm={async () => { if (deleteTarget) { await deleteUser(deleteTarget.id).unwrap(); setDeleteTarget(null) } }}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  )
}
