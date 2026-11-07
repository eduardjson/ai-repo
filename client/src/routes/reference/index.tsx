import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import {
  useCategoryControllerFindAllQuery,
  useCategoryControllerCreateMutation,
  useCategoryControllerUpdateMutation,
  useCategoryControllerRemoveMutation,
  useManufacturerControllerFindAllQuery,
  useManufacturerControllerCreateMutation,
  useManufacturerControllerUpdateMutation,
  useManufacturerControllerRemoveMutation,
  useUnitControllerFindAllQuery,
  useUnitControllerCreateMutation,
  useUnitControllerUpdateMutation,
  useUnitControllerRemoveMutation,
  type CategoryDto,
  type ManufacturerDto,
  type UnitDto,
} from '../../api/generated'
import { ActionModal } from '../../components/ActionModal'
import { useAppSelector } from '../../store/hooks'
import { flattenCategories } from '../../lib/catalog'

export function ReferencePage() {
  const [tab, setTab] = useState(0)
  const isAdmin = useAppSelector((s) => s.auth.user?.role?.includes('ADMIN') ?? false)

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Справочники
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Категории" />
        <Tab label="Производители" />
        <Tab label="Единицы измерения" />
      </Tabs>
      {tab === 0 && <CategoriesTab isAdmin={isAdmin} />}
      {tab === 1 && <ManufacturersTab isAdmin={isAdmin} />}
      {tab === 2 && <UnitsTab isAdmin={isAdmin} />}
    </Box>
  )
}

