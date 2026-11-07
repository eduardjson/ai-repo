import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Switch,
  FormControlLabel,
  Chip,
  Stack,
} from '@mui/material'
import { ArrowBack, Add, Delete, CloudUpload } from '@mui/icons-material'
import {
  useProductControllerCreateMutation,
  useProductControllerUpdateMutation,
  useProductControllerRemoveImageMutation,
  useProductControllerFindOneQuery,
  useCategoryControllerFindAllQuery,
  useManufacturerControllerFindAllQuery,
  useUnitControllerFindAllQuery,
  type CreateProductDto,
} from '../../api/generated'
import { uploadFormData } from '../../api/upload'
import { flattenCategories, VAT_RATES, BARCODE_TYPES } from '../../lib/catalog'

const num = (v?: string) => (v === '' || v == null ? undefined : Number(v))

const productSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  sku: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  manufacturerId: z.string().optional(),
  baseUnitId: z.string().min(1, 'Выберите базовую единицу'),
  purchaseUnitId: z.string().optional(),
  purchaseToBase: z.string().optional(),
  saleUnitId: z.string().optional(),
  saleToBase: z.string().optional(),
  purchasePrice: z.string().optional(),
  estimatePrice: z.string().optional(),
  salePrice: z.string().optional(),
  vatRate: z.string().optional(),
  weightKg: z.string().optional(),
  lengthMm: z.string().optional(),
  widthMm: z.string().optional(),
  heightMm: z.string().optional(),
  volumeM3: z.string().optional(),
  grade: z.string().optional(),
  material: z.string().optional(),
  gost: z.string().optional(),
  country: z.string().optional(),
  minStock: z.string().optional(),
})
type ProductFormValues = z.infer<typeof productSchema>

interface BarcodeRow {
  value: string
  type: 'EAN13' | 'CODE128' | 'UPC' | 'QR'
}

const emptyDefaults: ProductFormValues = {
  title: '',
  sku: '',
  description: '',
  categoryId: '',
  manufacturerId: '',
  baseUnitId: '',
  purchaseUnitId: '',
  purchaseToBase: '',
  saleUnitId: '',
  saleToBase: '',
  purchasePrice: '',
  estimatePrice: '',
  salePrice: '',
  vatRate: 'VAT20',
  weightKg: '',
  lengthMm: '',
  widthMm: '',
  heightMm: '',
  volumeM3: '',
  grade: '',
  material: '',
  gost: '',
  country: '',
  minStock: '',
}

