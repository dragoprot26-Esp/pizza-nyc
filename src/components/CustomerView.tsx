/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { usePizza } from "../context/PizzaContext";
import { Product, CartItem, OrderStatus, Comment } from "../types";
import { PizzaCustomizer } from "./PizzaCustomizer";
import { OrderTracker } from "./OrderTracker";
import { 
  ShoppingBag, 
  Shield, 
  Share2, 
  Phone, 
  MapPin, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Heart, 
  Send,
  MessageSquare,
  Facebook,
  Twitter,
  Sparkles
} from "lucide-react";

interface CustomerViewProps {
  onOpenAdmin: () => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({ onOpenAdmin }) => {
  const {
    products,
    categories,
    comments,
    tenantConfig,
    currentTheme,
    selectedThemeId,
    setTheme,
    cart,
    removeFromCart,
    clearCart,
    addOrder,
    addComment,
    isAdminAuthenticated
  } = usePizza();

  const isEn = tenantConfig.language === "en";
  const t = (es: string, en: string) => (isEn ? en : es);

  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showTrackerCode, setShowTrackerCode] = useState<string | null>(null);
  
  // Checkout states
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [checkoutPayment, setCheckoutPayment] = useState<"Caja" | "Envío">("Caja");
  const [latestOrderCode, setLatestOrderCode] = useState<string | null>(null);
  const [customerPhonePrefix, setCustomerPhonePrefix] = useState(tenantConfig.phonePrefix || "+549");

  React.useEffect(() => {
    if (tenantConfig.phonePrefix) {
      setCustomerPhonePrefix(tenantConfig.phonePrefix);
    }
  }, [tenantConfig.phonePrefix]);

  React.useEffect(() => {
    if (tenantConfig.enableShipping === false && checkoutPayment !== "Caja") {
      setCheckoutPayment("Caja");
    }
  }, [tenantConfig.enableShipping]);

  // Leave comment states
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [commentType, setCommentType] = useState<"comment" | "suggestion">("comment");
  const [activeFeedbackTab, setActiveFeedbackTab] = useState<"comentarios" | "sugerencias">("comentarios");