function CategoriesTab({ isAdmin }: { isAdmin: boolean }) {
  const { data: categories } = useCategoryControllerFindAllQuery()
  const [create] = useCategoryControllerCreateMutation()
  const [update] = useCategoryControllerUpdateMutation()
  const [remove] = useCategoryControllerRemoveMutation()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<CategoryDto | null>(null)

  const flat = flattenCategories(categories)

  const openCreate = () => {
    setEditId(null)
    setName('')
    setParentId('')
    setOpen(true)
  }
  const openEdit = (c: CategoryDto) => {
    setEditId(c.id)
    setName(c.name)
    setParentId(c.parentId ?? '')
    setOpen(true)
  }

  const save = async () => {
    if (!name.trim()) return
    if (editId)
      await update({
        id: editId,
        updateCategoryDto: { name: name.trim(), parentId: parentId || undefined },
      }).unwrap()
    else
      await create({
        createCategoryDto: { name: name.trim(), parentId: parentId || undefined },
      }).unwrap()
    setOpen(false)
  }

  return (
    <Box>
      {isAdmin && (
        <Button variant="contained" startIcon={<Add />} onClick={openCreate} sx={{ mb: 2 }}>
          Добавить категорию
        </Button>
      )}
      <TableContainer component={Paper} elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {flat.map((c) => {
              const cat = (categories ?? [])
                .flatMap((x) => [x, ...(x.children ?? [])])
                .find((x) => x.id === c.id)
              return (
                <TableRow key={c.id} hover>
                  <TableCell sx={{ pl: 1 + c.depth * 3 }}>{c.label}</TableCell>
                  <TableCell align="right">
                    {isAdmin && (
                      <>
                        <IconButton size="small" onClick={() => openEdit(cat!)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteTarget(cat!)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editId ? 'Редактировать категорию' : 'Новая категория'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Название" value={name} onChange={(e) => setName(e.target.value)} />
          <FormControl size="small" fullWidth>
            <InputLabel>Родительская категория</InputLabel>
            <Select
              value={parentId}
              label="Родительская категория"
              onChange={(e) => setParentId(e.target.value)}
            >
              <MenuItem value="">— корневая —</MenuItem>
              {flat.map((c) => (
                <MenuItem key={c.id} value={c.id} sx={{ pl: 1 + c.depth * 2 }}>
                  {c.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={save}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      <ActionModal
        open={!!deleteTarget}
        title="Удалить категорию"
        message={`Удалить категорию «${deleteTarget?.name}»?`}
        onConfirm={async () => {
          if (deleteTarget) {
            await remove({ id: deleteTarget.id }).unwrap()
            setDeleteTarget(null)
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  )
}

function ManufacturersTab({ isAdmin }: { isAdmin: boolean }) {
  const { data: manufacturers } = useManufacturerControllerFindAllQuery()
  const [create] = useManufacturerControllerCreateMutation()
  const [update] = useManufacturerControllerUpdateMutation()
  const [remove] = useManufacturerControllerRemoveMutation()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<ManufacturerDto | null>(null)

  const openCreate = () => {
    setEditId(null)
    setName('')
    setCountry('')
    setOpen(true)
  }
  const openEdit = (m: ManufacturerDto) => {
    setEditId(m.id)
    setName(m.name)
    setCountry(m.country ?? '')
    setOpen(true)
  }

  const save = async () => {
    if (!name.trim()) return
    if (editId)
      await update({
        id: editId,
        updateManufacturerDto: { name: name.trim(), country: country || undefined },
      }).unwrap()
    else
      await create({
        createManufacturerDto: { name: name.trim(), country: country || undefined },
      }).unwrap()
    setOpen(false)
  }

  return (
    <Box>
      {isAdmin && (
        <Button variant="contained" startIcon={<Add />} onClick={openCreate} sx={{ mb: 2 }}>
          Добавить производителя
        </Button>
      )}
      <TableContainer component={Paper} elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Страна</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {manufacturers?.map((m) => (
              <TableRow key={m.id} hover>
                <TableCell sx={{ fontWeight: 500 }}>{m.name}</TableCell>
                <TableCell>{m.country || '-'}</TableCell>
                <TableCell align="right">
                  {isAdmin && (
                    <>
                      <IconButton size="small" onClick={() => openEdit(m)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(m)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editId ? 'Редактировать производителя' : 'Новый производитель'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Название" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Страна" value={country} onChange={(e) => setCountry(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={save}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      <ActionModal
        open={!!deleteTarget}
        title="Удалить производителя"
        message={`Удалить «${deleteTarget?.name}»?`}
        onConfirm={async () => {
          if (deleteTarget) {
            await remove({ id: deleteTarget.id }).unwrap()
            setDeleteTarget(null)
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  )
}

function UnitsTab({ isAdmin }: { isAdmin: boolean }) {
  const { data: units } = useUnitControllerFindAllQuery()
  const [create] = useUnitControllerCreateMutation()
  const [update] = useUnitControllerUpdateMutation()
  const [remove] = useUnitControllerRemoveMutation()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<UnitDto | null>(null)

  const openCreate = () => {
    setEditId(null)
    setCode('')
    setName('')
    setSymbol('')
    setOpen(true)
  }
  const openEdit = (u: UnitDto) => {
    setEditId(u.id)
    setCode(u.code)
    setName(u.name)
    setSymbol(u.symbol)
    setOpen(true)
  }

  const save = async () => {
    if (!code.trim() || !name.trim() || !symbol.trim()) return
    if (editId)
      await update({
        id: editId,
        updateUnitDto: { code: code.trim(), name: name.trim(), symbol: symbol.trim() },
      }).unwrap()
    else
      await create({
        createUnitDto: { code: code.trim(), name: name.trim(), symbol: symbol.trim() },
      }).unwrap()
    setOpen(false)
  }

  return (
    <Box>
      {isAdmin && (
        <Button variant="contained" startIcon={<Add />} onClick={openCreate} sx={{ mb: 2 }}>
          Добавить единицу
        </Button>
      )}
      <TableContainer component={Paper} elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Код</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Обозначение</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {units?.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell sx={{ fontFamily: 'monospace' }}>{u.code}</TableCell>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.symbol}</TableCell>
                <TableCell align="right">
                  {isAdmin && (
                    <>
                      <IconButton size="small" onClick={() => openEdit(u)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(u)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editId ? 'Редактировать единицу' : 'Новая единица'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Код" value={code} onChange={(e) => setCode(e.target.value)} />
          <TextField label="Название" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField
            label="Обозначение"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={save}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      <ActionModal
        open={!!deleteTarget}
        title="Удалить единицу"
        message={`Удалить единицу «${deleteTarget?.symbol}»?`}
        onConfirm={async () => {
          if (deleteTarget) {
            await remove({ id: deleteTarget.id }).unwrap()
            setDeleteTarget(null)
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  )
}
