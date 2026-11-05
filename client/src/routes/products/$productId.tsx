import { useParams, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Box, Typography, Card, CardContent, Grid, Button, Divider, IconButton,
  CircularProgress, Chip, Stack,
} from '@mui/material'
import { Edit, ArrowBack, Delete } from '@mui/icons-material'
import { useProductControllerFindOneQuery, useProductControllerRemoveMutation } from '../../api/generated'
import { ActionModal } from '../../components/ActionModal'
import { VAT_LABELS, formatMoney } from '../../lib/catalog'

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <Grid size={{ xs: 6, md: 3 }}>
      <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
      <Typography>{value != null && value !== '' ? value : '-'}</Typography>
    </Grid>
  )
}

export function ProductDetailPage() {
  const params = useParams({ from: '/_private/products/$productId' })
  const productId = params.productId
  const navigate = useNavigate()
  const { data: product, isLoading } = useProductControllerFindOneQuery({ id: productId })
  const [removeProduct] = useProductControllerRemoveMutation()
  const [showArchive, setShowArchive] = useState(false)

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
  if (!product) return <Typography>Позиция не найдена</Typography>

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <IconButton onClick={() => navigate({ to: '/products' })}><ArrowBack /></IconButton>
        <Box>
          <Typography variant="h4" fontWeight={700}>{product.title}</Typography>
          <Typography variant="body2" color="text.secondary">Артикул: {product.sku}</Typography>
        </Box>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Edit />} onClick={() => navigate({ to: '/products/add', search: { edit: product.id } })}>
            Редактировать
          </Button>
          {product.isActive && (
            <Button variant="outlined" color="error" startIcon={<Delete />} onClick={() => setShowArchive(true)}>
              В архив
            </Button>
          )}
        </Box>
      </Box>

      {(product.imageType || product.imageUrl) && (
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
            <Box
              component="img"
              src={product.imageType ? `/api/products/${product.id}/image` : product.imageUrl!}
              alt={product.title}
              sx={{ maxWidth: '100%', maxHeight: 360, objectFit: 'contain', borderRadius: 1, bgcolor: 'grey.100' }}
            />
          </CardContent>
        </Card>
      )}

      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Штрихкоды</Typography>
          <Stack direction="row" gap={1} flexWrap="wrap">
            {product.barcodes?.length ? product.barcodes.map((b) => (
              <Chip
                key={b.id}
                label={`${b.value} (${b.type})`}
                color={b.isPrimary ? 'primary' : 'default'}
                variant={b.isPrimary ? 'filled' : 'outlined'}
                size="small"
                sx={{ fontFamily: 'monospace' }}
              />
            )) : <Typography variant="body2" color="text.secondary">—</Typography>}
          </Stack>
          {product.description && <><Divider sx={{ my: 2 }} /><Typography variant="body1">{product.description}</Typography></>}
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Классификация и единицы</Typography>
              <Grid container spacing={2}>
                <Field label="Категория" value={product.category?.name} />
                <Field label="Производитель" value={product.manufacturer?.name} />
                <Field label="Страна" value={product.country} />
                <Field label="Базовая единица" value={product.baseUnit?.symbol} />
                <Field label="Закупочная единица" value={product.purchaseUnit ? `${product.purchaseUnit.symbol} (1 = ${product.purchaseToBase} ${product.baseUnit?.symbol})` : undefined} />
                <Field label="Единица продажи" value={product.saleUnit ? `${product.saleUnit.symbol} (1 = ${product.saleToBase} ${product.baseUnit?.symbol})` : undefined} />
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Цены</Typography>
              <Grid container spacing={2}>
                <Field label="Закупочная" value={formatMoney(product.purchasePrice)} />
                <Field label="Сметная" value={formatMoney(product.estimatePrice)} />
                <Field label="Продажная" value={formatMoney(product.salePrice)} />
                <Field label="НДС" value={VAT_LABELS[product.vatRate]} />
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Характеристики</Typography>
              <Grid container spacing={2}>
                <Field label="Вес, кг" value={product.weightKg} />
                <Field label="Длина, мм" value={product.lengthMm} />
                <Field label="Ширина, мм" value={product.widthMm} />
                <Field label="Высота, мм" value={product.heightMm} />
                <Field label="Объём, м³" value={product.volumeM3} />
                <Field label="Сорт" value={product.grade} />
                <Field label="Материал" value={product.material} />
                <Field label="ГОСТ/ТУ" value={product.gost} />
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Запасы</Typography>
              <Grid container spacing={2}>
                <Field label="Мин. остаток" value={product.minStock} />
                <Field label="Статус" value={product.isActive ? 'Активна' : 'В архиве'} />
                <Field label="Создана" value={new Date(product.createdAt).toLocaleDateString('ru-RU')} />
                <Field label="Обновлена" value={new Date(product.updatedAt).toLocaleDateString('ru-RU')} />
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ActionModal
        open={showArchive}
        title="Архивировать позицию"
        message={`Позиция «${product.title}» будет перемещена в архив (останется в истории документов).`}
        confirmLabel="Архивировать"
        onConfirm={async () => { await removeProduct({ id: productId }).unwrap(); navigate({ to: '/products' }) }}
        onCancel={() => setShowArchive(false)}
      />
    </Box>
  )
}
