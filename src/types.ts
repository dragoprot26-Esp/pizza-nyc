/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CustomField {
  label: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string; // Base64 or Unsplash URL
  customFields?: CustomField[];
}

export enum OrderStatus {
  PENDING = "Pendiente",
  PREPARING = "En preparación",
  READY = "Para entregar",
  DELIVERED = "Entregado",
  CANCELLED = "Cancelado"
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string; // "Personal", "Grande", "Familiar", etc.
  selectedToppings: string[];
  addedPrice: number; // additional price from selections
  notes: string;
}

export interface Order {
  id: string;
  code: string; // Code generated at checkout (e.g. NYC-1234)
  name: string;
  phone: string;
  address: string;
  items: CartItem[];
  paymentMethod: "Caja" | "Envío";
  status: OrderStatus;
  total: number;
  timestamp: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  status: "pending" | "approved";
  type?: "comment" | "suggestion";
  reply?: string;
  replyTimestamp?: string;
}

export interface TenantConfig {
  name: string;
  phone: string;
  email: string;
  passwordHash: string;
  licenseKey: string;
  headerImage: string;
  address?: string;
  mapUrl?: string;
  headerBadge?: string;
  headerSubtitle?: string;
  headerFont?: string;
  headerColorNeon?: string;
  headerTitleSize?: string;
  language?: "es" | "en";
  phonePrefix?: string;
  enableShipping?: boolean;
}

export interface Backup {
  id: string;
  timestamp: string;
  name: string;
  data: string; // Serialized state
}

export type NYThemeStyle = "Brooklyn Industrial" | "Broadway Neon" | "Manhattan Classic";

export interface ThemeConfig {
  id: NYThemeStyle;
  name: string;
  bg: string;
  cardBg: string;
  accent: string;
  text: string;
  textMuted: string;
  border: string;
  fontFamily: string;
}

export interface Collaborator {
  id: string;
  name: string;
  phone: string;
  image: string; // Base64 or Unsplash
  sessionActive: boolean;
  pin: string; // For login
  wantsBiometrics?: boolean; // uses browser biometric simulation
  loginRequestPending?: boolean; // waiting for owner's approval
}

