/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  validarLicencia,
  asegurarCuentaSeguraDueno,
  asegurarCuentaSeguraColab,
  cloudLoad,
  cloudSave,
  signOutGlobal,
  estaLogueado,
  pizzaPublica,
  pizzaAgregarPedido,
  pizzaAgregarResena,
  pizzaVersion,
  CloudData
} from "../cloud";
import { 
  Product, 
  Order, 
  OrderStatus, 
  Comment, 
  TenantConfig, 
  Backup, 
  NYThemeStyle, 
  ThemeConfig,
  CartItem,
  Collaborator
} from "../types";

// Dynamic Notification type
export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning";
  timestamp: string;
}

interface PizzaContextType {
  products: Product[];
  categories: string[];
  orders: Order[];
  comments: Comment[];
  tenantConfig: TenantConfig;
  backups: Backup[];
  currentTheme: ThemeConfig;
  selectedThemeId: NYThemeStyle;
  cart: CartItem[];
  notifications: InAppNotification[];
  setTheme: (themeId: NYThemeStyle) => void;
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  addOrder: (order: Omit<Order, "id" | "code" | "timestamp" | "status">) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addComment: (author: string, text: string, type?: "comment" | "suggestion") => void;
  replyComment: (commentId: string, replyText: string) => void;
  approveComment: (commentId: string) => void;
  deleteComment: (commentId: string) => void;
  updateTenantConfig: (config: Partial<TenantConfig>) => void;
  triggerNotification: (title: string, message: string, type?: "success" | "info" | "warning") => void;
  clearNotifications: () => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  createBackup: (name?: string) => void;
  restoreBackup: (backupId: string) => void;
  deleteBackup: (backupId: string) => void;
  clearInventoryAndSales: () => void;
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (val: boolean) => void;
  licenseCode: string;
  publicCode: string;
  loginDueno: (codigo: string, usuario: string, pass: string) => Promise<{ ok: boolean; msg?: string }>;
  loginColab: (codigo: string, usuario: string, pass: string) => Promise<{ ok: boolean; msg?: string }>;
  logout: () => void;
  collaborators: Collaborator[];
  addCollaborator: (collab: Omit<Collaborator, "id" | "sessionActive">) => void;
  updateCollaborator: (collab: Collaborator) => void;
  deleteCollaborator: (id: string) => void;
  logoutCollaborator: (id: string) => void;
  requestCollaboratorLogin: (id: string, usesBiometrics: boolean) => Promise<boolean>;
  approveCollaboratorLogin: (id: string) => void;
  rejectCollaboratorLogin: (id: string) => void;
}

const PizzaContext = createContext<PizzaContextType | undefined>(undefined);

