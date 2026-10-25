import { useState } from 'react'
import { Box, Typography, Button, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Tooltip, Divider, Alert } from '@mui/material'
import { Add, Edit, Delete, LocationOn, Videocam } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useObjectControllerFindAllQuery,
  useObjectControllerCreateMutation,
  useObjectControllerUpdateMutation,
  useObjectControllerRemoveMutation,
  type ObjectDto,
} from '../../api/generated'
import { ActionModal } from '../../components/ActionModal'
import { LocationPicker, type LatLng } from '../../components/LocationPicker'
import { CameraView, type CameraType } from '../../components/CameraView'

const DEMO_CAMERA_URL = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'

const objectSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  address: z.string().optional(),
  description: z.string().optional(),
  cameraUrl: z.string().optional(),
  cameraType: z.string().optional(),
})
type ObjectFormValues = z.infer<typeof objectSchema>

export function ObjectListPage() {
  const { data: objects } = useObjectControllerFindAllQuery()
  const [createObject] = useObjectControllerCreateMutation()
  const [updateObject] = useObjectControllerUpdateMutation()
  const [deleteObject] = useObjectControllerRemoveMutation()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ObjectDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ObjectDto | null>(null)
  const [location, setLocation] = useState<LatLng | null>(null)
  const [cameraTarget, setCameraTarget] = useState<ObjectDto | null>(null)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ObjectFormValues>({ resolver: zodResolver(objectSchema) })
  const openCreate = () => {
    setEditTarget(null)
    setLocation(null)
    reset({ name: '', address: '', description: '', cameraUrl: '', cameraType: '' })
    setDialogOpen(true)
  }
  const openEdit = (o: ObjectDto) => {
    setEditTarget(o)
    setLocation(o.latitude != null && o.longitude != null ? { lat: o.latitude, lng: o.longitude } : null)
    reset({ name: o.name, address: o.address || '', description: o.description || '', cameraUrl: o.cameraUrl || '', cameraType: o.cameraType || '' })
    setDialogOpen(true)
  }

  const onSubmit = async (data: ObjectFormValues) => {
    const payload = {
      name: data.name,
      address: data.address || undefined,
      description: data.description || undefined,
      latitude: location?.lat,
      longitude: location?.lng,
      cameraUrl: data.cameraUrl?.trim() || undefined,
      cameraType: (data.cameraType || undefined) as CameraType | undefined,
    }
    if (editTarget) { await updateObject({ id: editTarget.id, updateObjectDto: payload }).unwrap() }
    else { await createObject({ createObjectDto: payload }).unwrap() }
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
                  <Tooltip title={o.cameraUrl ? 'Смотреть камеру' : 'Камера не настроена'}>
                    <span>
                      <IconButton size="small" color={o.cameraUrl ? 'primary' : 'default'} disabled={!o.cameraUrl} onClick={() => setCameraTarget(o)}>
                        <Videocam fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
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

              <Grid size={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Видеонаблюдение (камера)</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 5 }}>
                    <TextField select label="Тип камеры" fullWidth {...register('cameraType')} SelectProps={{ native: true }}>
                      <option value="">— нет камеры —</option>
                      <option value="hls">HLS (.m3u8)</option>
                      <option value="mjpeg">MJPEG (HTTP-поток)</option>
                      <option value="snapshot">Снимок JPEG</option>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 7 }}>
                    <TextField label="URL потока" fullWidth placeholder="https://…/stream.m3u8 или http://IP:порт/video.mjpg" {...register('cameraUrl')} />
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Button size="small" onClick={() => { setValue('cameraType', 'hls'); setValue('cameraUrl', DEMO_CAMERA_URL) }}>
                    Вставить демо-камеру
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    RTSP-камеры браузер напрямую не играет — нужен мост (go2rtc/FFmpeg). HLS и MJPEG работают напрямую.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions><Button onClick={() => setDialogOpen(false)}>Отмена</Button><Button type="submit" variant="contained">Сохранить</Button></DialogActions>
        </form>
      </Dialog>

      <Dialog open={!!cameraTarget} onClose={() => setCameraTarget(null)} maxWidth="lg" fullWidth>
        <DialogTitle>Камера — {cameraTarget?.name}</DialogTitle>
        <DialogContent>
          {cameraTarget?.cameraUrl && cameraTarget.cameraType ? (
            <CameraView url={cameraTarget.cameraUrl} type={cameraTarget.cameraType} />
          ) : (
            <Alert severity="info">Камера не настроена. Укажите URL и тип потока при редактировании объекта.</Alert>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setCameraTarget(null)}>Закрыть</Button></DialogActions>
      </Dialog>

      <ActionModal open={!!deleteTarget} title="Удалить объект" message={`Удалить "${deleteTarget?.name}"?`} onConfirm={async () => { if (deleteTarget) { await deleteObject({ id: deleteTarget.id }).unwrap(); setDeleteTarget(null) } }} onCancel={() => setDeleteTarget(null)} />
    </Box>
  )
}
