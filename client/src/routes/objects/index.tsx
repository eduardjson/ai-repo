import { useState } from 'react'
import { Box, Typography, Button, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Tooltip } from '@mui/material'
import { Add, Edit, Delete, LocationOn } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useGetObjectsQuery, useCreateObjectMutation, useUpdateObjectMutation, useDeleteObjectMutation } from '../../api/warehouseApi'
import { ActionModal } from '../../components/ActionModal'
import { LocationPicker, type LatLng } from '../../components/LocationPicker'
import type { ObjectDto } from '@shared/types'

const objectSchema = z.object({ name: z.string().min(1, 'Название обязательно'), address: z.string().optional(), description: z.string().optional() })
type ObjectFormValues = z.infer<typeof objectSchema>

export function ObjectListPage() {
  const { data: objects } = useGetObjectsQuery()
  const [createObject] = useCreateObjectMutation()
  const [updateObject] = useUpdateObjectMutation()
  const [deleteObject] = useDeleteObjectMutation()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ObjectDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ObjectDto | null>(null)
  const [location, setLocation] = useState<LatLng | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ObjectFormValues>({ resolver: zodResolver(objectSchema) })
  const openCreate = () => {
    setEditTarget(null)
    setLocation(null)
    reset({ name: '', address: '', description: '' })
    setDialogOpen(true)
  }
  const openEdit = (o: ObjectDto) => {
    setEditTarget(o)
    setLocation(o.latitude != null && o.longitude != null ? { lat: o.latitude, lng: o.longitude } : null)
    reset({ name: o.name, address: o.address || '', description: o.description || '' })
    setDialogOpen(true)
  }

  const onSubmit = async (data: ObjectFormValues) => {
    const payload = { ...data, latitude: location?.lat, longitude: location?.lng }
    if (editTarget) { await updateObject({ id: editTarget.id, data: payload }).unwrap() }
    else { await createObject(payload).unwrap() }
    setDialogOpen(false)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Объекты</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Добавить объект</Button>
      </Box>
      <TableContainer component={Paper} elevation={1}>
        <Table size="small">
          <TableHead><TableRow><TableCell>Название</TableCell><TableCell>Адрес</TableCell><TableCell>Описание</TableCell><TableCell align="right">Действия</TableCell></TableRow></TableHead>
          <TableBody>
            {objects?.map((o) => (
              <TableRow key={o.id} hover>
                <TableCell sx={{ fontWeight: 500 }}>
                  {o.name}
                  {o.latitude != null && o.longitude != null && (
                    <Tooltip title="Есть координаты на карте"><LocationOn fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle', color: 'primary.main' }} /></Tooltip>
                  )}
                </TableCell>
                <TableCell>{o.address || '-'}</TableCell>
                <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.description || '-'}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(o)}><Edit fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => setDeleteTarget(o)}><Delete fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {(!objects || objects.length === 0) && <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>Нет объектов</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{editTarget ? 'Редактировать объект' : 'Новый объект'}</DialogTitle>
          <DialogContent sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Название" fullWidth {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
                <TextField label="Адрес" fullWidth {...register('address')} />
                <TextField label="Описание" fullWidth multiline rows={3} {...register('description')} />
                {location && (
                  <Button size="small" color="inherit" onClick={() => setLocation(null)} sx={{ alignSelf: 'flex-start' }}>
                    Сбросить точку на карте
                  </Button>
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <LocationPicker value={location} onChange={setLocation} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions><Button onClick={() => setDialogOpen(false)}>Отмена</Button><Button type="submit" variant="contained">Сохранить</Button></DialogActions>
        </form>
      </Dialog>

      <ActionModal open={!!deleteTarget} title="Удалить объект" message={`Удалить "${deleteTarget?.name}"?`} onConfirm={async () => { if (deleteTarget) { await deleteObject(deleteTarget.id).unwrap(); setDeleteTarget(null) } }} onCancel={() => setDeleteTarget(null)} />
    </Box>
  )
}
