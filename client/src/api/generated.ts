import { emptySplitApi as api } from "./emptyApi";
export const addTagTypes = [
  "auth",
  "user",
  "categories",
  "manufacturers",
  "units",
  "products",
  "warehouses",
  "objects",
  "shipments",
  "receipts",
  "chat",
  "projects",
  "transfers",
] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      authControllerLogin: build.mutation<
        AuthControllerLoginApiResponse,
        AuthControllerLoginApiArg
      >({
        query: (queryArg) => ({
          url: `/auth/login`,
          method: "POST",
          body: queryArg.loginDto,
        }),
        invalidatesTags: ["auth"],
      }),
      authControllerLogout: build.mutation<
        AuthControllerLogoutApiResponse,
        AuthControllerLogoutApiArg
      >({
        query: () => ({ url: `/auth/logout`, method: "POST" }),
        invalidatesTags: ["auth"],
      }),
      authControllerRefreshTokens: build.mutation<
        AuthControllerRefreshTokensApiResponse,
        AuthControllerRefreshTokensApiArg
      >({
        query: () => ({ url: `/auth/refresh-tokens`, method: "POST" }),
        invalidatesTags: ["auth"],
      }),
      userControllerFindAll: build.query<
        UserControllerFindAllApiResponse,
        UserControllerFindAllApiArg
      >({
        query: () => ({ url: `/user/all-users` }),
        providesTags: ["user"],
      }),
      userControllerGetMe: build.query<
        UserControllerGetMeApiResponse,
        UserControllerGetMeApiArg
      >({
        query: () => ({ url: `/user/me` }),
        providesTags: ["user"],
      }),
      userControllerFindOne: build.query<
        UserControllerFindOneApiResponse,
        UserControllerFindOneApiArg
      >({
        query: (queryArg) => ({ url: `/user/${queryArg.id}` }),
        providesTags: ["user"],
      }),
      userControllerUpdate: build.mutation<
        UserControllerUpdateApiResponse,
        UserControllerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/user/${queryArg.id}`,
          method: "PATCH",
          body: queryArg.updateUserDto,
        }),
        invalidatesTags: ["user"],
      }),
      userControllerRemove: build.mutation<
        UserControllerRemoveApiResponse,
        UserControllerRemoveApiArg
      >({
        query: (queryArg) => ({
          url: `/user/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["user"],
      }),
      userControllerCreate: build.mutation<
        UserControllerCreateApiResponse,
        UserControllerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/user`,
          method: "POST",
          body: queryArg.createUserDto,
        }),
        invalidatesTags: ["user"],
      }),
      categoryControllerFindAll: build.query<
        CategoryControllerFindAllApiResponse,
        CategoryControllerFindAllApiArg
      >({
        query: () => ({ url: `/categories` }),
        providesTags: ["categories"],
      }),
      categoryControllerCreate: build.mutation<
        CategoryControllerCreateApiResponse,
        CategoryControllerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/categories`,
          method: "POST",
          body: queryArg.createCategoryDto,
        }),
        invalidatesTags: ["categories"],
      }),
      categoryControllerFindOne: build.query<
        CategoryControllerFindOneApiResponse,
        CategoryControllerFindOneApiArg
      >({
        query: (queryArg) => ({ url: `/categories/${queryArg.id}` }),
        providesTags: ["categories"],
      }),
      categoryControllerUpdate: build.mutation<
        CategoryControllerUpdateApiResponse,
        CategoryControllerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/categories/${queryArg.id}`,
          method: "PATCH",
          body: queryArg.updateCategoryDto,
        }),
        invalidatesTags: ["categories"],
      }),
      categoryControllerRemove: build.mutation<
        CategoryControllerRemoveApiResponse,
        CategoryControllerRemoveApiArg
      >({
        query: (queryArg) => ({
          url: `/categories/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["categories"],
      }),
      manufacturerControllerFindAll: build.query<
        ManufacturerControllerFindAllApiResponse,
        ManufacturerControllerFindAllApiArg
      >({
        query: () => ({ url: `/manufacturers` }),
        providesTags: ["manufacturers"],
      }),
      manufacturerControllerCreate: build.mutation<
        ManufacturerControllerCreateApiResponse,
        ManufacturerControllerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/manufacturers`,
          method: "POST",
          body: queryArg.createManufacturerDto,
        }),
        invalidatesTags: ["manufacturers"],
      }),
      manufacturerControllerFindOne: build.query<
        ManufacturerControllerFindOneApiResponse,
        ManufacturerControllerFindOneApiArg
      >({
        query: (queryArg) => ({ url: `/manufacturers/${queryArg.id}` }),
        providesTags: ["manufacturers"],
      }),
      manufacturerControllerUpdate: build.mutation<
        ManufacturerControllerUpdateApiResponse,
        ManufacturerControllerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/manufacturers/${queryArg.id}`,
          method: "PATCH",
          body: queryArg.updateManufacturerDto,
        }),
        invalidatesTags: ["manufacturers"],
      }),
      manufacturerControllerRemove: build.mutation<
        ManufacturerControllerRemoveApiResponse,
        ManufacturerControllerRemoveApiArg
      >({
        query: (queryArg) => ({
          url: `/manufacturers/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["manufacturers"],
      }),
      unitControllerFindAll: build.query<
        UnitControllerFindAllApiResponse,
        UnitControllerFindAllApiArg
      >({
        query: () => ({ url: `/units` }),
        providesTags: ["units"],
      }),
      unitControllerCreate: build.mutation<
        UnitControllerCreateApiResponse,
        UnitControllerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/units`,
          method: "POST",
          body: queryArg.createUnitDto,
        }),
        invalidatesTags: ["units"],
      }),
      unitControllerFindOne: build.query<
        UnitControllerFindOneApiResponse,
        UnitControllerFindOneApiArg
      >({
        query: (queryArg) => ({ url: `/units/${queryArg.id}` }),
        providesTags: ["units"],
      }),
      unitControllerUpdate: build.mutation<
        UnitControllerUpdateApiResponse,
        UnitControllerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/units/${queryArg.id}`,
          method: "PATCH",
          body: queryArg.updateUnitDto,
        }),
        invalidatesTags: ["units"],
      }),
      unitControllerRemove: build.mutation<
        UnitControllerRemoveApiResponse,
        UnitControllerRemoveApiArg
      >({
        query: (queryArg) => ({
          url: `/units/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["units"],
      }),
      productControllerFindAll: build.query<
        ProductControllerFindAllApiResponse,
        ProductControllerFindAllApiArg
      >({
        query: (queryArg) => ({
          url: `/products`,
          params: {
            page: queryArg.page,
            size: queryArg.size,
            search: queryArg.search,
            categoryId: queryArg.categoryId,
            manufacturerId: queryArg.manufacturerId,
            includeInactive: queryArg.includeInactive,
          },
        }),
        providesTags: ["products"],
      }),
      productControllerCreate: build.mutation<
        ProductControllerCreateApiResponse,
        ProductControllerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/products`,
          method: "POST",
          body: queryArg.createProductDto,
        }),
        invalidatesTags: ["products"],
      }),
      productControllerFindByBarcode: build.query<
        ProductControllerFindByBarcodeApiResponse,
        ProductControllerFindByBarcodeApiArg
      >({
        query: (queryArg) => ({ url: `/products/barcode/${queryArg.value}` }),
        providesTags: ["products"],
      }),
      productControllerGetImage: build.query<
        ProductControllerGetImageApiResponse,
        ProductControllerGetImageApiArg
      >({
        query: (queryArg) => ({ url: `/products/${queryArg.id}/image` }),
        providesTags: ["products"],
      }),
      productControllerGetImages: build.query<
        ProductControllerGetImagesApiResponse,
        ProductControllerGetImagesApiArg
      >({
        query: (queryArg) => ({ url: `/products/${queryArg.id}/images` }),
        providesTags: ["products"],
      }),
      productControllerUploadImages: build.mutation<
        ProductControllerUploadImagesApiResponse,
        ProductControllerUploadImagesApiArg
      >({
        query: (queryArg) => ({
          url: `/products/${queryArg.id}/images`,
          method: "POST",
        }),
        invalidatesTags: ["products"],
      }),
      productControllerFindOne: build.query<
        ProductControllerFindOneApiResponse,
        ProductControllerFindOneApiArg
      >({
        query: (queryArg) => ({ url: `/products/${queryArg.id}` }),
        providesTags: ["products"],
      }),
      productControllerUpdate: build.mutation<
        ProductControllerUpdateApiResponse,
        ProductControllerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/products/${queryArg.id}`,
          method: "PATCH",
          body: queryArg.updateProductDto,
        }),
        invalidatesTags: ["products"],
      }),
      productControllerRemove: build.mutation<
        ProductControllerRemoveApiResponse,
        ProductControllerRemoveApiArg
      >({
        query: (queryArg) => ({
          url: `/products/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["products"],
      }),
      warehouseControllerGetGlobalPriceList: build.query<
        WarehouseControllerGetGlobalPriceListApiResponse,
        WarehouseControllerGetGlobalPriceListApiArg
      >({
        query: () => ({ url: `/warehouses/price-lists/all` }),
        providesTags: ["warehouses"],
      }),
      warehouseControllerFindAll: build.query<
        WarehouseControllerFindAllApiResponse,
        WarehouseControllerFindAllApiArg
      >({
        query: () => ({ url: `/warehouses` }),
        providesTags: ["warehouses"],
      }),
      warehouseControllerCreate: build.mutation<
        WarehouseControllerCreateApiResponse,
        WarehouseControllerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/warehouses`,
          method: "POST",
          body: queryArg.createWarehouseDto,
        }),
        invalidatesTags: ["warehouses"],
      }),
      warehouseControllerFindOne: build.query<
        WarehouseControllerFindOneApiResponse,
        WarehouseControllerFindOneApiArg
      >({
        query: (queryArg) => ({ url: `/warehouses/${queryArg.id}` }),
        providesTags: ["warehouses"],
      }),
      warehouseControllerUpdate: build.mutation<
        WarehouseControllerUpdateApiResponse,
        WarehouseControllerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/warehouses/${queryArg.id}`,
          method: "PATCH",
          body: queryArg.updateWarehouseDto,
        }),
        invalidatesTags: ["warehouses"],
      }),
      warehouseControllerRemove: build.mutation<
        WarehouseControllerRemoveApiResponse,
        WarehouseControllerRemoveApiArg
      >({
        query: (queryArg) => ({
          url: `/warehouses/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["warehouses"],
      }),
      warehouseControllerAddStock: build.mutation<
        WarehouseControllerAddStockApiResponse,
        WarehouseControllerAddStockApiArg
      >({
        query: (queryArg) => ({
          url: `/warehouses/${queryArg.id}/stock`,
          method: "POST",
          body: queryArg.addStockDto,
        }),
        invalidatesTags: ["warehouses"],
      }),
      warehouseControllerGetStock: build.query<
        WarehouseControllerGetStockApiResponse,
        WarehouseControllerGetStockApiArg
      >({
        query: (queryArg) => ({ url: `/warehouses/${queryArg.id}/stock` }),
        providesTags: ["warehouses"],
      }),
      warehouseControllerUpdateStock: build.mutation<
        WarehouseControllerUpdateStockApiResponse,
        WarehouseControllerUpdateStockApiArg
      >({
        query: (queryArg) => ({
          url: `/warehouses/${queryArg.id}/stock/${queryArg.stockId}`,
          method: "PATCH",
          body: queryArg.updateStockDto,
        }),
        invalidatesTags: ["warehouses"],
      }),
      warehouseControllerGetWarehousePriceList: build.query<
        WarehouseControllerGetWarehousePriceListApiResponse,
        WarehouseControllerGetWarehousePriceListApiArg
      >({
        query: (queryArg) => ({ url: `/warehouses/${queryArg.id}/price-list` }),
        providesTags: ["warehouses"],
      }),
      objectControllerFindAll: build.query<
        ObjectControllerFindAllApiResponse,
        ObjectControllerFindAllApiArg
      >({
        query: () => ({ url: `/objects` }),
        providesTags: ["objects"],
      }),
      objectControllerCreate: build.mutation<
        ObjectControllerCreateApiResponse,
        ObjectControllerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/objects`,
          method: "POST",
          body: queryArg.createObjectDto,
        }),
        invalidatesTags: ["objects"],
      }),
      objectControllerFindOne: build.query<
        ObjectControllerFindOneApiResponse,
        ObjectControllerFindOneApiArg
      >({
        query: (queryArg) => ({ url: `/objects/${queryArg.id}` }),
        providesTags: ["objects"],
      }),
      objectControllerUpdate: build.mutation<
        ObjectControllerUpdateApiResponse,
        ObjectControllerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/objects/${queryArg.id}`,
          method: "PATCH",
          body: queryArg.updateObjectDto,
        }),
        invalidatesTags: ["objects"],
      }),
      objectControllerRemove: build.mutation<
        ObjectControllerRemoveApiResponse,
        ObjectControllerRemoveApiArg
      >({
        query: (queryArg) => ({
          url: `/objects/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["objects"],
      }),
      shipmentControllerFindByObject: build.query<
        ShipmentControllerFindByObjectApiResponse,
        ShipmentControllerFindByObjectApiArg
      >({
        query: (queryArg) => ({
          url: `/shipments/by-object/${queryArg.objectId}`,
        }),
        providesTags: ["shipments"],
      }),
      shipmentControllerFindByWarehouse: build.query<
        ShipmentControllerFindByWarehouseApiResponse,
        ShipmentControllerFindByWarehouseApiArg
      >({
        query: (queryArg) => ({
          url: `/shipments/by-warehouse/${queryArg.warehouseId}`,
        }),
        providesTags: ["shipments"],
      }),
      shipmentControllerFindAll: build.query<
        ShipmentControllerFindAllApiResponse,
        ShipmentControllerFindAllApiArg
      >({
        query: (queryArg) => ({
          url: `/shipments`,
          params: {
            objectId: queryArg.objectId,
            warehouseId: queryArg.warehouseId,
            status: queryArg.status,
          },
        }),
        providesTags: ["shipments"],
      }),
      shipmentControllerCreate: build.mutation<
        ShipmentControllerCreateApiResponse,
        ShipmentControllerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/shipments`,
          method: "POST",
          body: queryArg.createShipmentDto,
        }),
        invalidatesTags: ["shipments", "warehouses"],
      }),
      shipmentControllerFindOne: build.query<
        ShipmentControllerFindOneApiResponse,
        ShipmentControllerFindOneApiArg
      >({
        query: (queryArg) => ({ url: `/shipments/${queryArg.id}` }),
        providesTags: ["shipments"],
      }),
      shipmentControllerRemove: build.mutation<
        ShipmentControllerRemoveApiResponse,
        ShipmentControllerRemoveApiArg
      >({
        query: (queryArg) => ({
          url: `/shipments/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["shipments", "warehouses"],
      }),
      shipmentControllerUpdateStatus: build.mutation<
        ShipmentControllerUpdateStatusApiResponse,
        ShipmentControllerUpdateStatusApiArg
      >({
        query: (queryArg) => ({
          url: `/shipments/${queryArg.id}/status`,
          method: "PATCH",
          body: queryArg.updateStatusDto,
        }),
        invalidatesTags: ["shipments", "warehouses"],
      }),
      receiptControllerFindAll: build.query<
        ReceiptControllerFindAllApiResponse,
        ReceiptControllerFindAllApiArg
      >({
        query: (queryArg) => ({
          url: `/receipts`,
          params: {
            status: queryArg.status,
          },
        }),
        providesTags: ["receipts"],
      }),
      receiptControllerCreate: build.mutation<
        ReceiptControllerCreateApiResponse,
        ReceiptControllerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/receipts`,
          method: "POST",
          body: queryArg.createReceiptDto,
        }),
        invalidatesTags: ["receipts"],
      }),
      receiptControllerFindOne: build.query<
        ReceiptControllerFindOneApiResponse,
        ReceiptControllerFindOneApiArg
      >({
        query: (queryArg) => ({ url: `/receipts/${queryArg.id}` }),
        providesTags: ["receipts"],
      }),
      receiptControllerUpdate: build.mutation<
        ReceiptControllerUpdateApiResponse,
        ReceiptControllerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/receipts/${queryArg.id}`,
          method: "PATCH",
          body: queryArg.updateReceiptDto,
        }),
        invalidatesTags: ["receipts"],
      }),
      receiptControllerRemove: build.mutation<
        ReceiptControllerRemoveApiResponse,
        ReceiptControllerRemoveApiArg
      >({
        query: (queryArg) => ({
          url: `/receipts/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["receipts"],
      }),
      receiptControllerAddItem: build.mutation<
        ReceiptControllerAddItemApiResponse,
        ReceiptControllerAddItemApiArg
      >({
        query: (queryArg) => ({
          url: `/receipts/${queryArg.id}/items`,
          method: "POST",
          body: queryArg.addReceiptItemDto,
        }),
        invalidatesTags: ["receipts"],
      }),
      receiptControllerUpdateItem: build.mutation<
        ReceiptControllerUpdateItemApiResponse,
        ReceiptControllerUpdateItemApiArg
      >({
        query: (queryArg) => ({
          url: `/receipts/${queryArg.id}/items/${queryArg.itemId}`,
          method: "PATCH",
          body: queryArg.updateReceiptItemDto,
        }),
        invalidatesTags: ["receipts"],
      }),
      receiptControllerRemoveItem: build.mutation<
        ReceiptControllerRemoveItemApiResponse,
        ReceiptControllerRemoveItemApiArg
      >({
        query: (queryArg) => ({
          url: `/receipts/${queryArg.id}/items/${queryArg.itemId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["receipts"],
      }),
      receiptControllerPost: build.mutation<
        ReceiptControllerPostApiResponse,
        ReceiptControllerPostApiArg
      >({
        query: (queryArg) => ({
          url: `/receipts/${queryArg.id}/post`,
          method: "POST",
        }),
        invalidatesTags: ["receipts", "warehouses"],
      }),
      receiptControllerCancel: build.mutation<
        ReceiptControllerCancelApiResponse,
        ReceiptControllerCancelApiArg
      >({
        query: (queryArg) => ({
          url: `/receipts/${queryArg.id}/cancel`,
          method: "POST",
        }),
        invalidatesTags: ["receipts", "warehouses"],
      }),
      chatControllerFindAll: build.query<
        ChatControllerFindAllApiResponse,
        ChatControllerFindAllApiArg
      >({
        query: (queryArg) => ({
          url: `/chat/messages`,
          params: {
            limit: queryArg.limit,
          },
        }),
        providesTags: ["chat"],
      }),
      chatControllerCreate: build.mutation<
        ChatControllerCreateApiResponse,
        ChatControllerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/chat/messages`,
          method: "POST",
          body: queryArg.createMessageDto,
        }),
        invalidatesTags: ["chat"],
      }),
      chatControllerUpdate: build.mutation<
        ChatControllerUpdateApiResponse,
        ChatControllerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/chat/messages/${queryArg.id}`,
          method: "PUT",
          body: queryArg.messageTextDto,
        }),
        invalidatesTags: ["chat"],
      }),
      chatControllerRemove: build.mutation<
        ChatControllerRemoveApiResponse,
        ChatControllerRemoveApiArg
      >({
        query: (queryArg) => ({
          url: `/chat/messages/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["chat"],
      }),
      chatControllerDownload: build.query<
        ChatControllerDownloadApiResponse,
        ChatControllerDownloadApiArg
      >({
        query: (queryArg) => ({
          url: `/chat/messages/${queryArg.messageId}/attachments/${queryArg.attachmentId}`,
        }),
        providesTags: ["chat"],
      }),
      projectControllerFindAll: build.query<
        ProjectControllerFindAllApiResponse,
        ProjectControllerFindAllApiArg
      >({
        query: () => ({ url: `/projects` }),
        providesTags: ["projects"],
      }),
      projectControllerCreate: build.mutation<
        ProjectControllerCreateApiResponse,
        ProjectControllerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/projects`,
          method: "POST",
          body: queryArg.createProjectDto,
        }),
        invalidatesTags: ["projects"],
      }),
      projectControllerFindOne: build.query<
        ProjectControllerFindOneApiResponse,
        ProjectControllerFindOneApiArg
      >({
        query: (queryArg) => ({ url: `/projects/${queryArg.id}` }),
        providesTags: ["projects"],
      }),
      projectControllerUpdate: build.mutation<
        ProjectControllerUpdateApiResponse,
        ProjectControllerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/projects/${queryArg.id}`,
          method: "PUT",
          body: queryArg.updateProjectDto,
        }),
        invalidatesTags: ["projects"],
      }),
      projectControllerRemove: build.mutation<
        ProjectControllerRemoveApiResponse,
        ProjectControllerRemoveApiArg
      >({
        query: (queryArg) => ({
          url: `/projects/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["projects"],
      }),
      transferControllerFindAll: build.query<
        TransferControllerFindAllApiResponse,
        TransferControllerFindAllApiArg
      >({
        query: () => ({ url: `/transfers` }),
        providesTags: ["transfers"],
      }),
      transferControllerCreate: build.mutation<
        TransferControllerCreateApiResponse,
        TransferControllerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/transfers`,
          method: "POST",
          body: queryArg.createTransferDto,
        }),
        invalidatesTags: ["transfers", "warehouses"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as generatedApi };
export type AuthControllerLoginApiResponse = /** status 200  */ AuthResponseDto;
export type AuthControllerLoginApiArg = {
  loginDto: LoginDto;
};
export type AuthControllerLogoutApiResponse = unknown;
export type AuthControllerLogoutApiArg = void;
export type AuthControllerRefreshTokensApiResponse =
  /** status 200  */ AuthResponseDto;
export type AuthControllerRefreshTokensApiArg = void;
export type UserControllerFindAllApiResponse = /** status 200  */ UserDto[];
export type UserControllerFindAllApiArg = void;
export type UserControllerGetMeApiResponse = /** status 200  */ UserDto;
export type UserControllerGetMeApiArg = void;
export type UserControllerFindOneApiResponse = /** status 200  */ UserDto;
export type UserControllerFindOneApiArg = {
  id: string;
};
export type UserControllerUpdateApiResponse = /** status 200  */ UserDto;
export type UserControllerUpdateApiArg = {
  id: string;
  updateUserDto: UpdateUserDto;
};
export type UserControllerRemoveApiResponse = unknown;
export type UserControllerRemoveApiArg = {
  id: string;
};
export type UserControllerCreateApiResponse = /** status 201  */ UserDto;
export type UserControllerCreateApiArg = {
  createUserDto: CreateUserDto;
};
export type CategoryControllerFindAllApiResponse =
  /** status 200  */ CategoryDto[];
export type CategoryControllerFindAllApiArg = void;
export type CategoryControllerCreateApiResponse =
  /** status 201  */ CategoryDto;
export type CategoryControllerCreateApiArg = {
  createCategoryDto: CreateCategoryDto;
};
export type CategoryControllerFindOneApiResponse =
  /** status 200  */ CategoryDto;
export type CategoryControllerFindOneApiArg = {
  id: string;
};
export type CategoryControllerUpdateApiResponse =
  /** status 200  */ CategoryDto;
export type CategoryControllerUpdateApiArg = {
  id: string;
  updateCategoryDto: UpdateCategoryDto;
};
export type CategoryControllerRemoveApiResponse = unknown;
export type CategoryControllerRemoveApiArg = {
  id: string;
};
export type ManufacturerControllerFindAllApiResponse =
  /** status 200  */ ManufacturerDto[];
export type ManufacturerControllerFindAllApiArg = void;
export type ManufacturerControllerCreateApiResponse =
  /** status 201  */ ManufacturerDto;
export type ManufacturerControllerCreateApiArg = {
  createManufacturerDto: CreateManufacturerDto;
};
export type ManufacturerControllerFindOneApiResponse =
  /** status 200  */ ManufacturerDto;
export type ManufacturerControllerFindOneApiArg = {
  id: string;
};
export type ManufacturerControllerUpdateApiResponse =
  /** status 200  */ ManufacturerDto;
export type ManufacturerControllerUpdateApiArg = {
  id: string;
  updateManufacturerDto: UpdateManufacturerDto;
};
export type ManufacturerControllerRemoveApiResponse = unknown;
export type ManufacturerControllerRemoveApiArg = {
  id: string;
};
export type UnitControllerFindAllApiResponse = /** status 200  */ UnitDto[];
export type UnitControllerFindAllApiArg = void;
export type UnitControllerCreateApiResponse = /** status 201  */ UnitDto;
export type UnitControllerCreateApiArg = {
  createUnitDto: CreateUnitDto;
};
export type UnitControllerFindOneApiResponse = /** status 200  */ UnitDto;
export type UnitControllerFindOneApiArg = {
  id: string;
};
export type UnitControllerUpdateApiResponse = /** status 200  */ UnitDto;
export type UnitControllerUpdateApiArg = {
  id: string;
  updateUnitDto: UpdateUnitDto;
};
export type UnitControllerRemoveApiResponse = unknown;
export type UnitControllerRemoveApiArg = {
  id: string;
};
export type ProductControllerFindAllApiResponse =
  /** status 200  */ ProductListResponseDto;
export type ProductControllerFindAllApiArg = {
  page?: string;
  size?: string;
  search?: string;
  categoryId?: string;
  manufacturerId?: string;
  includeInactive?: string;
};
export type ProductControllerCreateApiResponse = /** status 201  */ ProductDto;
export type ProductControllerCreateApiArg = {
  createProductDto: CreateProductDto;
};
export type ProductControllerFindByBarcodeApiResponse =
  /** status 200  */ ProductDto;
export type ProductControllerFindByBarcodeApiArg = {
  value: string;
};
export type ProductControllerGetImageApiResponse = unknown;
export type ProductControllerGetImageApiArg = {
  id: string;
};
export type ProductControllerGetImagesApiResponse =
  /** status 200  */ ProductImageDto[];
export type ProductControllerGetImagesApiArg = {
  id: string;
};
export type ProductControllerUploadImagesApiResponse =
  /** status 201  */ ProductImageDto[];
export type ProductControllerUploadImagesApiArg = {
  id: string;
};
export type ProductControllerFindOneApiResponse = /** status 200  */ ProductDto;
export type ProductControllerFindOneApiArg = {
  id: string;
};
export type ProductControllerUpdateApiResponse = /** status 200  */ ProductDto;
export type ProductControllerUpdateApiArg = {
  id: string;
  updateProductDto: UpdateProductDto;
};
export type ProductControllerRemoveApiResponse = /** status 200  */ object;
export type ProductControllerRemoveApiArg = {
  id: string;
};
export type WarehouseControllerGetGlobalPriceListApiResponse =
  /** status 200  */ PriceListItemDto[];
export type WarehouseControllerGetGlobalPriceListApiArg = void;
export type WarehouseControllerFindAllApiResponse =
  /** status 200  */ WarehouseDto[];
export type WarehouseControllerFindAllApiArg = void;
export type WarehouseControllerCreateApiResponse =
  /** status 201  */ WarehouseDto;
export type WarehouseControllerCreateApiArg = {
  createWarehouseDto: CreateWarehouseDto;
};
export type WarehouseControllerFindOneApiResponse =
  /** status 200  */ WarehouseDto;
export type WarehouseControllerFindOneApiArg = {
  id: string;
};
export type WarehouseControllerUpdateApiResponse =
  /** status 200  */ WarehouseDto;
export type WarehouseControllerUpdateApiArg = {
  id: string;
  updateWarehouseDto: UpdateWarehouseDto;
};
export type WarehouseControllerRemoveApiResponse = unknown;
export type WarehouseControllerRemoveApiArg = {
  id: string;
};
export type WarehouseControllerAddStockApiResponse =
  /** status 201  */ StockItemDto;
export type WarehouseControllerAddStockApiArg = {
  id: string;
  addStockDto: AddStockDto;
};
export type WarehouseControllerGetStockApiResponse =
  /** status 200  */ StockItemDto[];
export type WarehouseControllerGetStockApiArg = {
  id: string;
};
export type WarehouseControllerUpdateStockApiResponse =
  /** status 200  */ StockItemDto;
export type WarehouseControllerUpdateStockApiArg = {
  id: string;
  stockId: string;
  updateStockDto: UpdateStockDto;
};
export type WarehouseControllerGetWarehousePriceListApiResponse =
  /** status 200  */ PriceListItemDto[];
export type WarehouseControllerGetWarehousePriceListApiArg = {
  id: string;
};
export type ObjectControllerFindAllApiResponse = /** status 200  */ ObjectDto[];
export type ObjectControllerFindAllApiArg = void;
export type ObjectControllerCreateApiResponse = /** status 201  */ ObjectDto;
export type ObjectControllerCreateApiArg = {
  createObjectDto: CreateObjectDto;
};
export type ObjectControllerFindOneApiResponse = /** status 200  */ ObjectDto;
export type ObjectControllerFindOneApiArg = {
  id: string;
};
export type ObjectControllerUpdateApiResponse = /** status 200  */ ObjectDto;
export type ObjectControllerUpdateApiArg = {
  id: string;
  updateObjectDto: UpdateObjectDto;
};
export type ObjectControllerRemoveApiResponse = unknown;
export type ObjectControllerRemoveApiArg = {
  id: string;
};
export type ShipmentControllerFindByObjectApiResponse =
  /** status 200  */ ShipmentDto[];
export type ShipmentControllerFindByObjectApiArg = {
  objectId: string;
};
export type ShipmentControllerFindByWarehouseApiResponse =
  /** status 200  */ ShipmentDto[];
export type ShipmentControllerFindByWarehouseApiArg = {
  warehouseId: string;
};
export type ShipmentControllerFindAllApiResponse =
  /** status 200  */ ShipmentDto[];
export type ShipmentControllerFindAllApiArg = {
  objectId?: string;
  warehouseId?: string;
  status?: string;
};
export type ShipmentControllerCreateApiResponse =
  /** status 201  */ ShipmentDto;
export type ShipmentControllerCreateApiArg = {
  createShipmentDto: CreateShipmentDto;
};
export type ShipmentControllerFindOneApiResponse =
  /** status 200  */ ShipmentDto;
export type ShipmentControllerFindOneApiArg = {
  id: string;
};
export type ShipmentControllerRemoveApiResponse = unknown;
export type ShipmentControllerRemoveApiArg = {
  id: string;
};
export type ShipmentControllerUpdateStatusApiResponse =
  /** status 200  */ ShipmentDto;
export type ShipmentControllerUpdateStatusApiArg = {
  id: string;
  updateStatusDto: UpdateStatusDto;
};
export type ReceiptControllerFindAllApiResponse =
  /** status 200  */ GoodsReceiptDto[];
export type ReceiptControllerFindAllApiArg = {
  status?: string;
};
export type ReceiptControllerCreateApiResponse =
  /** status 201  */ GoodsReceiptDto;
export type ReceiptControllerCreateApiArg = {
  createReceiptDto: CreateReceiptDto;
};
export type ReceiptControllerFindOneApiResponse =
  /** status 200  */ GoodsReceiptDto;
export type ReceiptControllerFindOneApiArg = {
  id: string;
};
export type ReceiptControllerUpdateApiResponse =
  /** status 200  */ GoodsReceiptDto;
export type ReceiptControllerUpdateApiArg = {
  id: string;
  updateReceiptDto: UpdateReceiptDto;
};
export type ReceiptControllerRemoveApiResponse = unknown;
export type ReceiptControllerRemoveApiArg = {
  id: string;
};
export type ReceiptControllerAddItemApiResponse =
  /** status 200  */ GoodsReceiptDto;
export type ReceiptControllerAddItemApiArg = {
  id: string;
  addReceiptItemDto: AddReceiptItemDto;
};
export type ReceiptControllerUpdateItemApiResponse =
  /** status 200  */ GoodsReceiptDto;
export type ReceiptControllerUpdateItemApiArg = {
  id: string;
  itemId: string;
  updateReceiptItemDto: UpdateReceiptItemDto;
};
export type ReceiptControllerRemoveItemApiResponse =
  /** status 200  */ GoodsReceiptDto;
export type ReceiptControllerRemoveItemApiArg = {
  id: string;
  itemId: string;
};
export type ReceiptControllerPostApiResponse =
  /** status 200  */ GoodsReceiptDto;
export type ReceiptControllerPostApiArg = {
  id: string;
};
export type ReceiptControllerCancelApiResponse =
  /** status 200  */ GoodsReceiptDto;
export type ReceiptControllerCancelApiArg = {
  id: string;
};
export type ChatControllerFindAllApiResponse = /** status 200  */ MessageDto[];
export type ChatControllerFindAllApiArg = {
  limit?: string;
};
export type ChatControllerCreateApiResponse = /** status 201  */ MessageDto;
export type ChatControllerCreateApiArg = {
  createMessageDto: CreateMessageDto;
};
export type ChatControllerUpdateApiResponse = /** status 200  */ MessageDto;
export type ChatControllerUpdateApiArg = {
  id: number;
  messageTextDto: MessageTextDto;
};
export type ChatControllerRemoveApiResponse = unknown;
export type ChatControllerRemoveApiArg = {
  id: number;
};
export type ChatControllerDownloadApiResponse = unknown;
export type ChatControllerDownloadApiArg = {
  messageId: number;
  attachmentId: string;
};
export type ProjectControllerFindAllApiResponse =
  /** status 200  */ ProjectDto[];
export type ProjectControllerFindAllApiArg = void;
export type ProjectControllerCreateApiResponse = /** status 201  */ ProjectDto;
export type ProjectControllerCreateApiArg = {
  createProjectDto: CreateProjectDto;
};
export type ProjectControllerFindOneApiResponse = /** status 200  */ ProjectDto;
export type ProjectControllerFindOneApiArg = {
  id: string;
};
export type ProjectControllerUpdateApiResponse = /** status 200  */ ProjectDto;
export type ProjectControllerUpdateApiArg = {
  id: string;
  updateProjectDto: UpdateProjectDto;
};
export type ProjectControllerRemoveApiResponse = unknown;
export type ProjectControllerRemoveApiArg = {
  id: string;
};
export type TransferControllerFindAllApiResponse =
  /** status 200  */ StockTransferDto[];
export type TransferControllerFindAllApiArg = void;
export type TransferControllerCreateApiResponse =
  /** status 201  */ StockTransferDto;
export type TransferControllerCreateApiArg = {
  createTransferDto: CreateTransferDto;
};
export type UserDto = {
  id: string;
  email: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role: ("ADMIN" | "USER")[];
  avatar?: string | null;
  createdAt: string;
  updatedAt: string;
};
export type AuthResponseDto = {
  accessToken: string;
  user: UserDto;
};
export type LoginDto = {
  email: string;
  password: string;
};
export type UpdateUserDto = {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  role?: ("ADMIN" | "USER")[];
};
export type CreateUserDto = {
  email: string;
  password: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: ("ADMIN" | "USER")[];
};
export type CategoryDto = {
  id: string;
  name: string;
  parentId?: string | null;
  children?: CategoryDto[] | null;
  createdAt: string;
};
export type CreateCategoryDto = {
  name: string;
  parentId?: string;
};
export type UpdateCategoryDto = {
  name?: string;
  parentId?: string;
};
export type ManufacturerDto = {
  id: string;
  name: string;
  country?: string | null;
  createdAt: string;
};
export type CreateManufacturerDto = {
  name: string;
  country?: string;
};
export type UpdateManufacturerDto = {
  name?: string;
  country?: string;
};
export type UnitDto = {
  id: string;
  code: string;
  name: string;
  symbol: string;
};
export type CreateUnitDto = {
  code: string;
  name: string;
  symbol: string;
};
export type UpdateUnitDto = {
  code?: string;
  name?: string;
  symbol?: string;
};
export type ProductImageDto = {
  id: string;
  productId: string;
  url: string;
};
export type BarcodeDto = {
  id: string;
  productId: string;
  value: string;
  type: "EAN13" | "CODE128" | "UPC" | "QR";
  isPrimary: boolean;
};
export type ProductDto = {
  id: string;
  sku: string;
  title: string;
  description?: string | null;
  categoryId?: string | null;
  category?: CategoryDto | null;
  manufacturerId?: string | null;
  manufacturer?: ManufacturerDto | null;
  baseUnitId: string;
  baseUnit?: UnitDto | null;
  purchaseUnitId?: string | null;
  purchaseUnit?: UnitDto | null;
  purchaseToBase: number;
  saleUnitId?: string | null;
  saleUnit?: UnitDto | null;
  saleToBase: number;
  purchasePrice?: number | null;
  estimatePrice?: number | null;
  salePrice?: number | null;
  vatRate: "NONE" | "VAT0" | "VAT10" | "VAT20";
  weightKg?: number | null;
  lengthMm?: number | null;
  widthMm?: number | null;
  heightMm?: number | null;
  volumeM3?: number | null;
  grade?: string | null;
  material?: string | null;
  gost?: string | null;
  country?: string | null;
  minStock?: number | null;
  isActive: boolean;
  imageUrl?: string | null;
  imageType?: string | null;
  createdAt: string;
  updatedAt: string;
  images: ProductImageDto[];
  barcodes: BarcodeDto[];
};
export type ProductListResponseDto = {
  items: ProductDto[];
  total: number;
  page: number;
  size: number;
  pages: number;
};
export type BarcodeInputDto = {
  value: string;
  type?: "EAN13" | "CODE128" | "UPC" | "QR";
  isPrimary?: boolean;
};
export type CreateProductDto = {
  title: string;
  sku?: string;
  description?: string;
  categoryId?: string;
  manufacturerId?: string;
  baseUnitId: string;
  purchaseUnitId?: string;
  purchaseToBase?: number;
  saleUnitId?: string;
  saleToBase?: number;
  purchasePrice?: number;
  estimatePrice?: number;
  salePrice?: number;
  vatRate?: "NONE" | "VAT0" | "VAT10" | "VAT20";
  weightKg?: number;
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  volumeM3?: number;
  grade?: string;
  material?: string;
  gost?: string;
  country?: string;
  minStock?: number;
  isActive?: boolean;
  imageUrl?: string;
  barcodes?: BarcodeInputDto[];
};
export type UpdateProductDto = {
  title?: string;
  sku?: string;
  description?: string;
  categoryId?: string;
  manufacturerId?: string;
  baseUnitId?: string;
  purchaseUnitId?: string;
  purchaseToBase?: number;
  saleUnitId?: string;
  saleToBase?: number;
  purchasePrice?: number;
  estimatePrice?: number;
  salePrice?: number;
  vatRate?: "NONE" | "VAT0" | "VAT10" | "VAT20";
  weightKg?: number;
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  volumeM3?: number;
  grade?: string;
  material?: string;
  gost?: string;
  country?: string;
  minStock?: number;
  isActive?: boolean;
  imageUrl?: string;
  barcodes?: BarcodeInputDto[];
};
export type PriceListItemDto = {
  id: string;
  productId: string;
  productTitle: string;
  category?: string | null;
  manufacturer?: string | null;
  unit?: string | null;
  quantity: number;
  purchasePrice?: number | null;
  estimatePrice?: number | null;
  salePrice?: number | null;
  discount?: number | null;
  warehouseId: string;
  warehouseName: string;
  firstArrivedAt?: string | null;
};
export type WarehouseDto = {
  id: string;
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
  updatedAt: string;
};
export type CreateWarehouseDto = {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
};
export type UpdateWarehouseDto = {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
};
export type StockItemDto = {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  purchasePrice?: number | null;
  estimatePrice?: number | null;
  salePrice?: number | null;
  discount?: number | null;
  product?: ProductDto;
};
export type AddStockDto = {
  productId: string;
  quantity: number;
  purchasePrice?: number;
  estimatePrice?: number;
  salePrice?: number;
  discount?: number;
};
export type UpdateStockDto = {
  purchasePrice?: number;
  estimatePrice?: number;
  salePrice?: number;
  discount?: number;
};
export type ObjectDto = {
  id: string;
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  cameraUrl?: string | null;
  cameraType?: ("hls" | "mjpeg" | "snapshot") | null;
  createdAt: string;
  updatedAt: string;
};
export type CreateObjectDto = {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  cameraUrl?: string;
  cameraType?: "hls" | "mjpeg" | "snapshot";
};
export type UpdateObjectDto = {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  cameraUrl?: string;
  cameraType?: "hls" | "mjpeg" | "snapshot";
};
export type ShipmentItemDto = {
  id: string;
  shipmentId: string;
  productId: string;
  quantity: number;
  product?: ProductDto;
};
export type ShipmentDto = {
  id: string;
  warehouseId: string;
  objectId: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  warehouse?: WarehouseDto;
  object?: ObjectDto;
  items?: ShipmentItemDto[];
};
export type CreateShipmentItemDto = {
  productId: string;
  quantity: number;
};
export type CreateShipmentDto = {
  warehouseId: string;
  objectId: string;
  items: CreateShipmentItemDto[];
};
export type UpdateStatusDto = {
  status: "PENDING" | "COMPLETED" | "CANCELLED";
};
export type GoodsReceiptItemDto = {
  id: string;
  receiptId: string;
  productId: string;
  quantity: number;
  unitId: string;
  unitQuantity: number;
  unitFactor: number;
  purchasePrice?: number | null;
  product?: ProductDto | null;
  unit?: UnitDto | null;
};
export type GoodsReceiptDto = {
  id: string;
  number: string;
  warehouseId: string;
  supplier?: string | null;
  receiptDate: string;
  status: "DRAFT" | "POSTED" | "CANCELLED";
  comment?: string | null;
  createdById?: string | null;
  createdBy?: UserDto | null;
  createdAt: string;
  updatedAt: string;
  warehouse?: WarehouseDto | null;
  items?: GoodsReceiptItemDto[] | null;
};
export type CreateReceiptItemDto = {
  productId: string;
  quantity: number;
  /** Единица, в которой указано количество. По умолчанию — закупочная (или базовая) единица товара. */
  unitId?: string;
  /** Цена за единицу приёмки (unitId). */
  purchasePrice?: number;
};
export type CreateReceiptDto = {
  warehouseId: string;
  supplier?: string;
  comment?: string;
  receiptDate?: string;
  items?: CreateReceiptItemDto[];
};
export type UpdateReceiptDto = {
  warehouseId?: string;
  supplier?: string;
  comment?: string;
  receiptDate?: string;
};
export type AddReceiptItemDto = {
  productId: string;
  quantity: number;
  /** Единица, в которой указано количество. По умолчанию — закупочная (или базовая) единица товара. */
  unitId?: string;
  /** Цена за единицу приёмки (unitId). */
  purchasePrice?: number;
};
export type UpdateReceiptItemDto = {
  quantity?: number;
  unitId?: string;
  purchasePrice?: number;
};
export type MessageUserDto = {
  id: string;
  avatar?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
};
export type AttachmentDto = {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
};
export type MessageDto = {
  id: number;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
  user?: MessageUserDto;
  attachments?: AttachmentDto[];
};
export type CreateMessageDto = {
  text?: string;
};
export type MessageTextDto = {
  text: string;
};
export type ProjectDto = {
  id: string;
  name: string;
  /** Произвольная JSON-конфигурация проекта */
  config: object;
  userId: string;
  createdAt: string;
  updatedAt: string;
};
export type CreateProjectDto = {
  name: string;
  config: object;
};
export type UpdateProjectDto = {
  name: string;
  config: object;
};
export type StockTransferDto = {
  id: string;
  productId: string;
  quantity: number;
  fromWarehouseId: string;
  toWarehouseId: string;
  createdAt: string;
  product?: ProductDto;
  fromWarehouse?: WarehouseDto;
  toWarehouse?: WarehouseDto;
};
export type CreateTransferDto = {
  productId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
};
export const {
  useAuthControllerLoginMutation,
  useAuthControllerLogoutMutation,
  useAuthControllerRefreshTokensMutation,
  useUserControllerFindAllQuery,
  useUserControllerGetMeQuery,
  useUserControllerFindOneQuery,
  useUserControllerUpdateMutation,
  useUserControllerRemoveMutation,
  useUserControllerCreateMutation,
  useCategoryControllerFindAllQuery,
  useCategoryControllerCreateMutation,
  useCategoryControllerFindOneQuery,
  useCategoryControllerUpdateMutation,
  useCategoryControllerRemoveMutation,
  useManufacturerControllerFindAllQuery,
  useManufacturerControllerCreateMutation,
  useManufacturerControllerFindOneQuery,
  useManufacturerControllerUpdateMutation,
  useManufacturerControllerRemoveMutation,
  useUnitControllerFindAllQuery,
  useUnitControllerCreateMutation,
  useUnitControllerFindOneQuery,
  useUnitControllerUpdateMutation,
  useUnitControllerRemoveMutation,
  useProductControllerFindAllQuery,
  useProductControllerCreateMutation,
  useProductControllerFindByBarcodeQuery,
  useProductControllerGetImageQuery,
  useProductControllerGetImagesQuery,
  useProductControllerUploadImagesMutation,
  useProductControllerFindOneQuery,
  useProductControllerUpdateMutation,
  useProductControllerRemoveMutation,
  useWarehouseControllerGetGlobalPriceListQuery,
  useWarehouseControllerFindAllQuery,
  useWarehouseControllerCreateMutation,
  useWarehouseControllerFindOneQuery,
  useWarehouseControllerUpdateMutation,
  useWarehouseControllerRemoveMutation,
  useWarehouseControllerAddStockMutation,
  useWarehouseControllerGetStockQuery,
  useWarehouseControllerUpdateStockMutation,
  useWarehouseControllerGetWarehousePriceListQuery,
  useObjectControllerFindAllQuery,
  useObjectControllerCreateMutation,
  useObjectControllerFindOneQuery,
  useObjectControllerUpdateMutation,
  useObjectControllerRemoveMutation,
  useShipmentControllerFindByObjectQuery,
  useShipmentControllerFindByWarehouseQuery,
  useShipmentControllerFindAllQuery,
  useShipmentControllerCreateMutation,
  useShipmentControllerFindOneQuery,
  useShipmentControllerRemoveMutation,
  useShipmentControllerUpdateStatusMutation,
  useReceiptControllerFindAllQuery,
  useReceiptControllerCreateMutation,
  useReceiptControllerFindOneQuery,
  useReceiptControllerUpdateMutation,
  useReceiptControllerRemoveMutation,
  useReceiptControllerAddItemMutation,
  useReceiptControllerUpdateItemMutation,
  useReceiptControllerRemoveItemMutation,
  useReceiptControllerPostMutation,
  useReceiptControllerCancelMutation,
  useChatControllerFindAllQuery,
  useChatControllerCreateMutation,
  useChatControllerUpdateMutation,
  useChatControllerRemoveMutation,
  useChatControllerDownloadQuery,
  useProjectControllerFindAllQuery,
  useProjectControllerCreateMutation,
  useProjectControllerFindOneQuery,
  useProjectControllerUpdateMutation,
  useProjectControllerRemoveMutation,
  useTransferControllerFindAllQuery,
  useTransferControllerCreateMutation,
} = injectedRtkApi;
