// What the owner pages read from the SmartPOS API (only the fields they use).

export type OrderStatus = "PENDING" | "PREPARING" | "READY" | "SERVED" | "COMPLETED" | "CANCELLED";
export type PaymentMethod = "CASH" | "MOMO" | "CARD" | "CREDIT";

export interface Person {
  id: string;
  name: string;
  employee?: { name: string; shift?: string } | null;
  role?: string;
  phone?: string;
  email?: string;
}

export interface OrderItem {
  id: string;
  quantity: number;
  totalPrice: string | number;
  unitPrice?: string | number;
  // What one cost when it was sold; older orders fall back to the product's.
  unitCost?: string | number | null;
  note?: string | null;
  product?: { id: string; name: string; buyingPrice?: string | number; barCode?: string | null; images?: { url: string; thumbnailUrl?: string }[] } | null;
}

export interface Payment {
  id?: string;
  method: PaymentMethod | string;
  amount: string | number;
  createdAt?: string;
  // Credit only: who owes it, and who took it home.
  creditOwnerName?: string | null;
  creditOwnerPhone?: string | null;
  takenBy?: string | null;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus | string;
  total: string | number;
  subtotal?: string | number;
  tax?: string | number;
  type?: "IN_STORE" | "DELIVERY";
  customerName?: string | null;
  note?: string | null;
  items?: OrderItem[];
  payments?: Payment[];
  user?: Person | null;
  updatedAt?: string;
  // Who took the money at the door (deliveries); they hand it in.
  collectedBy?: Person | null;
  // Deliveries.
  deliveryStatus?: "WAITING" | "ON_THE_WAY" | "DELIVERED" | "NOT_DELIVERED" | null;
  deliveryFee?: string | number;
  customerPhone?: string | null;
  deliveryAddress?: string | null;
  deliveryArea?: string | null;
  rider?: Person | null;
  outsideRider?: string | null;
  payOnDelivery?: boolean;
  sentAt?: string | null;
  deliveredAt?: string | null;
  deliveryProblem?: string | null;
}

export interface Product {
  id: string;
  name: string;
  sellingPrice: string | number;
  buyingPrice: string | number;
  unit: string;
  active: boolean;
  trackStock: boolean;
  stockQuantity: string | number;
  lowStockLevel: string | number | null;
  isIngredient: boolean;
  category?: { id: string; name: string } | null;
  barCode?: string | null;
  sku?: string | null;
  supplier?: string | null;
  description?: string | null;
  expiryDate?: string | null;
  sendToKitchen?: boolean;
  images?: { url: string; thumbnailUrl?: string }[];
  // A free-text list, e.g. "Sugar, milk".
  ingredients?: string | null;
  // How it is bought, when that differs: a Tray of 30, counted in Piece.
  purchaseUnit?: string | null;
  purchaseSize?: string | number | null;
  // How many its ingredients allow; null when it doesn't depend on stock.
  canMake?: number | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: { id: string; name?: string } | null;
  updatedBy?: { id: string; name?: string } | null;
}

export interface Category {
  id: string;
  name: string;
  createdAt?: string;
  image?: { url: string; thumbnailUrl?: string } | null;
}

// How much of an ingredient one of a product uses, in the ingredient's unit.
export interface RecipeLine {
  ingredientId: string;
  quantity: number;
}

export interface Page<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface StockMovement {
  id: string;
  createdAt: string;
  change: string | number;
  quantityAfter: string | number;
  reason: "SALE" | "RESTOCK" | "ADJUSTMENT" | "WASTE" | "REFUND";
  note: string | null;
  user: { id: string; name: string } | null;
}

export interface AuditEntry {
  id: string;
  createdAt: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  entityId: string | null;
  // CREATE/DELETE: the whole record. UPDATE: { field: { from, to } }.
  changes: Record<string, unknown> | null;
  actor: { id: string; name?: string } | null;
}

// One ingredient over a period, valued at its current cost.
export interface IngredientUsage {
  id: string;
  name: string;
  unit: string;
  cost: number;
  used: number;
  wasted: number;
  received: number;
  // How far stock counts were off; below zero means stock nothing explains.
  counted: number;
}

// A free picture found by name; sent back as `pictureUrl` to keep a copy of it.
export interface ImageResult {
  url: string;
  thumbnail: string;
  title: string;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions?: string[] | null;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  salary: number;
  payType?: "MONTHLY" | "PER_DELIVERY";
  perDelivery?: string | number | null;
  shift: string;
  role?: Role | null;
  profile?: { url?: string; thumbnailUrl?: string } | null;
  user?: { id: string; active: boolean; lastLoginAt?: string | null } | null;
}

export type DeviceKind = "POS_TERMINAL" | "KITCHEN_DISPLAY" | "CUSTOMER_DISPLAY" | "RIDER_PHONE";

export interface Device {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceOs: string;
  registrationStatus: "PENDING" | "REQUESTED" | "REGISTERED" | "REJECTED" | "DISABLED" | string;
  type?: DeviceKind;
  online: boolean;
  lastSeenAt: string | null;
  createdAt: string;
  currentUser: { name: string } | null;
}
