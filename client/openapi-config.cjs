/** @type {import('@rtk-query/codegen-openapi').ConfigFile} */
module.exports = {
  schemaFile: '../openapi.json',
  apiFile: './src/api/emptyApi.ts',
  apiImport: 'emptySplitApi',
  outputFile: './src/api/generated.ts',
  exportName: 'generatedApi',
  hooks: true,
  tag: true,
  // Отгрузки и перемещения меняют остатки на складах и прайс-лист,
  // поэтому дополнительно инвалидируем тег "warehouses".
  endpointOverrides: [
    { pattern: 'shipmentControllerCreate', invalidatesTags: ['shipments', 'warehouses'] },
    { pattern: 'shipmentControllerUpdateStatus', invalidatesTags: ['shipments', 'warehouses'] },
    { pattern: 'shipmentControllerRemove', invalidatesTags: ['shipments', 'warehouses'] },
    { pattern: 'transferControllerCreate', invalidatesTags: ['transfers', 'warehouses'] },
  ],
}