  // Social Share Dropdown or simple trigger
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showLocationOptions, setShowLocationOptions] = useState(false);

  // Filter products
  const filteredProducts = products.filter(p => {
    if (selectedCategory === "Todos") return true;
    return p.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  // Calculate cart total
  const cartSubtotal = cart.reduce((sum, item) => {
    const itemPrice = item.product.price + item.addedPrice;
    return sum + (itemPrice * item.quantity);
  }, 0);

  // Handle Checkout submission
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutName || !checkoutPhone || (checkoutPayment === "Envío" && !checkoutAddress)) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }

    const orderData = {
      name: checkoutName,
      phone: `${customerPhonePrefix} ${checkoutPhone}`,
      address: checkoutPayment === "Caja" ? "Retiro en Local" : checkoutAddress,
      items: cart,
      paymentMethod: checkoutPayment,
      total: cartSubtotal
    };

    const newOrder = addOrder(orderData);
    setLatestOrderCode(newOrder.code);
    clearCart();
    setCheckoutName("");
    setCheckoutPhone("");
    setCheckoutAddress("");
  };

  // Share helper
  const handleShare = (platform: "wa" | "tw" | "fb") => {
    const shareUrl = window.location.href;
    const shareText = `¡Mira las pizzas artesanales estilo Nueva York de ${tenantConfig.name}! Pedidos online en tiempo real.`;
    
    let url = "";
    if (platform === "wa") {
      url = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
    } else if (platform === "tw") {
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    } else if (platform === "fb") {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    }

    window.open(url, "_blank");
    setShowShareOptions(false);
  };

  // Simulated Push/Email send of cart/pickup code
  const handleSendDetails = (method: "wa" | "mail") => {
    if (!latestOrderCode) return;
    const orderDetails = `🍕 Código de retiro: *${latestOrderCode}* en ${tenantConfig.name}.\nTotal: $${cartSubtotal.toFixed(2)}.\n¡Gracias por tu compra!`;
    
    if (method === "wa") {
      window.open(`https://wa.me/?text=${encodeURIComponent(orderDetails)}`, "_blank");
    } else {
      window.open(`mailto:?subject=Tu pedido de Pizza NYC&body=${encodeURIComponent(orderDetails)}`, "_blank");
    }
  };

  // Comment submit
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentAuthor || !commentText) return;
    addComment(commentAuthor, commentText, commentType);
    setCommentAuthor("");
    setCommentText("");
    setCommentSubmitted(true);
    setTimeout(() => setCommentSubmitted(false), 4000);
  };

  const approvedPublicComments = comments.filter(c => c.status === "approved" && (c.type === "comment" || !c.type));
  const tenantSuggestions = comments.filter(c => c.type === "suggestion");

  return (
    <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text} ${currentTheme.fontFamily} transition-all duration-300 pb-16`}>
      
      {/* 1. Header Image Section */}
      <div 
        className="relative h-64 w-full bg-cover bg-center flex items-end justify-center pb-8 shadow-2xl" 
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.85)), url('${tenantConfig.headerImage || "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=1024"}')` 
        }}
      >
        <div className="text-center px-4">
          {(tenantConfig.headerBadge || "Estilo Nueva York") && (
            <span className="bg-red-600 text-white text-[9px] font-black tracking-[0.25em] px-2.5 py-1 rounded-full uppercase mb-2 inline-block shadow-md">
              {tenantConfig.headerBadge || "Estilo Nueva York"}
            </span>
          )}
          
          <h1 
            className={`font-black tracking-tighter text-white drop-shadow-md leading-none ${tenantConfig.headerTitleSize || "text-4xl md:text-6xl"}`}
            style={{
              fontFamily: 
                tenantConfig.headerFont === "font-serif" ? "Georgia, serif" :
                tenantConfig.headerFont === "font-mono" ? "monospace" :
                tenantConfig.headerFont === "font-display" ? "Impact, sans-serif" :
                "inherit",
              textShadow: 
                tenantConfig.headerColorNeon === "red" ? "0 0 10px #ef4444, 0 0 20px #ef4444, 0 0 30px #ef4444" :
                tenantConfig.headerColorNeon === "green" ? "0 0 10px #22c55e, 0 0 20px #22c55e, 0 0 30px #22c55e" :
                tenantConfig.headerColorNeon === "blue" ? "0 0 10px #3b82f6, 0 0 20px #3b82f6, 0 0 30px #3b82f6" :
                tenantConfig.headerColorNeon === "pink" ? "0 0 10px #ec4899, 0 0 20px #ec4899, 0 0 30px #ec4899" :
                tenantConfig.headerColorNeon === "yellow" ? "0 0 10px #eab308, 0 0 20px #eab308, 0 0 30px #eab308" :
                tenantConfig.headerColorNeon === "orange" ? "0 0 10px #f97316, 0 0 20px #f97316, 0 0 30px #f97316" :
                tenantConfig.headerColorNeon === "purple" ? "0 0 10px #a855f7, 0 0 20px #a855f7, 0 0 30px #a855f7" :
                "none"
            }}
          >
            {tenantConfig.name.toUpperCase()}
          </h1>
          
          {(tenantConfig.headerSubtitle || "The Real Industrial Taste of Brooklyn") && (
            <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-gray-400 mt-2 font-bold leading-relaxed">
              {tenantConfig.headerSubtitle || "The Real Industrial Taste of Brooklyn"}
            </p>
          )}
        </div>
      </div>

      {/* Sticky Navigation and Categories Wrapper to prevent overlaps or cutoffs on mobile */}
      <div className="sticky top-0 z-40 w-full shadow-xl">
        {/* 2. Unified Header / Navigation Panel (Always visible below header) */}
        <nav className={`flex items-center justify-between px-6 py-4 bg-black/95 backdrop-blur-md border-b ${currentTheme.border}`}>
          {/* Info Left */}
          <div className="flex gap-4 items-center">
            {/* Share Trigger */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowShareOptions(!showShareOptions);
                  setShowLocationOptions(false);
                }}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className="p-2 bg-white/5 rounded-full group-hover:bg-red-600/20 transition-colors">
                  <Share2 className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                </div>
                <span className="text-[8px] uppercase tracking-widest mt-1 text-gray-400">Compartir</span>
              </button>

              {showShareOptions && (
                <div className="absolute left-0 mt-2 bg-neutral-900 border border-white/10 rounded-xl p-2 flex flex-col gap-1 w-32 shadow-xl">
                  <button onClick={() => handleShare("wa")} className="flex items-center gap-2 text-[10px] text-gray-200 hover:bg-white/5 p-2 rounded-lg text-left">
                    <MessageSquare className="w-3.5 h-3.5 text-green-500" /> WhatsApp
                  </button>
                  <button onClick={() => handleShare("tw")} className="flex items-center gap-2 text-[10px] text-gray-200 hover:bg-white/5 p-2 rounded-lg text-left">
                    <Twitter className="w-3.5 h-3.5 text-blue-400" /> Twitter
                  </button>
                  <button onClick={() => handleShare("fb")} className="flex items-center gap-2 text-[10px] text-gray-200 hover:bg-white/5 p-2 rounded-lg text-left">
                    <Facebook className="w-3.5 h-3.5 text-blue-600" /> Facebook
                  </button>
                </div>
              )}
            </div>

            {/* Location Trigger */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowLocationOptions(!showLocationOptions);
                  setShowShareOptions(false);
                }}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className="p-2 bg-white/5 rounded-full group-hover:bg-red-600/20 transition-colors">
                  <MapPin className="w-4 h-4 text-red-500 group-hover:text-red-400" />
                </div>
                <span className="text-[8px] uppercase tracking-widest mt-1 text-gray-400">Ubicación</span>
              </button>

              {showLocationOptions && (
                <div className="absolute left-0 mt-2 bg-neutral-950 border border-white/10 rounded-2xl p-4 shadow-2xl z-50 w-72 space-y-3 font-sans normal-case text-xs text-left">
                  <div className="flex items-center justify-between pb-1 border-b border-white/5">
                    <span className="font-black text-[10px] text-gray-400 uppercase tracking-wider">Ubicación & Contacto</span>
                    <button onClick={() => setShowLocationOptions(false)} className="text-gray-600 hover:text-white text-lg leading-none">
                      ×
                    </button>
                  </div>
                  
                  <div className="space-y-2.5 text-gray-200">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Dirección</p>
                      <p className="font-bold text-white text-[11px] flex items-start gap-1.5 leading-snug">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        {tenantConfig.address || "7th Ave & 33rd St, NY"}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Teléfono</p>
                      <p className="font-bold text-white text-[11px] flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        {tenantConfig.phone}
                      </p>
                    </div>
                  </div>

                  <a 
                    href={tenantConfig.mapUrl || "https://maps.google.com/?q=7th+Ave+%26+33rd+St,+New+York,+NY+10001"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] mt-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Abrir en Google Maps
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Centered Cart Canasto */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative flex flex-col items-center group cursor-pointer"
          >
            <div className="relative p-4 bg-red-600 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)] group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-6 h-6 text-white" />
              {cart.length > 0 && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-white text-black text-xs font-black flex items-center justify-center rounded-full border-2 border-black animate-bounce">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </div>
              )}
            </div>
            <span className="text-[10px] font-black uppercase mt-1.5 tracking-wider text-white">
              Mi Canasto
            </span>
          </button>

          {/* Right Admin Access Escudo */}
          <div className="flex gap-3 items-center">
            {isAdminAuthenticated && (
              <button 
                onClick={onOpenAdmin}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)] flex items-center gap-1.5 cursor-pointer"
                title="Volver al Panel"
              >
                <Shield className="w-3.5 h-3.5 text-white" />
                <span>Volver a Panel</span>
              </button>
            )}

            {/* Tracker Shortcut */}
            <button 
              onClick={() => setShowTrackerCode("open")}
              className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-xs font-bold text-gray-400 hover:text-white transition-colors"
              title="Rastrear Pedido"
            >
              Siga en Vivo
            </button>

            <button 
              onClick={onOpenAdmin}
              className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-red-600 transition-colors"
              title="Panel Administrador"
            >
              <Shield className="w-5 h-5 text-yellow-500" />
            </button>
          </div>
        </nav>

        {/* 3. Horizontal Pestañas (Categories) */}
        <div className="flex overflow-x-auto bg-[#161616]/95 px-6 py-3.5 gap-3 border-b border-white/5 scrollbar-hide backdrop-blur-sm">
          {categories.map(cat => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            const displayName = cat === "Todos" ? t("Todos", "All") : cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider shrink-0 transition-all ${
                  isSelected 
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/20" 
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {displayName}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Main Products Display */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => {
            return (
              <div 
                key={product.id}
                className={`flex flex-col rounded-3xl overflow-hidden border ${currentTheme.border} ${currentTheme.cardBg} transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] group`}
              >
                {/* Product Image */}
                <div className="h-48 overflow-hidden relative">
                  {product.category === "Promo" && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-black px-2.5 py-1 rounded uppercase tracking-wider z-10">
                      OFERTA NYC
                    </div>
                  )}
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400";
                    }}
                  />
                </div>

                {/* Info & Cart Selector */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{product.category}</span>
                    <h3 className="text-lg font-black text-white mt-1 group-hover:text-red-500 transition-colors leading-tight">{product.name}</h3>
                    <p className="text-xs text-gray-500 mt-1.5 leading-snug font-medium line-clamp-2">{product.description}</p>
                  </div>

                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-600 uppercase font-bold">Desde</span>
                      <span className="text-2xl font-black text-red-500">${product.price.toFixed(2)}</span>
                    </div>
                    {/* Canastito button */}
                    <button 
                      onClick={() => setSelectedProduct(product)}
                      className="p-3.5 bg-red-600 text-white hover:bg-red-700 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold uppercase"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Pedir</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 5. Muro de Visitas / Comentarios & Sugerencias */}
      <section className="max-w-4xl mx-auto px-6 py-12 border-t border-white/10 mt-16">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black tracking-tight text-white uppercase">Comunidad & Buzón Luigi</h2>
          <p className="text-xs text-gray-500 uppercase mt-1 tracking-widest">Opiniones públicas y sugerencias directas para el local</p>
        </div>

        {/* Board Tabs */}
        <div className="flex justify-center gap-3 mb-8">
          <button
            onClick={() => setActiveFeedbackTab("comentarios")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
              activeFeedbackTab === "comentarios"
                ? "bg-red-600 text-white border-red-500 shadow-lg shadow-red-650/20"
                : "bg-[#111] text-gray-400 border-white/5 hover:text-white"
            }`}
          >
            💬 Muro de Visitas ({approvedPublicComments.length})
          </button>
          <button
            onClick={() => setActiveFeedbackTab("sugerencias")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
              activeFeedbackTab === "sugerencias"
                ? "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-650/20"
                : "bg-[#111] text-gray-400 border-white/5 hover:text-white"
            }`}
          >
            📬 Sugerencias para Luigi ({tenantSuggestions.length})
          </button>
        </div>

        {/* List of comments / suggestions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {activeFeedbackTab === "comentarios" ? (
            approvedPublicComments.length > 0 ? (
              approvedPublicComments.map(c => (
                <div key={c.id} className="p-5 rounded-2xl bg-[#111] border border-white/5 flex flex-col justify-between space-y-4">
                  <div>
                    <p className="text-xs italic text-gray-300 leading-relaxed">"{c.text}"</p>
                    {c.reply && (
                      <div className="mt-3.5 p-3 rounded-xl bg-red-600/5 border border-red-500/15 text-left">
                        <p className="text-[9px] font-black uppercase text-red-500 flex items-center gap-1 mb-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                          Respuesta de Luigi:
                        </p>
                        <p className="text-xs text-gray-300 leading-relaxed font-medium">{c.reply}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 text-[10px] text-gray-500 uppercase font-black">
                    <span className="flex items-center gap-1 text-red-500">
                      <Heart className="w-3 h-3 fill-current" /> {c.author}
                    </span>
                    <span>{new Date(c.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center text-xs text-gray-600 py-10 border border-dashed border-white/10 rounded-2xl bg-black/20">
                Aún no hay comentarios aprobados en el muro. ¡Sé el primero!
              </div>
            )
          ) : (
            tenantSuggestions.length > 0 ? (
              tenantSuggestions.map(c => (
                <div key={c.id} className="p-5 rounded-2xl bg-[#111] border border-white/5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-black uppercase text-purple-400 bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-500/10">Sugerencia Directa</span>
                    </div>
                    <p className="text-xs italic text-gray-300 leading-relaxed">"{c.text}"</p>
                    {c.reply && (
                      <div className="mt-3.5 p-3 rounded-xl bg-purple-600/5 border border-purple-500/15 text-left">
                        <p className="text-[9px] font-black uppercase text-purple-400 flex items-center gap-1 mb-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                          Respuesta de Luigi:
                        </p>
                        <p className="text-xs text-gray-300 leading-relaxed font-medium">{c.reply}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 text-[10px] text-gray-500 uppercase font-black">
                    <span className="text-purple-400">
                      {c.author}
                    </span>
                    <span>{new Date(c.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center text-xs text-gray-600 py-10 border border-dashed border-white/10 rounded-2xl bg-black/20">
                Aún no hay sugerencias enviadas. ¡Envía tu sugerencia debajo!
              </div>
            )
          )}
        </div>

        {/* Suggestion Form */}
        <form onSubmit={handleCommentSubmit} className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Envía tu opinión o propuesta</h3>
            
            {/* Type selector */}
            <div className="flex gap-2 p-1 bg-black/60 rounded-xl border border-white/5 max-w-sm w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setCommentType("comment")}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all cursor-pointer ${
                  commentType === "comment"
                    ? "bg-red-600 text-white"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                Comentario Público
              </button>
              <button
                type="button"
                onClick={() => setCommentType("suggestion")}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all cursor-pointer ${
                  commentType === "suggestion"
                    ? "bg-purple-600 text-white"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                Sugerencia Privada
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input 
              type="text" 
              required
              value={commentAuthor}
              onChange={(e) => setCommentAuthor(e.target.value)}
              placeholder="Tu Nombre (Ej. Juan S.)"
              className="text-xs p-3 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-red-600 placeholder-gray-600"
            />
            <button 
              type="submit"
              className={`px-6 py-3 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                commentType === "suggestion" ? "bg-purple-600 hover:bg-purple-700" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              <Send className="w-3.5 h-3.5" /> 
              {commentType === "suggestion" ? "Enviar Sugerencia" : "Publicar Comentario"}
            </button>
          </div>
          <textarea 
            required
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={
              commentType === "suggestion"
                ? "Escribe tu recomendación, sugerencia o queja constructiva para Luigi..."
                : "¿Qué te pareció nuestro sabor o servicio? Déjanos tu recomendación para el muro de visitas..."
            }
            rows={2}
            className="w-full text-xs p-3 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-red-600 placeholder-gray-600 resize-none"
          />
          {commentSubmitted && (
            <p className="text-[10px] font-black text-green-400 uppercase text-center animate-pulse mt-2">
              {commentType === "comment" 
                ? "¡Comentario enviado con éxito! Aparecerá en el muro tan pronto Luigi lo apruebe."
                : "¡Sugerencia recibida en el buzón privado de Luigi! Muchas gracias por ayudarnos a mejorar."}
            </p>
          )}
        </form>
      </section>

      {/* 6. Footer (Required Button) */}
      <footer className="mt-12 p-6 bg-black border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex gap-4">
          <a 
            href="https://vitrina-cyc.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center px-6 py-2.5 bg-white text-black font-black text-xs uppercase rounded-full hover:bg-red-600 hover:text-white transition-all shadow-lg hover:scale-105"
          >
            Visita Vitrina
            <ExternalLink className="ml-2 w-4 h-4 shrink-0" />
          </a>
          <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Abierto todos los días • 11:00 AM - 02:00 AM
          </div>
        </div>
        <p className="text-[9px] text-gray-600 uppercase tracking-tighter text-center md:text-right">
          Powered by NYC PWA Engine v2.4 • Estilo Elegante Dark
        </p>
      </footer>

      {/* ----------------- MODALS & DRAWERS ----------------- */}

      {/* Product customizer modal */}
      {selectedProduct && (
        <PizzaCustomizer 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}

      {/* Shopping Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-md ${currentTheme.cardBg} ${currentTheme.text} h-full border-l ${currentTheme.border} p-6 flex flex-col justify-between shadow-2xl overflow-y-auto`}>
            
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-red-500" />
                  <h3 className="text-lg font-black uppercase">{t("Tu Canasto", "Your Cart")}</h3>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="text-xs uppercase font-bold tracking-wider text-gray-500 hover:text-white p-2"
                >
                  {t("Cerrar", "Close")}
                </button>
              </div>

              {/* Latest Order Details (If checked out) */}
              {latestOrderCode ? (
                <div className="py-6 space-y-6 text-center">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl inline-block">
                    <span className="text-[10px] uppercase font-black tracking-widest text-green-400 block mb-1">{t("Pedido Exitoso", "Order Successful")}</span>
                    <h4 className="text-3xl font-black text-white">{latestOrderCode}</h4>
                  </div>
                  
                  <p className="text-xs text-gray-400 leading-relaxed px-4">
                    {t("¡Gracias por tu pedido! Guarda este código de retiro generado automáticamente. Puedes enviar los detalles por WhatsApp o Mail:", "Thank you for your order! Save this automatically generated pickup code. You can send the details by WhatsApp or Email:")}
                  </p>

                  <div className="flex gap-2 justify-center">
                    <button 
                      onClick={() => handleSendDetails("wa")}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-[10px] font-black uppercase rounded-lg flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                    </button>
                    <button 
                      onClick={() => handleSendDetails("mail")}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] font-black uppercase rounded-lg flex items-center gap-1"
                    >
                      {t("Enviar Mail", "Send Email")}
                    </button>
                  </div>

                  {/* Built-in live tracker */}
                  <div className="pt-4 border-t border-white/5">
                    <OrderTracker initialCode={latestOrderCode} />
                  </div>

                  <button
                    onClick={() => { setLatestOrderCode(null); setIsCartOpen(false); }}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase rounded-xl transition-all"
                  >
                    {t("Volver a la Tienda", "Back to Store")}
                  </button>
                </div>
              ) : cart.length === 0 ? (
                <div className="py-16 text-center text-gray-500">
                  <ShoppingBag className="w-12 h-12 text-gray-700 mx-auto mb-3 animate-bounce" />
                  <p className="text-sm font-bold">{t("Tu canasto está vacío", "Your cart is empty")}</p>
                  <p className="text-xs text-gray-600 mt-1">{t("Regresa al menú y elige tus combinaciones neoyorquinas preferidas.", "Return to the menu and pick your favorite Brooklyn style treats.")}</p>
                </div>
              ) : (
                /* Cart Items List */
                <div className="py-4 space-y-4 max-h-[45vh] overflow-y-auto pr-1">
                  {cart.map((item, index) => {
                    const itemPrice = item.product.price + item.addedPrice;
                    return (
                      <div 
                        key={index} 
                        className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-start justify-between gap-3"
                      >
                        <div className="flex-1">
                          <h4 className="text-xs font-black text-white">{item.product.name}</h4>
                          <p className="text-[10px] text-gray-400 mt-0.5 font-bold">Tamaño: {item.selectedSize}</p>
                          {item.selectedToppings.length > 0 && (
                            <p className="text-[9px] text-red-400 mt-0.5">Toppings: {item.selectedToppings.join(", ")}</p>
                          )}
                          {item.notes && (
                            <p className="text-[9px] text-gray-500 mt-1 italic">"{item.notes}"</p>
                          )}
                          <div className="text-xs text-gray-300 font-bold mt-2">
                            {item.quantity}x • ${itemPrice.toFixed(2)} c/u
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-between h-full">
                          <button 
                            onClick={() => removeFromCart(index)}
                            className="p-1.5 bg-white/5 hover:bg-red-600/20 text-gray-500 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-black text-white mt-4">
                            ${(itemPrice * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Checkout details (Only if cart is occupied and not checked out) */}
            {!latestOrderCode && cart.length > 0 && (
              <div className="border-t border-white/10 pt-4 space-y-4">
                {/* Pricing Summary */}
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-gray-400 uppercase">Subtotal:</span>
                  <span className="text-xl font-black text-red-500">${cartSubtotal.toFixed(2)}</span>
                </div>

                {/* Form */}
                <form onSubmit={handleCheckout} className="space-y-2.5">
                  {tenantConfig.enableShipping !== false ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCheckoutPayment("Caja")}
                        className={`py-2 text-[10px] font-black uppercase rounded-lg border text-center transition-all ${
                          checkoutPayment === "Caja" 
                            ? "bg-red-600 text-white border-red-600" 
                            : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                        }`}
                      >
                        {t("Pagar en Caja", "Pay at Counter")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCheckoutPayment("Envío")}
                        className={`py-2 text-[10px] font-black uppercase rounded-lg border text-center transition-all ${
                          checkoutPayment === "Envío" 
                            ? "bg-red-600 text-white border-red-600" 
                            : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                        }`}
                      >
                        {t("Pagar al Recibir", "Pay on Delivery")}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-2.5 bg-black/40 border border-white/5 rounded-xl">
                      <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">{t("Solo Retiro en Local Habilitado", "Only Pickup Allowed")}</span>
                    </div>
                  )}

                  <input
                    type="text"
                    required
                    value={checkoutName}
                    onChange={(e) => setCheckoutName(e.target.value)}
                    placeholder={t("Tu Nombre completo", "Your Full Name")}
                    className="w-full text-xs p-2.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-red-600 placeholder-gray-600"
                  />
                  
                  <div className="flex gap-1.5 items-center">
                    <input
                      type="text"
                      required
                      value={customerPhonePrefix}
                      onChange={(e) => setCustomerPhonePrefix(e.target.value)}
                      placeholder="+549"
                      className="w-16 text-xs p-2.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-red-600 text-center font-mono font-bold"
                      title={t("Prefijo", "Prefix")}
                    />
                    <input
                      type="tel"
                      required
                      value={checkoutPhone}
                      onChange={(e) => setCheckoutPhone(e.target.value)}
                      placeholder={t("Teléfono móvil (Sin 0 ni 15)", "Mobile Phone")}
                      className="flex-1 text-xs p-2.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-red-600 placeholder-gray-600"
                    />
                  </div>
                  
                  {checkoutPayment === "Envío" && (
                    <input
                      type="text"
                      required
                      value={checkoutAddress}
                      onChange={(e) => setCheckoutAddress(e.target.value)}
                      placeholder={t("Dirección de envío completa", "Full Shipping Address")}
                      className="w-full text-xs p-2.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-red-600 placeholder-gray-600"
                    />
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg"
                  >
                    {t("Concretar Encargo", "Complete Order")} • Total: ${cartSubtotal.toFixed(2)}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Tracker search overlay */}
      {showTrackerCode && showTrackerCode !== "open" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md">
            <OrderTracker initialCode={showTrackerCode === "open" ? "" : showTrackerCode} onClose={() => setShowTrackerCode(null)} />
          </div>
        </div>
      )}

      {/* Empty open state */}
      {showTrackerCode === "open" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md">
            <OrderTracker onClose={() => setShowTrackerCode(null)} />
          </div>
        </div>
      )}

    </div>
  );
};