const THEMES: Record<NYThemeStyle, ThemeConfig> = {
  "Brooklyn Industrial": {
    id: "Brooklyn Industrial",
    name: "Brooklyn Industrial (Elegant Dark)",
    bg: "bg-[#0a0a0a]",
    cardBg: "bg-[#151515]",
    accent: "text-red-500 bg-red-600 hover:bg-red-700 hover:text-white border-red-600/30",
    text: "text-gray-100",
    textMuted: "text-gray-400",
    border: "border-white/10",
    fontFamily: "font-sans"
  },
  "Broadway Neon": {
    id: "Broadway Neon",
    name: "Broadway Neon (Vibrant Cyber)",
    bg: "bg-[#03001e]",
    cardBg: "bg-[#120024]",
    accent: "text-fuchsia-400 bg-fuchsia-600 hover:bg-fuchsia-700 hover:text-white border-fuchsia-500/30",
    text: "text-indigo-50",
    textMuted: "text-indigo-300",
    border: "border-fuchsia-500/20",
    fontFamily: "font-mono"
  },
  "Manhattan Classic": {
    id: "Manhattan Classic",
    name: "Manhattan Classic (Warm Mahogany)",
    bg: "bg-[#1c0d02]",
    cardBg: "bg-[#2c1606]",
    accent: "text-amber-500 bg-amber-600 hover:bg-amber-700 hover:text-white border-amber-600/30",
    text: "text-orange-50",
    textMuted: "text-orange-200/70",
    border: "border-amber-500/10",
    fontFamily: "font-sans"
  }
};

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Manhattan Pepperoni Classic",
    description: "Double mozzarella, thick crispy pepperoni cups, spicy organic hot honey, and fresh basil.",
    price: 18.50,
    category: "Pizza",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=400",
    customFields: [
      { label: "Borde Relleno de Queso", price: 3.50 },
      { label: "Doble Pepperoni", price: 2.50 }
    ]
  },
  {
    id: "p2",
    name: "Brooklyn Bridge Veggie",
    description: "Organic baby spinach, feta cheese, kalamata olives, sun-dried tomatoes, and sweet garlic glaze.",
    price: 17.00,
    category: "Pizza",
    image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "p3",
    name: "The Bronx Meat Inferno",
    description: "Smoked spicy sausage, Italian meatballs, ham, bacon, mozzarella, and dynamic jalapeño strips.",
    price: 19.90,
    category: "Promo",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400",
    customFields: [
      { label: "Salsa Picante Extra", price: 1.00 }
    ]
  },
  {
    id: "p4",
    name: "Empanadas de Carne Salteña (3u)",
    description: "Crispy wood-fired empanadas stuffed with spiced beef, fresh green onions, and side chimichurri.",
    price: 9.00,
    category: "Empanadas",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "p5",
    name: "Empanadas de Jamón y Queso (3u)",
    description: "Traditional golden pastries filled with smoked ham, rich mozzarella, and a hint of oregano.",
    price: 8.50,
    category: "Empanadas",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "p6",
    name: "Brooklyn Double Choc Brownie",
    description: "Warm fudgy brownie loaded with chocolate chunks and dusted with sea salt.",
    price: 6.00,
    category: "Ofertas",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=400"
  }
];

const DEFAULT_CATEGORIES = ["Todos", "Ofertas", "Promo", "Pizza", "Empanadas", "Bebidas"];

const DEFAULT_TENANT: TenantConfig = {
  name: "Pizza NYC Luigi's",
  phone: "+1 (212) 555-0199",
  email: "contacto@pizzanycluigi.com",
  passwordHash: "admin123", // Simple plain or simple hashing check
  licenseKey: "NYC-FREE-2026",
  headerImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=1024",
  address: "7th Ave & 33rd St, NY",
  mapUrl: "https://maps.google.com/?q=7th+Ave+%26+33rd+St,+New+York,+NY+10001",
  headerBadge: "Estilo Nueva York",
  headerSubtitle: "The Real Industrial Taste of Brooklyn",
  headerFont: "font-sans",
  headerColorNeon: "none",
  headerTitleSize: "text-4xl md:text-6xl",
  language: "es",
  phonePrefix: "+549",
  enableShipping: true
};

const DEFAULT_ORDERS: Order[] = [
  {
    id: "o1",
    code: "NYC-2401",
    name: "Diego Ariel",
    phone: "1154823902",
    address: "7th Ave & 33rd St, NY",
    items: [
      {
        product: DEFAULT_PRODUCTS[0],
        quantity: 1,
        selectedSize: "Grande (16\")",
        selectedToppings: ["Borde Relleno de Queso"],
        addedPrice: 3.5,
        notes: "Por favor bien cocida y crujiente!"
      }
    ],
    paymentMethod: "Caja",
    status: OrderStatus.DELIVERED,
    total: 22.00,
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString() // 2 hours ago
  },
  {
    id: "o2",
    code: "NYC-8821",
    name: "Romina G.",
    phone: "1138421094",
    address: "Broadway & 42nd St",
    items: [
      {
        product: DEFAULT_PRODUCTS[1],
        quantity: 2,
        selectedSize: "Personal (12\")",
        selectedToppings: [],
        addedPrice: 0,
        notes: ""
      },
      {
        product: DEFAULT_PRODUCTS[3],
        quantity: 1,
        selectedSize: "Porción estándar",
        selectedToppings: [],
        addedPrice: 0,
        notes: ""
      }
    ],
    paymentMethod: "Envío",
    status: OrderStatus.PREPARING,
    total: 43.00,
    timestamp: new Date(Date.now() - 30 * 60000).toISOString() // 30 mins ago
  }
];

