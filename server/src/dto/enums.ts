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
