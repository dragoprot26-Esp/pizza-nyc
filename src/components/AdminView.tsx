/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { usePizza } from "../context/PizzaContext";
import { Product, Order, OrderStatus, Comment, CustomField, Backup, Collaborator } from "../types";
import { PatternLock } from "./PatternLock";
import { comprimirImagen } from "../img";
import { 
  BarChart3, 
  Plus, 
  Minus, 
  Download, 
  Trash2, 
  Save, 
  QrCode, 
  LogOut, 
  Check, 
  X,
  FileSpreadsheet, 
  FileText, 
  Clock, 
  Settings, 
  ShieldCheck, 
  Package, 
  User, 
  Lock, 
  Smartphone,
  Eye,
  EyeOff,
  MessageSquare,
  Bell,
  Palette,
  Sparkles,
  Users,
  UserCheck,
  UserX,
  Fingerprint,
  Camera
} from "lucide-react";

interface AdminViewProps {
  onCloseAdmin: () => void;
}

const RealisticQRCode: React.FC<{ size?: number; value?: string }> = ({ size = 160, value }) => {
  const [loading, setLoading] = useState(true);
  const qrUrl = value || window.location.origin;
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&color=000000&bgcolor=FFFFFF&data=${encodeURIComponent(qrUrl)}&qzone=1`;

  return (
    <div className="relative flex items-center justify-center mx-auto bg-white rounded-xl overflow-hidden" style={{ width: size, height: size }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={qrCodeApiUrl}
        alt={`Código QR para ${qrUrl}`}
        width={size}
        height={size}
        style={{ imageRendering: "pixelated" }}
        className="object-contain"
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)}
      />
    </div>
  );
};

export const AdminView: React.FC<AdminViewProps> = ({ onCloseAdmin }) => {
  const {
    products,
    categories,
    orders,
    comments,
    tenantConfig,
    backups,
    currentTheme,
    selectedThemeId,
    setTheme,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
    updateOrderStatus,
    replyComment,
    approveComment,
    deleteComment,
    updateTenantConfig,
    createBackup,
    restoreBackup,
    deleteBackup,
    triggerNotification,
    clearInventoryAndSales,
    notifications,
    clearNotifications,
    isAdminAuthenticated: isAuthenticated,
    setIsAdminAuthenticated: setIsAuthenticated,
    collaborators,
    addCollaborator,
    updateCollaborator,
    deleteCollaborator,
    logoutCollaborator,
    requestCollaboratorLogin,
    approveCollaboratorLogin,
    rejectCollaboratorLogin,
    loginDueno,
    logout,
    licenseCode
  } = usePizza();

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const publicUrl = licenseCode ? `${window.location.origin}/?codigo=${licenseCode}` : window.location.origin;

  // Authentication states
  const [licenseInput, setLicenseInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Local state to enable emptying inventory and sales history
  const [isResetEnabled, setIsResetEnabled] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  
  // Biometrics simulation enrollment
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [savedPattern, setSavedPattern] = useState("0-1-2-5");
  const [savedPin, setSavedPin] = useState("1234");
  const [useBiometricsToUnlock, setUseBiometricsToUnlock] = useState(false);
  const [isVerifyingBiometrics, setIsVerifyingBiometrics] = useState(false);

  // Active Admin Tabs
  const [activeTab, setActiveTab] = useState<"productos" | "encargos" | "dashboard" | "comentarios" | "configuracion" | "tema" | "colaboradores">("productos");

  // product management states
  const [newProdName, setNewProdName] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("");
  const [newProdImage, setNewProdImage] = useState("");
  const [newProdCustomFields, setNewProdCustomFields] = useState<CustomField[]>([]);
  const [customFieldLabel, setCustomFieldLabel] = useState("");
  const [customFieldPrice, setCustomFieldPrice] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // category input
  const [newCategoryInput, setNewCategoryInput] = useState("");

  // Comment management stats
  const pendingComments = comments.filter(c => c.status === "pending");
  const [replyInputs, setReplyInputs] = useState<{ [commentId: string]: string }>({});

  // Profile configuration states
  const [profileName, setProfileName] = useState(tenantConfig.name);
  const [profilePhone, setProfilePhone] = useState(tenantConfig.phone);
  const [profileEmail, setProfileEmail] = useState(tenantConfig.email);
  const [profilePassword, setProfilePassword] = useState(tenantConfig.passwordHash);
  const [profileAddress, setProfileAddress] = useState(tenantConfig.address || "");
  const [profileMapUrl, setProfileMapUrl] = useState(tenantConfig.mapUrl || "");
  const [profileLanguage, setProfileLanguage] = useState<"es" | "en">(tenantConfig.language || "es");
  const [profilePhonePrefix, setProfilePhonePrefix] = useState(tenantConfig.phonePrefix || "+549");
  const [profileEnableShipping, setProfileEnableShipping] = useState(tenantConfig.enableShipping !== false);

  // Page Theme configuration states
  const [themeBadge, setThemeBadge] = useState(tenantConfig.headerBadge || "Estilo Nueva York");
  const [themeSubtitle, setThemeSubtitle] = useState(tenantConfig.headerSubtitle || "The Real Industrial Taste of Brooklyn");
  const [themeFont, setThemeFont] = useState(tenantConfig.headerFont || "font-sans");
  const [themeColorNeon, setThemeColorNeon] = useState(tenantConfig.headerColorNeon || "none");
  const [themeTitleSize, setThemeTitleSize] = useState(tenantConfig.headerTitleSize || "text-4xl md:text-6xl");
  const [themeHeaderImage, setThemeHeaderImage] = useState(tenantConfig.headerImage || "");

  // Password reset countdown simulation
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetCodeInput, setResetCodeInput] = useState("");
  const [generatedResetCode, setGeneratedResetCode] = useState("");
  const [resetTimer, setResetTimer] = useState(0);
  const [newPasswordValue, setNewPasswordValue] = useState("");

  // Print QR flyer modal
  const [showQRModal, setShowQRModal] = useState(false);

  // Collaborators form states
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
  const [collabName, setCollabName] = useState("");
  const [collabPhone, setCollabPhone] = useState("");
  const [collabPin, setCollabPin] = useState("");
  const [collabImage, setCollabImage] = useState("");

  // Collaborator login flow states
  const [activeLoginType, setActiveLoginType] = useState<"owner" | "collaborator">("owner");
  const [selectedCollabId, setSelectedCollabId] = useState("");
  const [collabPinInput, setCollabPinInput] = useState("");
  const [waitingForApprovalCollabId, setWaitingForApprovalCollabId] = useState<string | null>(null);
  const [loggedInCollaborator, setLoggedInCollaborator] = useState<Collaborator | null>(null);

  // Load profile inputs
  useEffect(() => {
    setProfileName(tenantConfig.name);
    setProfilePhone(tenantConfig.phone);
    setProfileEmail(tenantConfig.email);
    setProfilePassword(tenantConfig.passwordHash);
    setProfileAddress(tenantConfig.address || "");
    setProfileMapUrl(tenantConfig.mapUrl || "");
    setProfileLanguage(tenantConfig.language || "es");
    setProfilePhonePrefix(tenantConfig.phonePrefix || "+549");
    setProfileEnableShipping(tenantConfig.enableShipping !== false);

    setThemeBadge(tenantConfig.headerBadge || "Estilo Nueva York");
    setThemeSubtitle(tenantConfig.headerSubtitle || "The Real Industrial Taste of Brooklyn");
    setThemeFont(tenantConfig.headerFont || "font-sans");
    setThemeColorNeon(tenantConfig.headerColorNeon || "none");
    setThemeTitleSize(tenantConfig.headerTitleSize || "text-4xl md:text-6xl");
    setThemeHeaderImage(tenantConfig.headerImage || "");
  }, [tenantConfig]);

  // Poll/Check collaborator session approval
  useEffect(() => {
    if (!waitingForApprovalCollabId) return;

    const interval = setInterval(() => {
      const found = collaborators.find(c => c.id === waitingForApprovalCollabId);
      if (found) {
        if (found.sessionActive) {
          // Approved!
          setLoggedInCollaborator(found);
          setIsAuthenticated(true);
          setWaitingForApprovalCollabId(null);
          triggerNotification("Sesión Autorizada", `Ingresaste como ${found.name}.`, "success");
          clearInterval(interval);
        } else if (!found.loginRequestPending) {
          // Denied/rejected by owner
          setWaitingForApprovalCollabId(null);
          alert("Tu solicitud de ingreso fue rechazada por el propietario.");
          clearInterval(interval);
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [waitingForApprovalCollabId, collaborators]);

  // Force logout collaborator if session terminated by owner
  useEffect(() => {
    if (!loggedInCollaborator) return;
    
    const currentRecord = collaborators.find(c => c.id === loggedInCollaborator.id);
    if (currentRecord && !currentRecord.sessionActive) {
      setLoggedInCollaborator(null);
      setIsAuthenticated(false);
      triggerNotification("Sesión Inalámbrica Finalizada", "Tu sesión fue cerrada de forma remota por seguridad.", "warning");
      alert("Tu sesión inalámbrica fue cerrada por el propietario.");
    }
  }, [collaborators, loggedInCollaborator]);

  // Restrict collaborator tabs to authorized views only
  useEffect(() => {
    if (loggedInCollaborator) {
      if (activeTab !== "productos" && activeTab !== "encargos" && activeTab !== "comentarios") {
        setActiveTab("productos");
      }
    }
  }, [loggedInCollaborator, activeTab]);

  // Timer countdown
  useEffect(() => {
    let interval: any;
    if (resetTimer > 0) {
      interval = setInterval(() => {
        setResetTimer(prev => prev - 1);
      }, 1000);
    } else if (resetTimer === 0 && isResettingPassword) {
      setIsResettingPassword(false);
      setGeneratedResetCode("");
      triggerNotification("Código expirado", "El código de reinicio de 5 minutos ha expirado.", "warning");
    }
    return () => clearInterval(interval);
  }, [resetTimer, isResettingPassword]);

  // LOGIN ACTIONS
  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    if (!licenseInput.trim() || !passwordInput) {
      alert("Ingresá tu código de licencia y tu contraseña (mínimo 6 caracteres).");
      return;
    }
    setIsLoggingIn(true);
    try {
      const r = await loginDueno(licenseInput, usernameInput, passwordInput);
      if (!r.ok) {
        alert(r.msg || "No se pudo iniciar sesión.");
      } else {
        setPasswordInput("");
      }
    } catch (err: any) {
      alert("Error de conexión al iniciar sesión. Probá de nuevo.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleBiometricsSuccess = () => {
    setIsAuthenticated(true);
    setIsVerifyingBiometrics(false);
    triggerNotification("Acceso Biométrico", "Identidad verificada mediante PWA Mobile.", "success");
  };

  // IMAGE UPLOADER HANDLER (Reads local client files as Base64)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: "product" | "header") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxLado = target === "header" ? 1400 : 1000;
    comprimirImagen(file, maxLado, 0.72).then((base64String) => {
      if (!base64String) return;
      if (target === "product") {
        if (editingProduct) {
          setEditingProduct({ ...editingProduct, image: base64String });
        } else {
          setNewProdImage(base64String);
        }
      } else {
        updateTenantConfig({ headerImage: base64String });
        triggerNotification("Imagen de Cabecera", "Se cargó una nueva imagen de fondo.", "success");
      }
    });
  };

  // PRODUCT OPERATIONS
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice || !newProdCategory) return;

    const parsedPrice = parseFloat(newProdPrice);
    addProduct({
      name: newProdName,
      description: newProdDesc,
      price: parsedPrice,
      category: newProdCategory,
      image: newProdImage || "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400",
      customFields: newProdCustomFields
    });

    // Reset inputs
    setNewProdName("");
    setNewProdDesc("");
    setNewProdPrice("");
    setNewProdCategory("");
    setNewProdImage("");
    setNewProdCustomFields([]);
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduct(editingProduct);
    setEditingProduct(null);
  };

  const addCustomFieldToProduct = () => {
    if (!customFieldLabel || !customFieldPrice) return;
    const item: CustomField = {
      label: customFieldLabel,
      price: parseFloat(customFieldPrice)
    };
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        customFields: [...(editingProduct.customFields || []), item]
      });
    } else {
      setNewProdCustomFields(prev => [...prev, item]);
    }
    setCustomFieldLabel("");
    setCustomFieldPrice("");
  };

  const removeCustomFieldFromProduct = (index: number) => {
    if (editingProduct) {
      const updated = [...(editingProduct.customFields || [])].filter((_, i) => i !== index);
      setEditingProduct({ ...editingProduct, customFields: updated });
    } else {
      setNewProdCustomFields(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleAddCategory = () => {
    if (!newCategoryInput.trim()) return;
    addCategory(newCategoryInput.trim());
    setNewCategoryInput("");
  };

  // PASSWORD RESET IN 5 MINUTES
  const handleInitiatePasswordReset = () => {
    if (!profileEmail.includes("@")) {
      alert("Por favor ingresa un formato de email válido.");
      return;
    }
    // Generate a 6 digit pin
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedResetCode(code);
    setIsResettingPassword(true);
    setResetTimer(300); // 5 minutes = 300 seconds

    // Alert or trigger notification showing the simulation code
    triggerNotification(
      "Código de Seguridad", 
      `Simulación: Código enviado a ${profileEmail}: ${code}. Expira en 5 minutos.`, 
      "info"
    );
    alert(`Se ha enviado un código de cambio de contraseña a tu email ${profileEmail}.\nCódigo de simulación: ${code}\nIngrésalo abajo.`);
  };

  const handleVerifyPasswordReset = () => {
    if (resetCodeInput !== generatedResetCode) {
      alert("Código de seguridad incorrecto.");
      return;
    }
    if (!newPasswordValue) {
      alert("Ingresa la nueva contraseña.");
      return;
    }

    // Save
    updateTenantConfig({ passwordHash: newPasswordValue });
    setIsResettingPassword(false);
    setGeneratedResetCode("");
    setResetTimer(0);
    setNewPasswordValue("");
    setResetCodeInput("");

    alert("Cambio Hechos. Sesión cerrada para ingresar con tu nueva contraseña.");
    logout();
  };

  // BIOMETRICS REGISTRATION
  const handleSaveBiometricsEnrollment = (pattern: string, pin: string) => {
    setSavedPattern(pattern);
    setSavedPin(pin);
    setBiometricsEnabled(true);
    setUseBiometricsToUnlock(true);
    triggerNotification("Biometría Vinculada", "Huella y Patrón configurados para el inicio rápido.", "success");
  };

  // EXPORT TO EXCEL/CSV - HISTORY OF DELIVERIES
  const downloadOrdersHistoryCSV = () => {
    let csvContent = "\uFEFF"; // Prepend UTF-8 BOM for Excel Spanish compatibility
    // Header
    csvContent += "\"DATOS DEL LOCAL,ADMINISTRACION\"\n";
    csvContent += `"Local,${tenantConfig.name.replace(/"/g, '""')}"\n`;
    csvContent += `"Email,${tenantConfig.email.replace(/"/g, '""')}"\n`;
    csvContent += `"Telefono,${tenantConfig.phone.replace(/"/g, '""')}"\n`;
    csvContent += "\n";
    csvContent += "\"HISTORIAL DE ENCARGOS\"\n";
    csvContent += "Codigo,Cliente,Telefono,Direccion,Metodo Pago,Estado,Total,Fecha\n";

    orders.forEach(o => {
      const formattedDate = new Date(o.timestamp).toLocaleDateString();
      const escapedCode = o.code.replace(/"/g, '""');
      const escapedName = o.name.replace(/"/g, '""');
      const escapedPhone = o.phone.replace(/"/g, '""');
      const escapedAddress = o.address.replace(/"/g, '""');
      const escapedPayment = o.paymentMethod.replace(/"/g, '""');
      const escapedStatus = o.status.replace(/"/g, '""');
      const escapedDate = formattedDate.replace(/"/g, '""');
      
      csvContent += `"${escapedCode}","${escapedName}","${escapedPhone}","${escapedAddress}","${escapedPayment}","${escapedStatus}",${o.total.toFixed(2)},"${escapedDate}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `historial_encargos_nyc_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Enable the options to clear inventory and history as requested
    setIsResetEnabled(true);
    triggerNotification("Planilla de Encargos Descargada", "Opción de vaciar inventario/historial habilitada.", "info");
  };

  // EXPORT TO EXCEL/CSV - DASHBOARD PRODUCTS LIST
  const downloadProductsSoldCSV = () => {
    let csvContent = "\uFEFF"; // Prepend UTF-8 BOM for Excel Spanish compatibility
    
    // Header format requested: First column local info
    csvContent += "\"DATOS DEL LOCAL,ADMINISTRACION\"\n";
    csvContent += `"Local,${tenantConfig.name.replace(/"/g, '""')}"\n`;
    csvContent += `"Email,${tenantConfig.email.replace(/"/g, '""')}"\n`;
    csvContent += `"Telefono,${tenantConfig.phone.replace(/"/g, '""')}"\n`;
    csvContent += "\n";
    
    // Columns row
    csvContent += "CODIGO,PRODUCTO,CATEGORIA,CATEGORIA,DETALLE,PRECIO BASE\n";
    
    products.forEach(p => {
      const firstCommaIndex = p.description.indexOf(",");
      let subcat = "";
      let detail = p.description;
      if (firstCommaIndex !== -1) {
        subcat = p.description.substring(0, firstCommaIndex).trim();
        detail = p.description.substring(firstCommaIndex + 1).trim();
      }

      const escapedId = p.id.replace(/"/g, '""');
      const escapedName = p.name.replace(/"/g, '""');
      const escapedCategory = p.category.replace(/"/g, '""');
      const escapedSubcat = subcat.replace(/"/g, '""');
      const escapedDetail = detail.replace(/"/g, '""');

      csvContent += `"${escapedId}","${escapedName}","${escapedCategory}","${escapedSubcat}","${escapedDetail}",${p.price.toFixed(2)}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `inventario_nyc_pizza_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Enable the options to clear inventory and history as requested
    setIsResetEnabled(true);
    triggerNotification("Planilla de Productos Descargada", "Opción de vaciar inventario/historial habilitada.", "info");
  };

  // SIMULATE PDF PRINT SHEET DOWNLOAD FOR DASHBOARD OR QR FLYER
  const handlePrintPDFFlyer = () => {
    window.print();
    setIsResetEnabled(true);
  };

  // Collaborators Action Handlers
  const handleSaveCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collabName || !collabPhone || !collabPin) {
      triggerNotification("Error", "Por favor completa todos los campos requeridos.", "warning");
      return;
    }

    if (editingCollaborator) {
      updateCollaborator({
        ...editingCollaborator,
        name: collabName,
        phone: collabPhone,
        pin: collabPin,
        image: collabImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
      });
    } else {
      addCollaborator({
        name: collabName,
        phone: collabPhone,
        pin: collabPin,
        image: collabImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
      });
    }
    
    // Reset inputs
    setEditingCollaborator(null);
    setCollabName("");
    setCollabPhone("");
    setCollabPin("");
    setCollabImage("");
  };

  const handleEditCollaboratorClick = (c: any) => {
    setEditingCollaborator(c);
    setCollabName(c.name);
    setCollabPhone(c.phone);
    setCollabPin(c.pin);
    setCollabImage(c.image);
  };

  const handleCollaboratorImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCollabImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCollaboratorLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollabId) {
      alert("Por favor selecciona tu usuario de colaborador.");
      return;
    }

    const found = collaborators.find(c => c.id === selectedCollabId);
    if (!found) return;

    if (found.pin !== collabPinInput) {
      alert("PIN de credencial incorrecto.");
      return;
    }

    // PIN is correct, now request approval from tenant
    setWaitingForApprovalCollabId(found.id);
    await requestCollaboratorLogin(found.id, false);
  };

  const handleCollaboratorBiometricLoginSubmit = async (collabId: string) => {
    const found = collaborators.find(c => c.id === collabId);
    if (!found) return;
    
    // Simulate biometric confirmation popup
    const confirmBio = window.confirm(`¿Deseas autenticarte usando Huella / Rostro (Biometría simulada) para el colaborador ${found.name}?`);
    if (confirmBio) {
      setWaitingForApprovalCollabId(found.id);
      await requestCollaboratorLogin(found.id, true);
    }
  };

  // DASHBOARD CALCULATIONS
  const totalRevenue = orders.reduce((sum, o) => o.status !== OrderStatus.CANCELLED ? sum + o.total : sum, 0);
  const totalCount = orders.length;
  const pendingCount = orders.filter(o => o.status === OrderStatus.PENDING).length;
  const deliveredCount = orders.filter(o => o.status === OrderStatus.DELIVERED).length;

  return (
    <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text} ${currentTheme.fontFamily} transition-all duration-300 pb-12`}>
      
      {/* HEADER BAR */}
      <header className={`p-4 bg-black border-b ${currentTheme.border} flex items-center justify-between print:hidden`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-600/20 rounded-xl text-yellow-500">
            {loggedInCollaborator ? (
              <img src={loggedInCollaborator.image} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest uppercase">
              {loggedInCollaborator ? `Socio: ${loggedInCollaborator.name}` : "NYC Panel Administrativo"}
            </h1>
            <p className="text-[10px] text-gray-500 uppercase">
              {loggedInCollaborator ? "Sesión Inalámbrica Activa" : "Luigi's Oven Control Center"}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {/* Glowing Notification Center button inside Admin panel */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationCenter(!showNotificationCenter)}
              className="p-2.5 bg-neutral-950 border border-white/5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors relative cursor-pointer flex items-center justify-center h-10 w-10"
              title="Notificaciones"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              )}
            </button>

            {showNotificationCenter && (
              <div className="absolute right-0 mt-2 w-72 bg-neutral-950 border border-white/10 rounded-2xl p-4 shadow-2xl z-50 space-y-3 font-sans normal-case text-xs text-left">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="font-black text-[10px] text-gray-400 uppercase tracking-wider">Notificaciones PWA</span>
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <button 
                        onClick={() => {
                          clearNotifications();
                          setShowNotificationCenter(false);
                        }} 
                        className="text-[9px] font-black uppercase text-red-500 hover:text-red-400 tracking-wider cursor-pointer"
                      >
                        Limpiar
                      </button>
                    )}
                    <button onClick={() => setShowNotificationCenter(false)} className="text-gray-600 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`p-3 rounded-xl border text-[11px] ${
                        notif.type === "success" 
                          ? "bg-green-500/10 border-green-500/20 text-green-300" 
                          : notif.type === "warning"
                          ? "bg-red-500/10 border-red-500/20 text-red-300"
                          : "bg-blue-500/10 border-blue-500/20 text-blue-300"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <p className="font-black leading-tight">{notif.title}</p>
                        <span className="text-[8px] text-gray-500">{notif.timestamp}</span>
                      </div>
                      <p className="text-[10px] mt-1 leading-snug">{notif.message}</p>
                    </div>
                  ))}

                  {notifications.length === 0 && (
                    <p className="text-[10px] text-gray-500 text-center py-4">Sin notificaciones recientes.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {isAuthenticated && (
            <button
              onClick={() => {
                if (loggedInCollaborator) {
                  logoutCollaborator(loggedInCollaborator.id);
                  setLoggedInCollaborator(null);
                }
                logout();
              }}
              className="p-2.5 bg-neutral-900 hover:bg-red-600/20 text-gray-400 hover:text-red-500 rounded-xl transition-colors flex items-center gap-2 text-xs font-bold uppercase cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Salir {loggedInCollaborator ? `(${loggedInCollaborator.name})` : ""}</span>
            </button>
          )}
          <button 
            onClick={onCloseAdmin}
            className="p-2.5 bg-neutral-950 border border-white/5 rounded-xl hover:bg-white/5 text-xs font-black uppercase tracking-widest text-white cursor-pointer"
          >
            Vista Tienda
          </button>
        </div>
      </header>

      {/* ------------------ AUTHENTICATION BLOCK ------------------ */}
      {!isAuthenticated && (
        <main className="max-w-md mx-auto px-6 py-16 print:hidden">
          {waitingForApprovalCollabId ? (
            <div className="p-8 bg-[#111] rounded-3xl border border-white/10 shadow-2xl space-y-6 text-center">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
                <ShieldCheck className="w-8 h-8 text-red-500 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Verificación de Seguridad</h3>
                <p className="text-xs text-gray-400">Esperando que el inquilino (propietario) apruebe tu ingreso en tiempo real por seguridad...</p>
              </div>
              <div className="p-4 bg-black/50 border border-white/5 rounded-2xl flex items-center gap-3 justify-center">
                <img 
                  src={collaborators.find(c => c.id === waitingForApprovalCollabId)?.image} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full object-cover" 
                />
                <span className="text-xs font-black text-white">
                  {collaborators.find(c => c.id === waitingForApprovalCollabId)?.name}
                </span>
              </div>
              <button
                onClick={() => {
                  rejectCollaboratorLogin(waitingForApprovalCollabId);
                  setWaitingForApprovalCollabId(null);
                }}
                className="text-[10px] bg-white/5 text-gray-400 px-4 py-2 rounded-xl border border-white/5 hover:bg-white/10 font-black uppercase tracking-widest cursor-pointer"
              >
                Cancelar Solicitud
              </button>
            </div>
          ) : isVerifyingBiometrics && useBiometricsToUnlock ? (
            <div className="p-6 bg-[#111] rounded-3xl border border-white/10 space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-center text-red-500">PWA Desbloqueo Biométrico</h3>
              <PatternLock 
                mode="verify" 
                storedPattern={savedPattern} 
                storedPin={savedPin} 
                onSuccess={handleBiometricsSuccess} 
                onCancel={() => setIsVerifyingBiometrics(false)}
              />
            </div>
          ) : (
            <div className="p-8 bg-[#111] rounded-3xl border border-white/10 shadow-2xl space-y-6">
              <div className="text-center">
                <span className="p-3 bg-red-600/20 text-red-500 rounded-full inline-block mb-3">
                  <ShieldCheck className="w-8 h-8" />
                </span>
                <h2 className="text-xl font-black uppercase tracking-tight text-white">Ingreso de Personal</h2>
                <p className="text-xs text-gray-500 uppercase mt-1">Verificar Credenciales</p>
              </div>

              {/* LOGIN TYPE TABS */}
              <div className="flex bg-black/60 p-1 rounded-xl border border-white/5 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveLoginType("owner");
                    setCollabPinInput("");
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeLoginType === "owner" ? "bg-red-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Inquilino / Dueño
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveLoginType("collaborator");
                    setLicenseInput("");
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeLoginType === "collaborator" ? "bg-red-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Colaborador
                </button>
              </div>

              {activeLoginType === "owner" ? (
                <form onSubmit={handleStandardLogin} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 block mb-1.5">Código de Licencia</label>
                    <input
                      type="text"
                      required
                      value={licenseInput}
                      onChange={(e) => setLicenseInput(e.target.value)}
                      placeholder="NYC-FREE-2026"
                      className="w-full text-xs font-black p-3 bg-black border border-white/10 text-white rounded-xl focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 block mb-1.5">Usuario o Email</label>
                    <input
                      type="text"
                      required
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="luigi o luigi@pizzanyc.com"
                      className="w-full text-xs p-3 bg-black border border-white/10 text-white rounded-xl focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 block mb-1.5">Contraseña</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs p-3 bg-black border border-white/10 text-white rounded-xl focus:outline-none focus:border-red-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-500 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer"
                  >
                    Verificar Credenciales
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCollaboratorLoginSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 block mb-1.5">Selecciona tu Usuario</label>
                    {collaborators.length === 0 ? (
                      <p className="text-[10px] text-gray-400 italic text-center py-2 bg-black/40 border border-white/5 rounded-xl">
                        No hay colaboradores creados por el inquilino aún.
                      </p>
                    ) : (
                      <select
                        value={selectedCollabId}
                        onChange={(e) => setSelectedCollabId(e.target.value)}
                        className="w-full text-xs p-3 bg-black border border-white/10 text-white rounded-xl focus:outline-none focus:border-red-600"
                        required
                      >
                        <option value="">-- Selecciona tu perfil --</option>
                        {collaborators.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {selectedCollabId && (
                    <div className="p-3 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img 
                          src={collaborators.find(c => c.id === selectedCollabId)?.image} 
                          alt="Profile" 
                          className="w-8 h-8 rounded-full object-cover" 
                        />
                        <span className="text-xs text-white font-black">
                          {collaborators.find(c => c.id === selectedCollabId)?.name}
                        </span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleCollaboratorBiometricLoginSubmit(selectedCollabId)}
                        className="flex items-center gap-1 bg-red-600/10 text-red-400 px-2 py-1.5 rounded-lg border border-red-500/20 text-[9px] font-bold uppercase hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                      >
                        <Fingerprint className="w-3.5 h-3.5 text-red-500" />
                        Simular Biometría
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 block mb-1.5">PIN Credencial</label>
                    <input
                      type="password"
                      maxLength={8}
                      required
                      value={collabPinInput}
                      onChange={(e) => setCollabPinInput(e.target.value)}
                      placeholder="Ej. 1234"
                      className="w-full text-xs p-3 bg-black border border-white/10 text-white rounded-xl focus:outline-none focus:border-red-600 font-mono text-center tracking-widest text-lg"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={collaborators.length === 0}
                    className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer"
                  >
                    Solicitar Ingreso Inalámbrico
                  </button>
                </form>
              )}

              {biometricsEnabled && activeLoginType === "owner" && (
                <button
                  onClick={() => setIsVerifyingBiometrics(true)}
                  className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-wider rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  Iniciar con Biometría Móvil
                </button>
              )}
            </div>
          )}
        </main>
      )}

      {/* ------------------ ACTIVE ADMINISTRATIVE PANEL ------------------ */}
      {isAuthenticated && (
        <main className="max-w-7xl mx-auto px-6 py-8 print:hidden">
          
          {/* ADMINISTRATIVE PESTAÑAS */}
          <div className="flex bg-[#111] p-1.5 rounded-2xl border border-white/10 gap-1 overflow-x-auto mb-8">
            {[
              { id: "productos", label: "Productos", icon: Package },
              { id: "encargos", label: "Encargos", icon: Clock, count: orders.filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED).length },
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "comentarios", label: "Comentarios", icon: MessageSquare, count: pendingComments.length },
              { id: "colaboradores", label: "Colaboradores", icon: Users, count: collaborators.filter(c => c.loginRequestPending).length },
              { id: "tema", label: "Tema Página", icon: Palette },
              { id: "configuracion", label: "Configuración", icon: Settings }
            ].filter(tab => {
              if (loggedInCollaborator) {
                return ["productos", "encargos", "comentarios"].includes(tab.id);
              }
              return true;
            }).map(tab => {
              const TabIcon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-red-600 text-white shadow-lg" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="bg-white text-black text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ------------------ TAB 1: PRODUCTOS & CATEGORIES ------------------ */}
          {activeTab === "productos" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Product creator / Editor */}
              <div className="p-6 rounded-3xl bg-[#111] border border-white/10 space-y-6 h-fit">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <h3 className="text-sm font-black uppercase tracking-wider text-red-500">
                    {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                  </h3>
                  {editingProduct && (
                    <button 
                      onClick={() => setEditingProduct(null)}
                      className="text-[10px] bg-white/5 px-2 py-1 rounded hover:bg-white/10"
                    >
                      Nuevo
                    </button>
                  )}
                </div>

                <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-4 text-xs font-medium">
                  {/* Category dropdown */}
                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">Categoría</label>
                    <select
                      required
                      value={editingProduct ? editingProduct.category : newProdCategory}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (editingProduct) setEditingProduct({ ...editingProduct, category: val });
                        else setNewProdCategory(val);
                      }}
                      className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-red-600"
                    >
                      <option value="">Seleccionar categoría...</option>
                      {categories.filter(c => c !== "Todos").map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">Nombre</label>
                    <input
                      type="text"
                      required
                      value={editingProduct ? editingProduct.name : newProdName}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (editingProduct) setEditingProduct({ ...editingProduct, name: val });
                        else setNewProdName(val);
                      }}
                      placeholder="Ej. Pepperoni Brooklyn"
                      className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">Detalle / Ingredientes</label>
                    <textarea
                      required
                      value={editingProduct ? editingProduct.description : newProdDesc}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (editingProduct) setEditingProduct({ ...editingProduct, description: val });
                        else setNewProdDesc(val);
                      }}
                      placeholder="Ej. Doble mozzarella, pepperoni..."
                      rows={2}
                      className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-red-600 resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">Precio Base ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editingProduct ? editingProduct.price : newProdPrice}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (editingProduct) setEditingProduct({ ...editingProduct, price: parseFloat(val) || 0 });
                        else setNewProdPrice(val);
                      }}
                      placeholder="18.50"
                      className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-red-600"
                    />
                  </div>

                  {/* Image Local Upload */}
                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">Subir Imagen (PC/Móvil)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "product")}
                      className="w-full p-1 bg-black border border-white/10 rounded-xl text-white text-[10px]"
                    />
                    <p className="text-[8px] text-gray-500 uppercase mt-1">Sube archivos locales. Se guardarán en Base64.</p>
                  </div>

                  {/* CUSTOM EXTRA FIELDS */}
                  <div className="pt-2 border-t border-white/5">
                    <label className="text-[9px] font-black uppercase text-gray-400 block mb-1.5">Campos / Toppings Extra</label>
                    
                    <div className="flex gap-1 mb-2">
                      <input
                        type="text"
                        value={customFieldLabel}
                        onChange={(e) => setCustomFieldLabel(e.target.value)}
                        placeholder="Adicional (Ej. Queso Extra)"
                        className="flex-1 p-2 bg-black border border-white/10 rounded-lg text-[10px]"
                      />
                      <input
                        type="number"
                        step="0.1"
                        value={customFieldPrice}
                        onChange={(e) => setCustomFieldPrice(e.target.value)}
                        placeholder="Precio (Ej. 1.50)"
                        className="w-20 p-2 bg-black border border-white/10 rounded-lg text-[10px]"
                      />
                      <button
                        type="button"
                        onClick={addCustomFieldToProduct}
                        className="px-2.5 bg-yellow-600 text-white rounded-lg text-xs"
                      >
                        +
                      </button>
                    </div>

                    {/* Display registered extras */}
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {((editingProduct ? editingProduct.customFields : newProdCustomFields) || []).map((cf, idx) => (
                        <div key={idx} className="flex justify-between items-center p-1.5 bg-black/50 rounded text-[9px]">
                          <span>{cf.label} (+${cf.price.toFixed(2)})</span>
                          <button
                            type="button"
                            onClick={() => removeCustomFieldFromProduct(idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-red-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingProduct ? "Guardar Cambios" : "Publicar Producto"}</span>
                  </button>
                </form>
              </div>

              {/* Dynamic categories manager and products catalog list */}
              <div className="lg:col-span-2 space-y-6">
                {/* Categories board */}
                <div className="p-5 bg-[#111] rounded-3xl border border-white/10">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4">Administrar Categorías</h3>
                  
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newCategoryInput}
                      onChange={(e) => setNewCategoryInput(e.target.value)}
                      placeholder="Nueva Categoría (Ej. Bebidas, Postres)"
                      className="flex-1 p-2.5 text-xs bg-black border border-white/10 rounded-xl text-white outline-none focus:border-red-600"
                    />
                    <button
                      onClick={handleAddCategory}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-black uppercase rounded-xl"
                    >
                      Añadir (+)
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <div 
                        key={cat} 
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 rounded-full text-xs font-bold text-gray-300"
                      >
                        <span>{cat}</span>
                        {cat !== "Todos" && cat !== "Pizza" && cat !== "Empanadas" && cat !== "Bebidas" && (
                          <button 
                            onClick={() => deleteCategory(cat)}
                            className="text-red-500 hover:text-red-700 text-xs font-black"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Catalog Table */}
                <div className="p-6 bg-[#111] rounded-3xl border border-white/10">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4">Catálogo de Productos ({products.length})</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-400">
                      <thead className="text-[10px] text-gray-500 uppercase tracking-wider border-b border-white/5">
                        <tr>
                          <th className="py-3 px-2">Imagen</th>
                          <th className="py-3 px-2">Producto</th>
                          <th className="py-3 px-2">Categoría</th>
                          <th className="py-3 px-2">Precio</th>
                          <th className="py-3 px-2 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-medium">
                        {products.map(p => (
                          <tr key={p.id} className="hover:bg-white/5">
                            <td className="py-3 px-2">
                              <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-white/5" />
                            </td>
                            <td className="py-3 px-2">
                              <p className="font-black text-white">{p.name}</p>
                              <p className="text-[10px] text-gray-500 truncate max-w-xs">{p.description}</p>
                            </td>
                            <td className="py-3 px-2 uppercase font-bold text-[10px] text-red-500">{p.category}</td>
                            <td className="py-3 px-2 font-black text-white">${p.price.toFixed(2)}</td>
                            <td className="py-3 px-2 text-right space-x-1 shrink-0">
                              <button
                                onClick={() => setEditingProduct(p)}
                                className="px-2 py-1 bg-yellow-600/20 hover:bg-yellow-600 text-yellow-400 hover:text-white rounded text-[10px] font-bold"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => deleteProduct(p.id)}
                                className="px-2 py-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded text-[10px] font-bold"
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ------------------ TAB 2: ENCARGOS / PEDIDOS ------------------ */}
          {activeTab === "encargos" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-[#111] rounded-3xl border border-white/10 gap-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Pedidos Recibidos en Vivo</h3>
                  <p className="text-[10px] text-gray-500 uppercase mt-0.5">Sincronización en tiempo real activa</p>
                </div>
                <button
                  onClick={downloadOrdersHistoryCSV}
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-green-600/10 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Descargar Planilla Historial (.csv)
                </button>
              </div>

              {/* Grid or Table of Active Orders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {orders.map(o => {
                  return (
                    <div key={o.id} className="p-5 rounded-3xl bg-[#111] border border-white/10 flex flex-col justify-between space-y-4">
                      
                      {/* Order Title bar */}
                      <div className="flex justify-between items-start pb-3 border-b border-white/5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">{o.code}</span>
                            <span className="text-[10px] text-gray-500">{new Date(o.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <span className="text-[9px] uppercase tracking-widest text-red-500 font-bold">
                            {o.paymentMethod === "Caja" ? "Retiro en Caja" : "Paga al Recibir"}
                          </span>
                        </div>
                        
                        {/* Status Change Selector */}
                        <select
                          value={o.status}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                          className={`p-1.5 text-[10px] font-black uppercase rounded text-black font-sans ${
                            o.status === OrderStatus.CANCELLED ? "bg-red-500 text-white" :
                            o.status === OrderStatus.DELIVERED ? "bg-green-500 text-black" :
                            "bg-yellow-500 text-black"
                          }`}
                        >
                          {Object.values(OrderStatus).map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>

                      {/* Items details */}
                      <div className="space-y-2 py-1">
                        {o.items.map((item, idx) => (
                          <div key={idx} className="text-xs font-medium">
                            <div className="flex justify-between items-center text-gray-300">
                              <span>{item.quantity}x {item.product.name} ({item.selectedSize})</span>
                              <span className="font-bold text-white">${((item.product.price + item.addedPrice) * item.quantity).toFixed(2)}</span>
                            </div>
                            {item.selectedToppings.length > 0 && (
                              <p className="text-[9px] text-red-400 pl-3">Extras: {item.selectedToppings.join(", ")}</p>
                            )}
                            {item.notes && (
                              <p className="text-[9px] text-gray-500 pl-3 italic">"{item.notes}"</p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Customer Info Card */}
                      <div className="p-3 bg-black/40 rounded-xl space-y-1 text-xs">
                        <p className="text-gray-300 font-black truncate">{o.name}</p>
                        <p className="text-gray-500">Tel: {o.phone}</p>
                        <p className="text-gray-500">Dir: {o.address}</p>
                      </div>

                      {/* Bottom Order Footer */}
                      <div className="flex justify-between items-center pt-3 border-t border-white/5">
                        <span className="text-[10px] text-gray-500 uppercase font-black">Monto Total</span>
                        <span className="text-xl font-black text-green-500">${o.total.toFixed(2)}</span>
                      </div>

                    </div>
                  );
                })}

                {orders.length === 0 && (
                  <div className="col-span-2 text-center p-12 bg-[#111] border border-white/5 rounded-3xl text-gray-500">
                    Aún no hay encargos activos registrados. Los pedidos públicos aparecerán aquí al instante.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------------------ TAB 3: DASHBOARD STATS ------------------ */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              
              {/* Delivery Stats Summary widgets */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Ventas Totales", val: `$${totalRevenue.toFixed(2)}`, desc: "Ventas netas aprobadas", color: "text-green-500" },
                  { label: "Pedidos Totales", val: totalCount, desc: "Frecuencia histórica", color: "text-red-500" },
                  { label: "Pendientes", val: pendingCount, desc: "Esperando en cola", color: "text-yellow-500" },
                  { label: "Completados", val: deliveredCount, desc: "Entregados con éxito", color: "text-blue-500" }
                ].map((stat, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-[#111] border border-white/10 text-center">
                    <span className="text-[10px] text-gray-500 uppercase font-black block mb-1">{stat.label}</span>
                    <span className={`text-2xl font-black block ${stat.color}`}>{stat.val}</span>
                    <span className="text-[9px] text-gray-600 uppercase block mt-1">{stat.desc}</span>
                  </div>
                ))}
              </div>

              {/* Graphic charts section (Custom built beautifully responsive SVG charts) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Chart 1: Revenue trend */}
                <div className="p-6 bg-[#111] rounded-3xl border border-white/10">
                  <h4 className="text-xs font-black uppercase tracking-widest text-white mb-4">Tendencia de Ingresos (Semanal/Mensual)</h4>
                  
                  {/* Custom Line SVG Graph */}
                  <div className="w-full h-48 bg-black/40 rounded-2xl border border-white/5 p-4 flex flex-col justify-between">
                    <div className="flex-1 relative flex items-end">
                      {/* Simulated line */}
                      <svg className="w-full h-full" viewBox="0 0 400 120">
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4"/>
                            <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                        {/* Area */}
                        <path d="M0,100 L50,90 L100,70 L150,85 L200,45 L250,55 L300,20 L350,30 L400,10 L400,120 L0,120 Z" fill="url(#chartGrad)" />
                        {/* Line path */}
                        <path d="M0,100 L50,90 L100,70 L150,85 L200,45 L250,55 L300,20 L350,30 L400,10" fill="none" stroke="#ef4444" strokeWidth="3" />
                        {/* Data dots */}
                        <circle cx="100" cy="70" r="4" fill="#ffffff" stroke="#ef4444" strokeWidth="2" />
                        <circle cx="200" cy="45" r="4" fill="#ffffff" stroke="#ef4444" strokeWidth="2" />
                        <circle cx="300" cy="20" r="4" fill="#ffffff" stroke="#ef4444" strokeWidth="2" />
                        <circle cx="400" cy="10" r="4" fill="#ffffff" stroke="#ef4444" strokeWidth="2" />
                      </svg>
                      {/* Floating tooltip */}
                      <div className="absolute right-4 top-4 text-[9px] bg-red-600/90 text-white font-black uppercase rounded px-2 py-0.5">
                        PICO MÁX: $340.00
                      </div>
                    </div>
                    {/* Labels */}
                    <div className="flex justify-between text-[8px] text-gray-500 uppercase font-bold pt-2 border-t border-white/5">
                      <span>Ene</span>
                      <span>Mar</span>
                      <span>May</span>
                      <span>Jul (Hoy)</span>
                    </div>
                  </div>
                </div>

                {/* Chart 2: Order frequency */}
                <div className="p-6 bg-[#111] rounded-3xl border border-white/10">
                  <h4 className="text-xs font-black uppercase tracking-widest text-white mb-4">Pedidos por Franja Horaria (Anual)</h4>
                  
                  {/* Custom Bar SVG Graph */}
                  <div className="w-full h-48 bg-black/40 rounded-2xl border border-white/5 p-4 flex flex-col justify-between">
                    <div className="flex-1 flex justify-around items-end gap-3 h-full pb-1">
                      {[
                        { label: "12-14hs", height: "45%", count: 12 },
                        { label: "14-18hs", height: "30%", count: 8 },
                        { label: "18-21hs", height: "90%", count: 48 },
                        { label: "21-24hs", height: "75%", count: 32 }
                      ].map((bar, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                          <span className="text-[9px] font-black text-red-500">{bar.count}</span>
                          <div 
                            style={{ height: bar.height }} 
                            className="w-full bg-red-600 rounded-t-lg transition-all duration-500 hover:bg-yellow-500 shadow-[0_0_10px_rgba(220,38,38,0.2)]"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-around text-[8px] text-gray-500 uppercase font-bold pt-2 border-t border-white/5">
                      <span>Almuerzo</span>
                      <span>Tarde</span>
                      <span>Cena</span>
                      <span>Trasnochar</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* PRODUCTS LIST TABLE REPORT */}
              <div className="p-6 bg-[#111] rounded-3xl border border-white/10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-white/5">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">Inventario e Historial de Ventas</h3>
                    <p className="text-[10px] text-gray-500 uppercase mt-0.5">Listado detallado de productos despachados</p>
                  </div>
                  
                  {/* Export Options */}
                  <div className="flex gap-2">
                    <button
                      onClick={downloadProductsSoldCSV}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-[10px] font-black uppercase rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" /> Planilla Calc
                    </button>
                    <button
                      onClick={handlePrintPDFFlyer}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] font-black uppercase rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" /> Descargar PDF
                    </button>
                  </div>
                </div>

                {/* Conditional Reset Option Area */}
                {isResetEnabled ? (
                  <div className="mb-6 p-4 bg-red-950/40 border border-red-500/20 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <p className="text-xs font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5 justify-center sm:justify-start">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                        OPCIÓN DE VACIADO HABILITADA
                      </p>
                      <p className="text-[11px] text-gray-400">Planilla descargada con éxito. Ya puedes vaciar la base de datos de productos e historial de ventas.</p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm("¿Estás completamente seguro de vaciar el catálogo de productos (inventario) y todo el historial de ventas? Esta acción es irreversible.")) {
                          clearInventoryAndSales();
                          setIsResetEnabled(false);
                        }
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-750 text-white text-[10px] font-black uppercase rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                    >
                      <Trash2 className="w-3.5 h-3.5 animate-bounce" /> Vaciar Inventario y Ventas
                    </button>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-neutral-900/50 border border-white/5 rounded-2xl text-center sm:text-left">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">💡 NOTA DE SEGURIDAD</p>
                    <p className="text-[11px] text-gray-400 mt-1">Para habilitar la opción de vaciar el inventario e historial de ventas, primero debes descargar la Planilla de Cálculos (Planilla Calc) o el Reporte PDF como respaldo.</p>
                  </div>
                )}

                {/* Printable Format Content */}
                <div id="printableReport" className="overflow-x-auto">
                  <div className="bg-black/30 p-4 rounded-2xl border border-white/5 mb-4 text-[10px] text-gray-400 space-y-1">
                    <p className="font-black text-white uppercase text-xs">Datos de la Administración del Local</p>
                    <p>Inquilino: {tenantConfig.name}</p>
                    <p>Teléfono: {tenantConfig.phone}</p>
                    <p>Email: {tenantConfig.email}</p>
                    <p>Licencia de Uso: {tenantConfig.licenseKey}</p>
                  </div>

                  <table className="w-full text-left text-xs text-gray-400">
                    <thead className="text-[10px] text-gray-500 uppercase tracking-wider border-b border-white/5">
                      <tr>
                        <th className="py-3 px-2">Código</th>
                        <th className="py-3 px-2">Producto</th>
                        <th className="py-3 px-2">Categoría</th>
                        <th className="py-3 px-2">Precio Base</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium">
                      {products.map(p => (
                        <tr key={p.id} className="hover:bg-white/5">
                          <td className="py-3 px-2 font-mono text-[10px] text-yellow-500">{p.id.toUpperCase()}</td>
                          <td className="py-3 px-2 text-white font-black">{p.name}</td>
                          <td className="py-3 px-2 text-gray-400 uppercase text-[10px]">{p.category}</td>
                          <td className="py-3 px-2 font-black text-white">${p.price.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ------------------ TAB 4: COMENTARIOS / SUGERENCIAS ------------------ */}
          {activeTab === "comentarios" && (
            <div className="space-y-6">
              <div className="p-5 bg-[#111] rounded-3xl border border-white/10">
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Gestión de Opiniones y Sugerencias</h3>
                <p className="text-[10px] text-gray-500 uppercase mt-0.5">Controla las publicaciones de los clientes y responde a sus sugerencias</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comments.map(c => {
                  return (
                    <div 
                      key={c.id} 
                      className={`p-5 rounded-2xl bg-[#111] border flex flex-col justify-between space-y-4 transition-colors ${
                        c.status === "pending" ? "border-yellow-600/30" : "border-white/5"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white">{c.author}</span>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                              c.type === "suggestion" ? "bg-purple-600/30 text-purple-400 border border-purple-500/20" : "bg-blue-600/30 text-blue-400 border border-blue-500/20"
                            }`}>
                              {c.type === "suggestion" ? "Sugerencia Inquilino" : "Comentario Público"}
                            </span>
                          </div>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            c.status === "approved" ? "bg-green-600/20 text-green-400" : "bg-yellow-600 text-black animate-pulse"
                          }`}>
                            {c.status === "approved" ? "Aprobado" : "Pendiente"}
                          </span>
                        </div>
                        <p className="text-xs italic text-gray-400 leading-relaxed">"{c.text}"</p>

                        {/* Existing Reply */}
                        {c.reply ? (
                          <div className="mt-4 p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                            <div className="flex justify-between items-center text-[9px] uppercase font-black text-red-500">
                              <span>Nuestra Respuesta:</span>
                              {c.replyTimestamp && (
                                <span className="text-gray-500 font-mono">{new Date(c.replyTimestamp).toLocaleDateString()}</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-300 font-medium">{c.reply}</p>
                          </div>
                        ) : null}

                        {/* Reply Form */}
                        <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5">
                          <label className="text-[9px] font-black uppercase text-gray-500 block">
                            {c.reply ? "Actualizar Respuesta:" : "Escribir Respuesta:"}
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={replyInputs[c.id] ?? ""}
                              onChange={(e) => setReplyInputs({ ...replyInputs, [c.id]: e.target.value })}
                              placeholder={c.reply ? "Edita tu respuesta..." : "Escribe tu respuesta..."}
                              className="flex-1 p-2 bg-black border border-white/10 rounded-lg text-white text-xs outline-none focus:border-red-600"
                            />
                            <button
                              onClick={() => {
                                const txt = replyInputs[c.id];
                                if (!txt || !txt.trim()) return;
                                replyComment(c.id, txt.trim());
                                setReplyInputs({ ...replyInputs, [c.id]: "" });
                              }}
                              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-black uppercase cursor-pointer shrink-0 transition-colors"
                            >
                              Responder
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-white/5">
                        <span className="text-[9px] text-gray-600">{new Date(c.timestamp).toLocaleString()}</span>
                        <div className="flex gap-1.5">
                          {c.status === "pending" && (
                            <button
                              onClick={() => approveComment(c.id)}
                              className="px-3 py-1 bg-green-600 text-white hover:bg-green-700 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" /> Aceptar y Publicar
                            </button>
                          )}
                          <button
                            onClick={() => deleteComment(c.id)}
                            className="px-3 py-1 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-lg text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {comments.length === 0 && (
                  <div className="col-span-2 text-center p-12 bg-[#111] border border-white/5 rounded-3xl text-gray-500">
                    Ninguna sugerencia o comentario recibido todavía.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------------------ TAB: TEMA PÁGINA ------------------ */}
          {activeTab === "tema" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Customizers */}
              <div className="space-y-6">
                
                {/* 1. Preajuste General */}
                <div className="p-6 rounded-3xl bg-[#111] border border-white/10 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-white">Estilo Visual de la Tienda</h3>
                      <p className="text-[10px] text-gray-500 uppercase">Selecciona el ambiente de diseño ( Brooklyn, Broadway, Manhattan )</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {[
                      { id: "Brooklyn Industrial", label: "Brooklyn Dark", desc: "Industrial & Oscuro" },
                      { id: "Broadway Neon", label: "Broadway Neon", desc: "Llamativo & Retro" },
                      { id: "Manhattan Classic", label: "Manhattan Warm", desc: "Clásico & Cálido" }
                    ].map(t => {
                      const isSelected = selectedThemeId === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTheme(t.id as any)}
                          className={`p-3 rounded-xl border text-left flex flex-col justify-between h-20 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-red-600/10 border-red-500 text-white shadow-lg shadow-red-500/10"
                              : "bg-black border-white/5 text-gray-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-wider">{t.label}</span>
                          <span className="text-[8px] text-gray-500 font-bold uppercase">{t.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Textos y Cabecera Customizer */}
                <div className="p-6 rounded-3xl bg-[#111] border border-white/10 space-y-5">
                  <h3 className="text-xs font-black uppercase tracking-widest text-red-500 pb-2 border-b border-white/5">
                    Configuración de Textos de Cabecera
                  </h3>

                  <div className="space-y-4 text-xs font-medium">
                    <div>
                      <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">Nombre Comercial (Título Principal)</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => {
                          setProfileName(e.target.value);
                        }}
                        placeholder="Ej. Pizza NYC Luigi's"
                        className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-red-600"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">Etiqueta Superior (Badge)</label>
                      <input
                        type="text"
                        value={themeBadge}
                        onChange={(e) => setThemeBadge(e.target.value)}
                        placeholder="Ej. Estilo Nueva York"
                        className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-red-600"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">Subtítulo Descriptivo</label>
                      <input
                        type="text"
                        value={themeSubtitle}
                        onChange={(e) => setThemeSubtitle(e.target.value)}
                        placeholder="Ej. The Real Industrial Taste of Brooklyn"
                        className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-red-600"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Imagen de Fondo */}
                <div className="p-6 rounded-3xl bg-[#111] border border-white/10 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-red-500 pb-2 border-b border-white/5">
                    Imagen de Fondo de Cabecera
                  </h3>

                  <div className="space-y-4 text-xs font-medium">
                    <div>
                      <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">URL de la Imagen</label>
                      <input
                        type="text"
                        value={themeHeaderImage}
                        onChange={(e) => setThemeHeaderImage(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-red-600 font-mono text-[10px]"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-black uppercase text-gray-500 block mb-1.5">Subir desde Dispositivo (PC/Móvil)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "header")}
                        className="w-full p-1 bg-black border border-white/10 rounded-xl text-white text-[10px]"
                      />
                      <p className="text-[8px] text-gray-500 uppercase mt-1">Sube archivos locales. Se guardarán en Base64 en tu navegador.</p>
                    </div>

                    <div>
                      <label className="text-[9px] font-black uppercase text-gray-500 block mb-2">Imágenes Preestablecidas recomendadas</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { name: "Pizza Clásica", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=1024" },
                          { name: "Horno Rústico", url: "https://images.unsplash.com/photo-1573821663912-569905455b1c?auto=format&fit=crop&q=80&w=1024" },
                          { name: "Sabor Neoyorquino", url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=1024" }
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setThemeHeaderImage(preset.url)}
                            className="p-1 bg-black rounded-lg border border-white/5 hover:border-red-500 overflow-hidden relative group text-left h-12 transition-all cursor-pointer"
                          >
                            <img src={preset.url} alt={preset.name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                            <span className="relative z-10 text-[8px] font-black uppercase tracking-wider bg-black/60 px-1 py-0.5 rounded text-white m-0.5 block w-fit">
                              {preset.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Custom fonts, neon, sizes & real-time preview */}
              <div className="space-y-6">
                
                {/* 4. Tipografías, Neon & Tamaños */}
                <div className="p-6 rounded-3xl bg-[#111] border border-white/10 space-y-5">
                  <h3 className="text-xs font-black uppercase tracking-widest text-red-500 pb-2 border-b border-white/5">
                    Tipografía y Estilo de Letras
                  </h3>

                  <div className="space-y-4 text-xs font-medium">
                    {/* Font Type */}
                    <div>
                      <label className="text-[9px] font-black uppercase text-gray-500 block mb-1.5">Tipo de Letra (Fuente)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: "font-sans", label: "Moderna (Sans)", desc: "Inter" },
                          { id: "font-serif", label: "Elegante (Serif)", desc: "Georgia" },
                          { id: "font-mono", label: "Retro (Mono)", desc: "JetBrains Mono" },
                          { id: "font-display", label: "Impactante (Display)", desc: "Arial Black / Impact" }
                        ].map(f => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setThemeFont(f.id)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              themeFont === f.id
                                ? "bg-red-600/10 border-red-500 text-white"
                                : "bg-black border-white/5 text-gray-400 hover:text-white"
                            }`}
                          >
                            <p className="text-[10px] font-black uppercase leading-none">{f.label}</p>
                            <p className="text-[8px] text-gray-500 font-mono mt-0.5">{f.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Title Size */}
                    <div>
                      <label className="text-[9px] font-black uppercase text-gray-500 block mb-1.5">Tamaño de Letra del Título</label>
                      <select
                        value={themeTitleSize}
                        onChange={(e) => setThemeTitleSize(e.target.value)}
                        className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-red-600 text-xs font-bold"
                      >
                        <option value="text-2xl md:text-4xl">Pequeño</option>
                        <option value="text-3xl md:text-5xl">Mediano</option>
                        <option value="text-4xl md:text-6xl">Grande (Estándar)</option>
                        <option value="text-5xl md:text-7xl">Gigante</option>
                        <option value="text-6xl md:text-8xl">Colosal (Máximo)</option>
                      </select>
                    </div>

                    {/* Neon Glow Color */}
                    <div>
                      <label className="text-[9px] font-black uppercase text-gray-500 block mb-1.5">Color de Brillo Neón</label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { id: "none", label: "Sin Brillo", colorClass: "bg-gray-800" },
                          { id: "red", label: "Rojo", colorClass: "bg-red-600" },
                          { id: "green", label: "Verde", colorClass: "bg-green-500" },
                          { id: "blue", label: "Azul", colorClass: "bg-blue-500" },
                          { id: "pink", label: "Rosa", colorClass: "bg-pink-500" },
                          { id: "yellow", label: "Amarillo", colorClass: "bg-yellow-500" },
                          { id: "orange", label: "Naranja", colorClass: "bg-orange-500" },
                          { id: "purple", label: "Púrpura", colorClass: "bg-purple-600" }
                        ].map(c => {
                          const isSelected = themeColorNeon === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setThemeColorNeon(c.id)}
                              className={`p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                                isSelected
                                  ? "border-white text-white bg-white/5"
                                  : "border-white/5 text-gray-400 hover:text-white"
                              }`}
                            >
                              <span className={`w-3 h-3 rounded-full ${c.colorClass} ${isSelected ? 'ring-2 ring-white/50' : ''}`}></span>
                              <span className="text-[8px] font-black uppercase leading-none tracking-tighter shrink-0">{c.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real-time Preview */}
                <div className="p-6 rounded-3xl bg-[#111] border border-white/10 space-y-4">
                  <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest block">Vista Previa de la Cabecera en Tiempo Real</span>
                  
                  {/* Outer Simulated Header */}
                  <div 
                    className="relative h-44 w-full bg-cover bg-center flex items-end justify-center pb-4 rounded-2xl overflow-hidden shadow-xl" 
                    style={{ 
                      backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.85)), url('${themeHeaderImage || "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=1024"}')` 
                    }}
                  >
                    <div className="text-center px-4">
                      {themeBadge && (
                        <span className="bg-red-600 text-white text-[7px] font-black tracking-[0.25em] px-2 py-0.5 rounded-full uppercase mb-1 inline-block">
                          {themeBadge}
                        </span>
                      )}
                      
                      <h1 
                        className={`font-black tracking-tighter text-white drop-shadow-md leading-none ${themeTitleSize}`}
                        style={{
                          fontFamily: 
                            themeFont === "font-serif" ? "Georgia, serif" :
                            themeFont === "font-mono" ? "monospace" :
                            themeFont === "font-display" ? "Impact, sans-serif" :
                            "inherit",
                          textShadow: 
                            themeColorNeon === "red" ? "0 0 10px #ef4444, 0 0 20px #ef4444" :
                            themeColorNeon === "green" ? "0 0 10px #22c55e, 0 0 20px #22c55e" :
                            themeColorNeon === "blue" ? "0 0 10px #3b82f6, 0 0 20px #3b82f6" :
                            themeColorNeon === "pink" ? "0 0 10px #ec4899, 0 0 20px #ec4899" :
                            themeColorNeon === "yellow" ? "0 0 10px #eab308, 0 0 20px #eab308" :
                            themeColorNeon === "orange" ? "0 0 10px #f97316, 0 0 20px #f97316" :
                            themeColorNeon === "purple" ? "0 0 10px #a855f7, 0 0 20px #a855f7" :
                            "none"
                        }}
                      >
                        {profileName.toUpperCase()}
                      </h1>
                      
                      {themeSubtitle && (
                        <p className="text-[8px] md:text-[9px] tracking-[0.25em] uppercase text-gray-400 mt-1 font-bold leading-none">
                          {themeSubtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Save button */}
                  <button
                    type="button"
                    onClick={() => {
                      updateTenantConfig({
                        name: profileName,
                        headerImage: themeHeaderImage,
                        headerBadge: themeBadge,
                        headerSubtitle: themeSubtitle,
                        headerFont: themeFont,
                        headerColorNeon: themeColorNeon,
                        headerTitleSize: themeTitleSize
                      });
                    }}
                    className="w-full py-3 bg-red-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-red-700 hover:shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Guardar Estilo de Cabecera
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ------------------ TAB 5: CONFIGURACIÓN & BACKUP ------------------ */}
          {activeTab === "configuracion" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Tenant Credentials, password reset */}
              <div className="p-6 rounded-3xl bg-[#111] border border-white/10 space-y-6">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">Datos del Inquilino</h3>
                  <p className="text-[10px] text-gray-500 uppercase">Configuración de marca y seguridad</p>
                </div>

                <div className="space-y-4 text-xs font-medium">
                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">Nombre Comercial del Local</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">Teléfono</label>
                      <input
                        type="text"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-red-600"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">Email Principal</label>
                      <input
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-red-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">Dirección Física del Local</label>
                    <input
                      type="text"
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      placeholder="Ej. 7th Ave & 33rd St, NY"
                      className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">URL de Google Maps (Enlace para Abrir Mapa)</label>
                    <input
                      type="text"
                      value={profileMapUrl}
                      onChange={(e) => setProfileMapUrl(e.target.value)}
                      placeholder="Ej. https://maps.google.com/?q=..."
                      className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-4">
                    <span className="text-[9px] font-black uppercase text-yellow-500 tracking-widest block">Cambio de Contraseña (5 min Cooldown)</span>
                    
                    {isResettingPassword ? (
                      <div className="space-y-3">
                        <p className="text-[10px] text-gray-400">
                          Se ha generado el código de cambio. Te restan <span className="text-red-500 font-bold">{Math.floor(resetTimer / 60)}:{(resetTimer % 60).toString().padStart(2, "0")}</span> para ingresarlo.
                        </p>
                        
                        <input
                          type="text"
                          value={resetCodeInput}
                          onChange={(e) => setResetCodeInput(e.target.value)}
                          placeholder="Ingresa el código enviado"
                          className="w-full p-2.5 bg-black border border-white/10 rounded-lg text-center font-black tracking-widest"
                        />

                        <input
                          type="password"
                          value={newPasswordValue}
                          onChange={(e) => setNewPasswordValue(e.target.value)}
                          placeholder="Nueva contraseña deseada"
                          className="w-full p-2.5 bg-black border border-white/10 rounded-lg text-center"
                        />

                        <button
                          type="button"
                          onClick={handleVerifyPasswordReset}
                          className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider"
                        >
                          Verificar y Cambiar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleInitiatePasswordReset}
                        className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-gray-300 rounded-lg text-[10px] font-black uppercase tracking-wider border border-white/10"
                      >
                        Iniciar Flujo de Reinicio
                      </button>
                    )}
                  </div>

                  {/* Idioma, Prefijo de WhatsApp y Envíos */}
                  <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-4">
                    <span className="text-[9px] font-black uppercase text-yellow-500 tracking-widest block">Opciones de Funcionamiento</span>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Idioma */}
                      <div>
                        <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">Idioma de la Tienda</label>
                        <select
                          value={profileLanguage}
                          onChange={(e) => setProfileLanguage(e.target.value as any)}
                          className="w-full p-2 bg-black border border-white/10 rounded-lg text-white text-[11px] font-bold outline-none focus:border-red-600"
                        >
                          <option value="es">Español Castellano</option>
                          <option value="en">English (Inglés)</option>
                        </select>
                      </div>

                      {/* Prefijo */}
                      <div>
                        <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">Prefijo de Teléfono</label>
                        <input
                          type="text"
                          value={profilePhonePrefix}
                          onChange={(e) => setProfilePhonePrefix(e.target.value)}
                          placeholder="Ej. +549"
                          className="w-full p-2 bg-black border border-white/10 rounded-lg text-white text-[11px] font-mono outline-none focus:border-red-600"
                        />
                      </div>
                    </div>

                    {/* Checkbox para Envíos */}
                    <div className="flex items-center gap-3 pt-2">
                      <label className="relative flex items-center p-3 rounded-xl bg-black border border-white/10 cursor-pointer w-full select-none hover:bg-neutral-900 transition-colors">
                        <input
                          type="checkbox"
                          checked={profileEnableShipping}
                          onChange={(e) => setProfileEnableShipping(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 bg-neutral-900 cursor-pointer"
                        />
                        <span className="ml-3 text-[10px] font-black uppercase text-white tracking-wider">
                          Habilitar Envíos a Domicilio
                        </span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      updateTenantConfig({
                        name: profileName,
                        phone: profilePhone,
                        email: profileEmail,
                        address: profileAddress,
                        mapUrl: profileMapUrl,
                        language: profileLanguage,
                        phonePrefix: profilePhonePrefix,
                        enableShipping: profileEnableShipping
                      });
                      triggerNotification("Perfil Guardado", "Se han guardado los cambios de configuración y funcionamiento.", "success");
                    }}
                    className="w-full py-3 bg-red-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-red-700 transition-all cursor-pointer"
                  >
                    Guardar Cambios de Perfil
                  </button>
                </div>
              </div>

              {/* Backups & QR Printable Section */}
              <div className="space-y-6">
                
                {/* Simulated Fingerprint / Biometrics enroll */}
                <div className="p-6 rounded-3xl bg-[#111] border border-white/10">
                  <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">Biometría del Dispositivo</h3>
                  <p className="text-[10px] text-gray-500 uppercase mb-4">Configura acceso rápido con huella o patrón</p>

                  <PatternLock 
                    mode="enroll" 
                    onSuccess={() => {}} 
                    onSaveCredentials={handleSaveBiometricsEnrollment} 
                  />
                </div>

                {/* Backup Module */}
                <div className="p-6 bg-[#111] rounded-3xl border border-white/10 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-white">Copias de Seguridad</h4>
                      <p className="text-[9px] text-gray-500 uppercase">Resguardo rotativo local (Max 5 copias)</p>
                    </div>
                    <button
                      onClick={() => createBackup()}
                      className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-[10px] font-black uppercase rounded-lg"
                    >
                      Hacer Copia
                    </button>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {backups.map((b, idx) => (
                      <div key={b.id} className="p-2.5 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <p className="font-black text-white">{b.name}</p>
                          <p className="text-[9px] text-gray-500">{b.timestamp}</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => restoreBackup(b.id)}
                            className="px-2 py-1 bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white rounded text-[9px] font-black uppercase"
                          >
                            Cargar
                          </button>
                          <button
                            onClick={() => deleteBackup(b.id)}
                            className="px-2 py-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded text-[9px] font-black uppercase"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                    {backups.length === 0 && (
                      <p className="text-[10px] text-gray-600 text-center py-4 italic">No hay copias guardadas aún.</p>
                    )}
                  </div>
                </div>

                {/* QR Generation card */}
                <div className="p-6 bg-[#111] rounded-3xl border border-white/10 flex items-center gap-4">
                  <div className="p-4 bg-white rounded-2xl shrink-0">
                    <QrCode className="w-12 h-12 text-black" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-widest text-white">Código QR Vitrina</h4>
                    <p className="text-[10px] text-gray-500 leading-snug">Genera e imprime el poster QR para colgar en tu restaurante.</p>
                    <button
                      onClick={() => setShowQRModal(true)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase rounded-lg cursor-pointer"
                    >
                      Ver Poster Imprimible
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ------------------ TAB: COLABORADORES ------------------ */}
          {activeTab === "colaboradores" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Form Colaboradores */}
              <div className="p-6 rounded-3xl bg-[#111] border border-white/10 space-y-6 h-fit">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <h3 className="text-sm font-black uppercase tracking-wider text-red-500">
                    {editingCollaborator ? "Editar Colaborador" : "Nuevo Colaborador"}
                  </h3>
                  {editingCollaborator && (
                    <button 
                      onClick={() => {
                        setEditingCollaborator(null);
                        setCollabName("");
                        setCollabPhone("");
                        setCollabPin("");
                        setCollabImage("");
                      }}
                      className="text-[10px] bg-white/5 px-2.5 py-1 rounded-lg hover:bg-white/10 font-bold uppercase cursor-pointer"
                    >
                      Nuevo
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveCollaborator} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Nombre completo</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ej. Juan Pérez"
                      value={collabName}
                      onChange={(e) => setCollabName(e.target.value)}
                      className="w-full text-xs p-3 bg-black/40 rounded-xl border border-white/10 text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Teléfono móvil</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="Ej. +5491122334455"
                      value={collabPhone}
                      onChange={(e) => setCollabPhone(e.target.value)}
                      className="w-full text-xs p-3 bg-black/40 rounded-xl border border-white/10 text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">PIN de Ingreso (Credencial)</label>
                    <input 
                      type="text" 
                      required
                      maxLength={8}
                      placeholder="Ej. 1234"
                      value={collabPin}
                      onChange={(e) => setCollabPin(e.target.value)}
                      className="w-full text-xs p-3 bg-black/40 rounded-xl border border-white/10 text-white focus:outline-none focus:border-red-600 font-mono text-center tracking-widest text-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Foto de Perfil</label>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          {collabImage ? (
                            <img src={collabImage} alt="Avatar Preview" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <label className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer text-gray-300">
                            <Camera className="w-3.5 h-3.5 text-red-500" />
                            Subir de PC/Móvil
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleCollaboratorImageChange} 
                              className="hidden" 
                            />
                          </label>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                          <span className="text-[9px] text-gray-600 uppercase font-bold">o URL</span>
                        </div>
                        <input 
                          type="url" 
                          placeholder="https://images.unsplash.com/..." 
                          value={collabImage && collabImage.startsWith("data:") ? "" : collabImage}
                          onChange={(e) => setCollabImage(e.target.value)}
                          className="w-full text-[10px] pl-12 pr-3 py-2 bg-black/20 rounded-lg border border-white/5 text-gray-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all cursor-pointer shadow-lg shadow-red-600/10"
                  >
                    {editingCollaborator ? "Guardar Cambios" : "Registrar Colaborador"}
                  </button>
                </form>
              </div>

              {/* Lista y Solicitudes */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* SOLICITUDES DE INGRESO PENDIENTES */}
                {collaborators.filter(c => c.loginRequestPending).length > 0 && (
                  <div className="p-6 bg-yellow-600/10 border border-yellow-500/20 rounded-3xl space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse"></div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-yellow-500 animate-pulse">Solicitudes de Ingreso Inalámbrico</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {collaborators.filter(c => c.loginRequestPending).map(collab => (
                        <div key={collab.id} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img src={collab.image} alt={collab.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                            <div>
                              <h4 className="text-xs font-black text-white">{collab.name}</h4>
                              <p className="text-[9px] text-yellow-500 font-mono">Pide acceso {collab.wantsBiometrics ? "con Biometría" : "con PIN"}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-1.5 shrink-0">
                            <button
                              onClick={() => approveCollaboratorLogin(collab.id)}
                              className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[9px] font-black uppercase rounded-lg flex items-center gap-1 cursor-pointer"
                            >
                              <UserCheck className="w-3 h-3" /> Permitir
                            </button>
                            <button
                              onClick={() => rejectCollaboratorLogin(collab.id)}
                              className="px-2.5 py-1.5 bg-red-600/20 hover:bg-red-600 hover:text-white text-red-400 text-[9px] font-black uppercase rounded-lg cursor-pointer"
                            >
                              Rechazar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* LISTA GENERAL DE PERSONAL */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-white">Colaboradores Registrados</h3>
                      <p className="text-[9px] text-gray-500 uppercase">Gestiona permisos, credenciales y sesiones remotas</p>
                    </div>
                    <span className="text-[10px] bg-white/5 px-2.5 py-1 rounded-full text-gray-400 font-bold font-mono">
                      {collaborators.length} de 10
                    </span>
                  </div>

                  {collaborators.length === 0 ? (
                    <div className="p-12 text-center bg-[#111] rounded-3xl border border-white/5">
                      <Users className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                      <p className="text-xs text-gray-400 font-bold uppercase">No hay colaboradores registrados</p>
                      <p className="text-[10px] text-gray-600 uppercase mt-1">Usa el formulario para añadir un nuevo miembro a tu personal.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {collaborators.map(collab => (
                        <div key={collab.id} className="p-5 bg-[#111] border border-white/10 rounded-3xl flex flex-col justify-between space-y-4 hover:border-white/20 transition-all">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <img src={collab.image} alt={collab.name} className="w-12 h-12 rounded-full object-cover border-2 border-neutral-800" />
                                {collab.sessionActive ? (
                                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#111] rounded-full animate-pulse" title="Conectado"></span>
                                ) : (
                                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-gray-600 border-2 border-[#111] rounded-full" title="Desconectado"></span>
                                )}
                              </div>
                              <div>
                                <h4 className="text-xs font-black text-white">{collab.name}</h4>
                                <p className="text-[10px] text-gray-500 font-mono">{collab.phone}</p>
                              </div>
                            </div>

                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider ${
                              collab.sessionActive 
                                ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                                : "bg-neutral-800 text-neutral-400"
                            }`}>
                              {collab.sessionActive ? "Sesión Activa" : "Inactivo"}
                            </span>
                          </div>

                          <div className="py-2.5 px-3 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between text-[10px]">
                            <div>
                              <span className="text-gray-500 uppercase font-black block text-[8px] tracking-widest">PIN Credencial</span>
                              <span className="font-mono text-white text-xs font-black tracking-widest">{collab.pin}</span>
                            </div>

                            {collab.wantsBiometrics && (
                              <div className="flex items-center gap-1 bg-red-600/10 text-red-400 px-2 py-1 rounded-lg border border-red-500/20">
                                <Fingerprint className="w-3.5 h-3.5" />
                                <span className="text-[8px] font-black uppercase">Bio Activado</span>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-white/5 justify-between">
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditCollaboratorClick(collab)}
                                className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase rounded-lg cursor-pointer"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => deleteCollaborator(collab.id)}
                                className="px-2.5 py-1.5 bg-red-600/10 hover:bg-red-600 hover:text-white text-red-400 text-[10px] font-black uppercase rounded-lg cursor-pointer"
                              >
                                Eliminar
                              </button>
                            </div>

                            {collab.sessionActive && (
                              <button
                                onClick={() => logoutCollaborator(collab.id)}
                                className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase rounded-lg flex items-center gap-1 cursor-pointer"
                                title="Cerrar sesión remota de este colaborador"
                              >
                                <LogOut className="w-3 h-3" /> Cerrar Sesión
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

        </main>
      )}

      {/* ------------------ MODAL: QR POSTER PRINTABLE ------------------ */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm print:bg-white print:p-0 print:m-0 print:absolute print:inset-0 print:z-[9999] print:flex print:items-center print:justify-center print:w-screen print:h-screen print:overflow-hidden">
          <div className="w-full max-w-sm bg-white text-black p-8 rounded-3xl shadow-2xl text-center flex flex-col items-center justify-between min-h-[500px] print:shadow-none print:border-none print:w-full print:max-w-2xl print:p-12 print:my-0 print:h-full print:justify-around">
            
            {/* Header branding */}
            <div className="text-center font-sans">
              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-red-600 block mb-1">CARTA DIGITAL</span>
              <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">{tenantConfig.name}</h2>
              <div className="w-16 h-1 bg-red-600 mx-auto mt-3"></div>
            </div>

            {/* High-Res Vector QR code */}
            <div className="p-6 border-4 border-black rounded-3xl my-8 bg-white print:my-4">
              <RealisticQRCode size={180} value={publicUrl} />
            </div>

            {/* Poster footer / legend requested */}
            <div className="space-y-4 font-sans">
              <p className="text-xs font-bold uppercase tracking-widest leading-snug text-neutral-700">
                Escanea el QR para ver nuestro menú y realizar tu pedido online
              </p>
              
              <p className="text-[11px] text-gray-400 font-mono tracking-tight bg-neutral-100 py-1.5 px-3 rounded-lg inline-block print:bg-transparent">
                {publicUrl}
              </p>
            </div>

            {/* Print action bar */}
            <div className="flex gap-2 w-full pt-6 border-t border-gray-100 mt-4 print:hidden">
              <button
                onClick={handlePrintPDFFlyer}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                Imprimir Poster (PDF)
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-black uppercase rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