const DEFAULT_COMMENTS: Comment[] = [
  {
    id: "c1",
    author: "Marcos S.",
    text: "La Manhattan Pepperoni con hot honey es una verdadera locura. Increíble el sabor a horno de barro!",
    timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
    status: "approved"
  },
  {
    id: "c2",
    author: "Elena R.",
    text: "Las empanadas de carne vienen super jugosas y con la masa perfecta. 100% recomendado.",
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    status: "approved"
  },
  {
    id: "c3",
    author: "Lucas K.",
    text: "Tardó un poquito el envío pero la pizza llegó hirviendo y el queso derretido. Muy bueno.",
    timestamp: new Date().toISOString(),
    status: "pending"
  }
];

const DEFAULT_COLLABORATORS: Collaborator[] = [
  {
    id: "collab1",
    name: "Mariano Silva",
    phone: "+5491134256789",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    sessionActive: false,
    pin: "1234",
    wantsBiometrics: true
  },
  {
    id: "collab2",
    name: "Sofía Martínez",
    phone: "+5491156789012",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    sessionActive: false,
    pin: "4321",
    wantsBiometrics: false
  }
];

export const PizzaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [tenantConfig, setTenantConfig] = useState<TenantConfig>(DEFAULT_TENANT);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<NYThemeStyle>("Brooklyn Industrial");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [licenseCode, setLicenseCode] = useState<string>("");
  const [publicCode, setPublicCode] = useState<string>("");
  const hydratingRef = React.useRef(false);
  const saveTimerRef = React.useRef<any>(null);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem("nyc_pizza_products");
      const storedCategories = localStorage.getItem("nyc_pizza_categories");
      const storedOrders = localStorage.getItem("nyc_pizza_orders");
      const storedComments = localStorage.getItem("nyc_pizza_comments");
      const storedTenant = localStorage.getItem("nyc_pizza_tenant");
      const storedBackups = localStorage.getItem("nyc_pizza_backups");
      const storedTheme = localStorage.getItem("nyc_pizza_theme") as NYThemeStyle;

      if (storedProducts) setProducts(JSON.parse(storedProducts));
      else {
        setProducts(DEFAULT_PRODUCTS);
        localStorage.setItem("nyc_pizza_products", JSON.stringify(DEFAULT_PRODUCTS));
      }

      if (storedCategories) setCategories(JSON.parse(storedCategories));
      else {
        setCategories(DEFAULT_CATEGORIES);
        localStorage.setItem("nyc_pizza_categories", JSON.stringify(DEFAULT_CATEGORIES));
      }

      if (storedOrders) setOrders(JSON.parse(storedOrders));
      else {
        setOrders(DEFAULT_ORDERS);
        localStorage.setItem("nyc_pizza_orders", JSON.stringify(DEFAULT_ORDERS));
      }

      if (storedComments) setComments(JSON.parse(storedComments));
      else {
        setComments(DEFAULT_COMMENTS);
        localStorage.setItem("nyc_pizza_comments", JSON.stringify(DEFAULT_COMMENTS));
      }

      if (storedTenant) setTenantConfig(JSON.parse(storedTenant));
      else {
        setTenantConfig(DEFAULT_TENANT);
        localStorage.setItem("nyc_pizza_tenant", JSON.stringify(DEFAULT_TENANT));
      }

      if (storedBackups) setBackups(JSON.parse(storedBackups));

      const storedCollaborators = localStorage.getItem("nyc_pizza_collaborators");
      if (storedCollaborators) {
        setCollaborators(JSON.parse(storedCollaborators));
      } else {
        setCollaborators(DEFAULT_COLLABORATORS);
        localStorage.setItem("nyc_pizza_collaborators", JSON.stringify(DEFAULT_COLLABORATORS));
      }

      if (storedTheme && THEMES[storedTheme]) {
        setSelectedThemeId(storedTheme);
      }
    } catch (err) {
      console.error("Error loading localStorage pizza states:", err);
    }
  }, []);

  // Helper persistence trigger
  const saveStateToLocal = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Theme changing
  const setTheme = (themeId: NYThemeStyle) => {
    setSelectedThemeId(themeId);
    localStorage.setItem("nyc_pizza_theme", themeId);
    triggerNotification(
      "Tema de Diseño cambiado", 
      `Aplicando el estilo: ${themeId}`, 
      "info"
    );
  };

  const currentTheme = THEMES[selectedThemeId] || THEMES["Brooklyn Industrial"];

  // Push notifications emulator
  const triggerNotification = (title: string, message: string, type: "success" | "info" | "warning" = "info") => {
    const newNotif: InAppNotification = {
      id: "notif_" + Math.random().toString(36).substring(2, 9),
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 5)); // Keep last 5
    
    // Also trigger custom browser notification if permitted and in new tab
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(`🍕 ${title}`, { body: message });
      } catch (e) {
        console.log("Desktop notification failed (inside iframe sandbox restriction)");
      }
    }
  };

  const clearNotifications = () => setNotifications([]);

  // Product actions
  const addProduct = (p: Omit<Product, "id">) => {
    const newProduct: Product = { ...p, id: "p_" + Date.now().toString(36) };
    const updated = [...products, newProduct];
    setProducts(updated);
    saveStateToLocal("nyc_pizza_products", updated);
    triggerNotification("Producto Agregado", `Se agregó "${p.name}" al catálogo.`, "success");
  };

  const updateProduct = (p: Product) => {
    const updated = products.map(item => item.id === p.id ? p : item);
    setProducts(updated);
    saveStateToLocal("nyc_pizza_products", updated);
    triggerNotification("Producto Actualizado", `"${p.name}" editado exitosamente.`, "success");
  };

  const deleteProduct = (id: string) => {
    const productToDelete = products.find(p => p.id === id);
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    saveStateToLocal("nyc_pizza_products", updated);
    if (productToDelete) {
      triggerNotification("Producto Eliminado", `Se retiró "${productToDelete.name}" de la tienda.`, "warning");
    }
  };

  // Category actions
  const addCategory = (cat: string) => {
    if (categories.includes(cat)) return;
    const updated = [...categories, cat];
    setCategories(updated);
    saveStateToLocal("nyc_pizza_categories", updated);
    triggerNotification("Categoría Creada", `Nueva categoría "${cat}" añadida.`, "success");
  };

  const deleteCategory = (cat: string) => {
    const updated = categories.filter(c => c !== cat);
    setCategories(updated);
    saveStateToLocal("nyc_pizza_categories", updated);
    triggerNotification("Categoría Eliminada", `Se borró la categoría "${cat}".`, "warning");
  };

  // Checkout and Order actions
  const addOrder = (orderData: Omit<Order, "id" | "code" | "timestamp" | "status">): Order => {
    const randomCode = "NYC-" + Math.floor(1000 + Math.random() * 9000).toString();
    const newOrder: Order = {
      ...orderData,
      id: "o_" + Date.now().toString(36),
      code: randomCode,
      status: OrderStatus.PENDING,
      timestamp: new Date().toISOString()
    };
    
    const updated = [newOrder, ...orders];
    setOrders(updated);
    saveStateToLocal("nyc_pizza_orders", updated);
    // Vista pública: el pedido del cliente se persiste en la nube del local.
    if (publicCode) { pizzaAgregarPedido(publicCode, newOrder); }

    triggerNotification(
      "¡Pedido Recibido!",
      `Código: ${randomCode}. Nombre: ${orderData.name}. Total: $${orderData.total.toFixed(2)}`,
      "success"
    );

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        if (o.status !== status) {
          // Push notification about tracking change
          triggerNotification(
            `Estado Actualizado: ${status}`, 
            `Tu pedido ${o.code} de ${o.name} ahora está en estado: ${status}`,
            status === OrderStatus.CANCELLED ? "warning" : "success"
          );
        }
        return { ...o, status };
      }
      return o;
    });
    setOrders(updated);
    saveStateToLocal("nyc_pizza_orders", updated);
  };

  // Comments/Feedback
  const addComment = (author: string, text: string, type: "comment" | "suggestion" = "comment") => {
    const newComment: Comment = {
      id: "c_" + Date.now().toString(36),
      author,
      text,
      timestamp: new Date().toISOString(),
      status: type === "suggestion" ? "approved" : "pending",
      type
    };
    const updated = [newComment, ...comments];
    setComments(updated);
    saveStateToLocal("nyc_pizza_comments", updated);
    // Vista pública: la opinión del cliente se envía a la nube (queda pendiente de aprobar).
    if (publicCode) { pizzaAgregarResena(publicCode, newComment); }

    const notifTitle = type === "suggestion" ? "Sugerencia Recibida" : "Comentario Recibido";
    const notifMsg = type === "suggestion" 
      ? "Sugerencia enviada directamente a Luigi para su lectura." 
      : "Esperando aprobación de Luigi en el panel administrativo.";
    triggerNotification(notifTitle, notifMsg, "info");
  };

  const replyComment = (commentId: string, replyText: string) => {
    const updated = comments.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          reply: replyText,
          replyTimestamp: new Date().toISOString()
        };
      }
      return c;
    });
    setComments(updated);
    saveStateToLocal("nyc_pizza_comments", updated);
    triggerNotification("Respuesta Guardada", "Tu respuesta ha sido registrada exitosamente.", "success");
  };

  const approveComment = (commentId: string) => {
    const updated = comments.map(c => c.id === commentId ? { ...c, status: "approved" as const } : c);
    setComments(updated);
    saveStateToLocal("nyc_pizza_comments", updated);
    triggerNotification("Comentario Aprobado", "Publicado en el muro de visitas público.", "success");
  };

  const deleteComment = (commentId: string) => {
    const updated = comments.filter(c => c.id !== commentId);
    setComments(updated);
    saveStateToLocal("nyc_pizza_comments", updated);
    triggerNotification("Comentario Eliminado", "Sugerencia eliminada con éxito.", "warning");
  };

  // Business Configurations
  const updateTenantConfig = (config: Partial<TenantConfig>) => {
    const updated = { ...tenantConfig, ...config };
    setTenantConfig(updated);
    saveStateToLocal("nyc_pizza_tenant", updated);
    triggerNotification("Configuración Guardada", "Los datos del local se actualizaron con éxito.", "success");
  };

  // Cart actions
  const addToCart = (item: CartItem) => {
    setCart(prev => [...prev, item]);
    triggerNotification(
      "Añadido al canasto", 
      `${item.quantity}x ${item.product.name} (${item.selectedSize})`, 
      "success"
    );
  };

  const removeFromCart = (index: number) => {
    const removedItem = cart[index];
    setCart(prev => prev.filter((_, i) => i !== index));
    if (removedItem) {
      triggerNotification("Removido", `Se quitó ${removedItem.product.name} del canasto.`, "info");
    }
  };

  const clearCart = () => setCart([]);

  // Backup operations (keeps up to 5 copies, older ones rot out)
  const createBackup = (name = `Copia de Seguridad ${new Date().toLocaleDateString()}`) => {
    const stateObj = {
      products,
      categories,
      orders,
      comments,
      tenantConfig,
      selectedThemeId
    };
    
    const serialized = JSON.stringify(stateObj);
    const newBackup: Backup = {
      id: "bak_" + Date.now().toString(36),
      timestamp: new Date().toLocaleString(),
      name,
      data: serialized
    };

    // Keep up to 5 backups (rotating)
    const updatedBackups = [newBackup, ...backups].slice(0, 5);
    setBackups(updatedBackups);
    saveStateToLocal("nyc_pizza_backups", updatedBackups);
    
    triggerNotification("Copia Realizada", "Se ha creado un respaldo local de 5 ranuras.", "success");
  };

  const restoreBackup = (backupId: string) => {
    const found = backups.find(b => b.id === backupId);
    if (!found) return;
    try {
      const restored = JSON.parse(found.data);
      if (restored.products) setProducts(restored.products);
      if (restored.categories) setCategories(restored.categories);
      if (restored.orders) setOrders(restored.orders);
      if (restored.comments) setComments(restored.comments);
      if (restored.tenantConfig) setTenantConfig(restored.tenantConfig);
      if (restored.selectedThemeId) setSelectedThemeId(restored.selectedThemeId);

      triggerNotification("Respaldo Restaurado", `Datos de "${found.name}" aplicados con éxito.`, "success");
    } catch (err) {
      triggerNotification("Error de Restauración", "La estructura del archivo es incompatible.", "warning");
    }
  };

  const deleteBackup = (backupId: string) => {
    const updated = backups.filter(b => b.id !== backupId);
    setBackups(updated);
    saveStateToLocal("nyc_pizza_backups", updated);
    triggerNotification("Respaldo Eliminado", "Copia borrada de la memoria.", "warning");
  };

  const clearInventoryAndSales = () => {
    setProducts([]);
    setOrders([]);
    saveStateToLocal("nyc_pizza_products", []);
    saveStateToLocal("nyc_pizza_orders", []);
    triggerNotification("Vaciado Completo", "Se ha vaciado el inventario y el historial de ventas.", "warning");
  };

  const addCollaborator = (collab: Omit<Collaborator, "id" | "sessionActive">) => {
    const newCollab: Collaborator = {
      ...collab,
      id: "collab_" + Date.now(),
      sessionActive: false
    };
    const updated = [...collaborators, newCollab];
    setCollaborators(updated);
    saveStateToLocal("nyc_pizza_collaborators", updated);
    triggerNotification("Colaborador Registrado", `Se ha registrado a ${collab.name}.`, "success");
  };

  const updateCollaborator = (collab: Collaborator) => {
    const updated = collaborators.map(c => c.id === collab.id ? collab : c);
    setCollaborators(updated);
    saveStateToLocal("nyc_pizza_collaborators", updated);
    triggerNotification("Colaborador Actualizado", `Se actualizaron los datos de ${collab.name}.`, "success");
  };

  const deleteCollaborator = (id: string) => {
    const found = collaborators.find(c => c.id === id);
    const updated = collaborators.filter(c => c.id !== id);
    setCollaborators(updated);
    saveStateToLocal("nyc_pizza_collaborators", updated);
    if (found) {
      triggerNotification("Colaborador Eliminado", `Se eliminó a ${found.name} del personal.`, "warning");
    }
  };

  const logoutCollaborator = (id: string) => {
    const updated = collaborators.map(c => {
      if (c.id === id) {
        return { ...c, sessionActive: false, loginRequestPending: false };
      }
      return c;
    });
    setCollaborators(updated);
    saveStateToLocal("nyc_pizza_collaborators", updated);
    const found = collaborators.find(c => c.id === id);
    if (found) {
      triggerNotification("Sesión Cerrada", `Se cerró la sesión de ${found.name}.`, "warning");
    }
  };

  const requestCollaboratorLogin = async (id: string, usesBiometrics: boolean): Promise<boolean> => {
    const found = collaborators.find(c => c.id === id);
    if (!found) return false;

    const updated = collaborators.map(c => {
      if (c.id === id) {
        return { ...c, loginRequestPending: true, wantsBiometrics: usesBiometrics };
      }
      return c;
    });
    setCollaborators(updated);
    saveStateToLocal("nyc_pizza_collaborators", updated);

    triggerNotification(
      "Intento de Ingreso",
      `${found.name} está intentando ingresar con credenciales inalámbricas.`,
      "warning"
    );
    return true;
  };

  const approveCollaboratorLogin = (id: string) => {
    const updated = collaborators.map(c => {
      if (c.id === id) {
        return { ...c, sessionActive: true, loginRequestPending: false };
      }
      return c;
    });
    setCollaborators(updated);
    saveStateToLocal("nyc_pizza_collaborators", updated);
    const found = collaborators.find(c => c.id === id);
    if (found) {
      triggerNotification("Ingreso Aprobado", `Permitiste el acceso a ${found.name}.`, "success");
    }
  };

  const rejectCollaboratorLogin = (id: string) => {
    const updated = collaborators.map(c => {
      if (c.id === id) {
        return { ...c, loginRequestPending: false };
      }
      return c;
    });
    setCollaborators(updated);
    saveStateToLocal("nyc_pizza_collaborators", updated);
    const found = collaborators.find(c => c.id === id);
    if (found) {
      triggerNotification("Ingreso Rechazado", `Rechazaste el intento de ingreso de ${found.name}.`, "info");
    }
  };

  // ── Nube (molde CyC): login real + sincronización ────────────────────
  const snapshot = (): CloudData => ({
    tenantConfig, products, categories, orders, comments, collaborators, selectedThemeId
  });

  const hydrate = (d: CloudData | null) => {
    if (!d) return;
    hydratingRef.current = true;
    if (d.products) { setProducts(d.products); saveStateToLocal("nyc_pizza_products", d.products); }
    if (d.categories) { setCategories(d.categories); saveStateToLocal("nyc_pizza_categories", d.categories); }
    if (d.orders) { setOrders(d.orders); saveStateToLocal("nyc_pizza_orders", d.orders); }
    if (d.comments) { setComments(d.comments); saveStateToLocal("nyc_pizza_comments", d.comments); }
    if (d.tenantConfig) { setTenantConfig(d.tenantConfig); saveStateToLocal("nyc_pizza_tenant", d.tenantConfig); }
    if (d.collaborators) { setCollaborators(d.collaborators); saveStateToLocal("nyc_pizza_collaborators", d.collaborators); }
    if (d.selectedThemeId && THEMES[d.selectedThemeId as NYThemeStyle]) {
      setSelectedThemeId(d.selectedThemeId as NYThemeStyle);
      localStorage.setItem("nyc_pizza_theme", d.selectedThemeId);
    }
    setTimeout(() => { hydratingRef.current = false; }, 500);
  };

  const loginDueno = async (codigo: string, usuario: string, pass: string): Promise<{ ok: boolean; msg?: string }> => {
    codigo = (codigo || "").trim().toUpperCase();
    const lic = await validarLicencia(codigo);
    if (!lic) return { ok: false, msg: "Licencia inválida, inactiva o vencida." };
    const r = await asegurarCuentaSeguraDueno((usuario || "").trim() || "dueno", pass, codigo);
    if (!r.ok) return { ok: false, msg: r.msg };
    setLicenseCode(codigo);
    localStorage.setItem("nyc_pizza_codigo", codigo);
    const d = await cloudLoad(codigo);
    if (d && (d.products || d.tenantConfig)) { hydrate(d); }
    else { await cloudSave(codigo, snapshot()); } // primera vez: subimos lo local
    setIsAdminAuthenticated(true);
    triggerNotification("Acceso Autorizado", "Bienvenido al panel de tu local.", "success");
    return { ok: true };
  };

  const loginColab = async (codigo: string, usuario: string, pass: string): Promise<{ ok: boolean; msg?: string }> => {
    codigo = (codigo || "").trim().toUpperCase();
    const lic = await validarLicencia(codigo);
    if (!lic) return { ok: false, msg: "Licencia inválida." };
    const r = await asegurarCuentaSeguraColab((usuario || "").trim(), pass, codigo);
    if (!r.ok) return { ok: false, msg: r.msg };
    setLicenseCode(codigo);
    localStorage.setItem("nyc_pizza_codigo", codigo);
    const d = await cloudLoad(codigo);
    if (d) hydrate(d);
    setIsAdminAuthenticated(true);
    triggerNotification("Acceso de Colaborador", "Ingresaste al panel del local.", "success");
    return { ok: true };
  };

  const logout = () => {
    signOutGlobal();
    setIsAdminAuthenticated(false);
    setLicenseCode("");
    localStorage.removeItem("nyc_pizza_codigo");
  };

  // Auto-guardado en la nube (con debounce) cuando cambian los datos sincronizados
  useEffect(() => {
    if (!licenseCode || !isAdminAuthenticated || hydratingRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => { cloudSave(licenseCode, snapshot()); }, 1200);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [products, categories, orders, comments, tenantConfig, collaborators, selectedThemeId, licenseCode, isAdminAuthenticated]);

  // Restaurar sesión al abrir (si había código guardado y la sesión sigue válida).
  // No aplica en la vista pública (?codigo=).
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("codigo")) return;
    const cod = localStorage.getItem("nyc_pizza_codigo");
    if (cod && estaLogueado()) {
      setLicenseCode(cod);
      setIsAdminAuthenticated(true);
      cloudLoad(cod).then((d) => { if (d) hydrate(d); });
    }
  }, []);

  // Vista pública por ?codigo=: carga el catálogo del local desde la nube + live-sync (30s).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = (params.get("codigo") || params.get("local") || "").trim().toUpperCase();
    if (!code) return;
    setPublicCode(code);
    let lastVer = "";
    const cargar = async () => {
      const d = await pizzaPublica(code);
      if (!d) return;
      hydratingRef.current = true;
      if (d.products) setProducts(d.products);
      if (d.categories) setCategories(d.categories);
      if (d.tenantConfig) setTenantConfig(d.tenantConfig);
      if (d.comments) setComments(d.comments);
      if (d.selectedThemeId && THEMES[d.selectedThemeId as NYThemeStyle]) setSelectedThemeId(d.selectedThemeId as NYThemeStyle);
      setTimeout(() => { hydratingRef.current = false; }, 300);
    };
    cargar();
    const iv = setInterval(async () => {
      const ver = await pizzaVersion(code);
      if (!ver || ver === lastVer) return;
      lastVer = ver;
      cargar();
    }, 30000);
    return () => clearInterval(iv);
  }, []);

  // Panel: live-sync liviano (trae pedidos/opiniones nuevas sin pisar lo que edita el admin).
  useEffect(() => {
    if (!licenseCode || !isAdminAuthenticated) return;
    let lastVer = "";
    const iv = setInterval(async () => {
      if (hydratingRef.current) return;
      const ver = await pizzaVersion(licenseCode);
      if (!ver || ver === lastVer) return;
      lastVer = ver;
      const d = await cloudLoad(licenseCode);
      if (!d) return;
      hydratingRef.current = true;
      if (Array.isArray(d.orders)) {
        setOrders((prev) => {
          const ids = new Set(prev.map((o) => o.id));
          const nuevos = (d.orders as any[]).filter((o) => !ids.has(o.id));
          if (!nuevos.length) return prev;
          triggerNotification("¡Nuevo pedido!", `Entró ${nuevos.length} pedido(s) nuevo(s).`, "success");
          const merged = [...nuevos, ...prev];
          saveStateToLocal("nyc_pizza_orders", merged);
          return merged;
        });
      }
      if (Array.isArray(d.comments)) {
        setComments((prev) => {
          const ids = new Set(prev.map((c) => c.id));
          const nuevos = (d.comments as any[]).filter((c) => !ids.has(c.id));
          if (!nuevos.length) return prev;
          const merged = [...nuevos, ...prev];
          saveStateToLocal("nyc_pizza_comments", merged);
          return merged;
        });
      }
      setTimeout(() => { hydratingRef.current = false; }, 300);
    }, 30000);
    return () => clearInterval(iv);
  }, [licenseCode, isAdminAuthenticated]);

  return (
    <PizzaContext.Provider value={{
      products,
      categories,
      orders,
      comments,
      tenantConfig,
      backups,
      currentTheme,
      selectedThemeId,
      cart,
      notifications,
      setTheme,
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      deleteCategory,
      addOrder,
      updateOrderStatus,
      addComment,
      replyComment,
      approveComment,
      deleteComment,
      updateTenantConfig,
      triggerNotification,
      clearNotifications,
      addToCart,
      removeFromCart,
      clearCart,
      createBackup,
      restoreBackup,
      deleteBackup,
      clearInventoryAndSales,
      isAdminAuthenticated,
      setIsAdminAuthenticated,
      licenseCode,
      publicCode,
      loginDueno,
      loginColab,
      logout,
      collaborators,
      addCollaborator,
      updateCollaborator,
      deleteCollaborator,
      logoutCollaborator,
      requestCollaboratorLogin,
      approveCollaboratorLogin,
      rejectCollaboratorLogin
    }}>
      {children}
    </PizzaContext.Provider>
  );
};

export const usePizza = () => {
  const context = useContext(PizzaContext);
  if (!context) {
    throw new Error("usePizza must be used within a PizzaProvider");
  }
  return context;
};
