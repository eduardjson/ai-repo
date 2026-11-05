export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum ShipmentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum CameraType {
  HLS = 'hls',
  MJPEG = 'mjpeg',
  SNAPSHOT = 'snapshot',
}

export enum VatRate {
  NONE = 'NONE',
  VAT0 = 'VAT0',
  VAT10 = 'VAT10',
  VAT20 = 'VAT20',
}

export enum BarcodeType {
  EAN13 = 'EAN13',
  CODE128 = 'CODE128',
  UPC = 'UPC',
  QR = 'QR',
}

export enum ReceiptStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  CANCELLED = 'CANCELLED',
}

export enum MovementType {
  RECEIPT = 'RECEIPT',
  RECEIPT_CANCEL = 'RECEIPT_CANCEL',
  SHIPMENT = 'SHIPMENT',
  SHIPMENT_CANCEL = 'SHIPMENT_CANCEL',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
  ADJUSTMENT_IN = 'ADJUSTMENT_IN',
  ADJUSTMENT_OUT = 'ADJUSTMENT_OUT',
}