export function ProductAddPage() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/_private/products/add' })
  const editId = (search as { edit?: string })?.edit
  const isEdit = !!editId

  const { data: existing, isLoading: isLoadingProduct } = useProductControllerFindOneQuery(
    { id: editId! },
    { skip: !isEdit },
  )
  const { data: categories } = useCategoryControllerFindAllQuery()
  const { data: manufacturers } = useManufacturerControllerFindAllQuery()
  const { data: units } = useUnitControllerFindAllQuery()

  const [createProduct, { isLoading: isCreating }] = useProductControllerCreateMutation()
  const [updateProduct, { isLoading: isUpdating }] = useProductControllerUpdateMutation()
  const [removeImageMutation] = useProductControllerRemoveImageMutation()

  const [barcodes, setBarcodes] = useState<BarcodeRow[]>([])
  const [isActive, setIsActive] = useState(true)

  const fileRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [removeImage, setRemoveImage] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyDefaults,
  })

  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title,
        sku: existing.sku,
        description: existing.description ?? '',
        categoryId: existing.categoryId ?? '',
        manufacturerId: existing.manufacturerId ?? '',
        baseUnitId: existing.baseUnitId,
        purchaseUnitId: existing.purchaseUnitId ?? '',
        purchaseToBase: existing.purchaseToBase?.toString() ?? '',
        saleUnitId: existing.saleUnitId ?? '',
        saleToBase: existing.saleToBase?.toString() ?? '',
        purchasePrice: existing.purchasePrice?.toString() ?? '',
        estimatePrice: existing.estimatePrice?.toString() ?? '',
        salePrice: existing.salePrice?.toString() ?? '',
        vatRate: existing.vatRate ?? 'VAT20',
        weightKg: existing.weightKg?.toString() ?? '',
        lengthMm: existing.lengthMm?.toString() ?? '',
        widthMm: existing.widthMm?.toString() ?? '',
        heightMm: existing.heightMm?.toString() ?? '',
        volumeM3: existing.volumeM3?.toString() ?? '',
        grade: existing.grade ?? '',
        material: existing.material ?? '',
        gost: existing.gost ?? '',
        country: existing.country ?? '',
        minStock: existing.minStock?.toString() ?? '',
      })
      setBarcodes(
        (existing.barcodes ?? [])
          .slice()
          .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
          .map((b) => ({ value: b.value, type: b.type as BarcodeRow['type'] })),
      )
      setIsActive(existing.isActive)
      if (existing.imageType) {
        setPreviewUrl(`/api/products/${existing.id}/image`)
      } else if (existing.imageUrl) {
        setPreviewUrl(existing.imageUrl)
      }
    }
  }, [existing, reset])

  // Освобождаем objectURL при размонтировании.
  useEffect(() => {
    return () => {
      if (previewUrl && !previewUrl.startsWith('/api') && !previewUrl.startsWith('http')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setRemoveImage(false)
    if (previewUrl && !previewUrl.startsWith('/api') && !previewUrl.startsWith('http')) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setRemoveImage(true)
    if (previewUrl && !previewUrl.startsWith('/api') && !previewUrl.startsWith('http')) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
  }

  const catOptions = flattenCategories(categories)

  const onSubmit = async (data: ProductFormValues) => {
    const payload: CreateProductDto = {
      title: data.title,
      sku: data.sku?.trim() || undefined,
      description: data.description || undefined,
      categoryId: data.categoryId || undefined,
      manufacturerId: data.manufacturerId || undefined,
      baseUnitId: data.baseUnitId,
      purchaseUnitId: data.purchaseUnitId || undefined,
      purchaseToBase: num(data.purchaseToBase),
      saleUnitId: data.saleUnitId || undefined,
      saleToBase: num(data.saleToBase),
      purchasePrice: num(data.purchasePrice),
      estimatePrice: num(data.estimatePrice),
      salePrice: num(data.salePrice),
      vatRate: (data.vatRate || 'VAT20') as CreateProductDto['vatRate'],
      weightKg: num(data.weightKg),
      lengthMm: num(data.lengthMm),
      widthMm: num(data.widthMm),
      heightMm: num(data.heightMm),
      volumeM3: num(data.volumeM3),
      grade: data.grade || undefined,
      material: data.material || undefined,
      gost: data.gost || undefined,
      country: data.country || undefined,
      minStock: num(data.minStock),
      isActive,
      barcodes: barcodes
        .filter((b) => b.value.trim())
        .map((b, i) => ({ value: b.value.trim(), type: b.type, isPrimary: i === 0 })),
    }

    try {
      let productId: string
      if (isEdit) {
        const updated = await updateProduct({ id: editId!, updateProductDto: payload }).unwrap()
        productId = updated.id
      } else {
        const created = await createProduct({ createProductDto: payload }).unwrap()
        productId = created.id
      }

      if (selectedFile) {
        const formData = new FormData()
        formData.append('image', selectedFile)
        await uploadFormData(`/products/${productId}/image`, 'PUT', formData)
      } else if (isEdit && removeImage) {
        await removeImageMutation({ id: productId }).unwrap()
      }

      navigate({ to: isEdit ? `/products/${productId}` : '/products' })
    } catch {
      /* handled */
    }
  }

  if (isLoadingProduct)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )

  const field = (
    label: string,
    name: keyof ProductFormValues,
    opts: { span?: number; type?: string; full?: boolean } = {},
  ) => (
    <TextField
      label={label}
      type={opts.type ?? 'text'}
      fullWidth={opts.full !== false}
      size="small"
      {...register(name)}
      error={!!errors[name]}
      helperText={errors[name]?.message}
      sx={{ gridColumn: opts.span ? { md: `span ${opts.span}` } : undefined }}
    />
  )

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate({ to: isEdit ? `/products/${editId}` : '/products' })}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" fontWeight={700}>
          {isEdit ? 'Редактирование позиции' : 'Новая позиция'}
        </Typography>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Основное
            </Typography>
            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}
            >
              {field('Название *', 'title', { span: 2 })}
              {field('Артикул (SKU)', 'sku', {})}
              <FormControl size="small" fullWidth>
                <InputLabel>Базовая единица *</InputLabel>
                <Select
                  label="Базовая единица *"
                  defaultValue=""
                  error={!!errors.baseUnitId}
                  {...register('baseUnitId')}
                >
                  {units?.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.name} ({u.symbol})
                    </MenuItem>
                  ))}
                </Select>
                {errors.baseUnitId && (
                  <FormHelperText error>{errors.baseUnitId.message}</FormHelperText>
                )}
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>Категория</InputLabel>
                <Select label="Категория" defaultValue="" {...register('categoryId')}>
                  <MenuItem value="">—</MenuItem>
                  {catOptions.map((c) => (
                    <MenuItem key={c.id} value={c.id} sx={{ pl: 1 + c.depth * 2 }}>
                      {c.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>Производитель</InputLabel>
                <Select label="Производитель" defaultValue="" {...register('manufacturerId')}>
                  <MenuItem value="">—</MenuItem>
                  {manufacturers?.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ gridColumn: { md: 'span 2' } }}>
                <TextField
                  label="Описание"
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  {...register('description')}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Единицы измерения
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' },
                gap: 2,
              }}
            >
              <FormControl size="small" fullWidth>
                <InputLabel>Закупочная единица</InputLabel>
                <Select label="Закупочная единица" defaultValue="" {...register('purchaseUnitId')}>
                  <MenuItem value="">—</MenuItem>
                  {units?.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.symbol}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {field('Коэфф. закупки → база', 'purchaseToBase', {})}
              <FormControl size="small" fullWidth>
                <InputLabel>Единица продажи</InputLabel>
                <Select label="Единица продажи" defaultValue="" {...register('saleUnitId')}>
                  <MenuItem value="">—</MenuItem>
                  {units?.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.symbol}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {field('Коэфф. продажи → база', 'saleToBase', {})}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Коэффициент — сколько базовых единиц в одной закупочной/продажной. Пример: арматура
              хранится в кг, закупается в тоннах → 1 т = 1000 кг.
            </Typography>
          </CardContent>
        </Card>

        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Цены и НДС
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' },
                gap: 2,
              }}
            >
              {field('Цена закупки', 'purchasePrice', {})}
              {field('Сметная цена', 'estimatePrice', {})}
              {field('Цена продажи', 'salePrice', {})}
              <FormControl size="small" fullWidth>
                <InputLabel>НДС</InputLabel>
                <Select label="НДС" defaultValue="VAT20" {...register('vatRate')}>
                  {VAT_RATES.map((r) => (
                    <MenuItem key={r.value} value={r.value}>
                      {r.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Цены задаются за базовую единицу измерения.
            </Typography>
          </CardContent>
        </Card>

        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Характеристики
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' },
                gap: 2,
              }}
            >
              {field('Вес, кг', 'weightKg', {})}
              {field('Длина, мм', 'lengthMm', {})}
              {field('Ширина, мм', 'widthMm', {})}
              {field('Высота/толщина, мм', 'heightMm', {})}
              {field('Объём, м³', 'volumeM3', {})}
              {field('Сорт', 'grade', {})}
              {field('Материал', 'material', {})}
              {field('ГОСТ/ТУ', 'gost', {})}
              {field('Страна', 'country', {})}
            </Box>
          </CardContent>
        </Card>

        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Изображение
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <Box
                sx={{
                  width: 160,
                  height: 160,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  overflow: 'hidden',
                  bgcolor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {previewUrl ? (
                  <Box
                    component="img"
                    src={previewUrl}
                    alt="Превью"
                    sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    Нет изображения
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  onClick={() => fileRef.current?.click()}
                >
                  {previewUrl ? 'Заменить изображение' : 'Загрузить изображение'}
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  hidden
                  onChange={handleFileChange}
                />
                {selectedFile && (
                  <Typography variant="body2" color="text.secondary">
                    {selectedFile.name}
                  </Typography>
                )}
                {isEdit && previewUrl && !selectedFile && (
                  <Button size="small" color="error" onClick={handleRemoveImage}>
                    Удалить изображение
                  </Button>
                )}
                <Typography variant="caption" color="text.secondary">
                  JPEG, PNG, WebP или GIF, до 5 МБ
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Управление запасами
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' },
                gap: 2,
              }}
            >
              {field('Минимальный остаток', 'minStock', {})}
              <FormControlLabel
                control={
                  <Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                }
                label={isActive ? 'Активна' : 'В архиве'}
              />
            </Box>
          </CardContent>
        </Card>

        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="h6">Штрихкоды</Typography>
              <Button
                size="small"
                startIcon={<Add />}
                onClick={() => setBarcodes((b) => [...b, { value: '', type: 'EAN13' }])}
              >
                Добавить штрихкод
              </Button>
            </Box>
            {barcodes.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Штрихкоды не заданы — основной EAN-13 будет сгенерирован автоматически.
              </Typography>
            )}
            <Stack gap={1}>
              {barcodes.map((b, i) => (
                <Stack key={i} direction="row" gap={1} alignItems="center">
                  {i === 0 && (
                    <Chip label="основной" size="small" color="primary" variant="outlined" />
                  )}
                  <TextField
                    size="small"
                    placeholder={i === 0 ? 'EAN-13 (авто, если пусто)' : 'Штрихкод'}
                    value={b.value}
                    onChange={(e) =>
                      setBarcodes((arr) =>
                        arr.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)),
                      )
                    }
                    sx={{ fontFamily: 'monospace', flex: 1 }}
                  />
                  <Select
                    size="small"
                    value={b.type}
                    onChange={(e) =>
                      setBarcodes((arr) =>
                        arr.map((x, j) =>
                          j === i ? { ...x, type: e.target.value as BarcodeRow['type'] } : x,
                        ),
                      )
                    }
                    sx={{ minWidth: 130 }}
                  >
                    {BARCODE_TYPES.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </Select>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setBarcodes((arr) => arr.filter((_, j) => j !== i))}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Button type="submit" variant="contained" size="large" loading={isCreating || isUpdating}>
            {isEdit ? 'Сохранить' : 'Создать'}
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate({ to: isEdit ? `/products/${editId}` : '/products' })}
          >
            Отмена
          </Button>
        </Box>
      </form>
    </Box>
  )
}
