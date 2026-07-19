/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Product, CartItem } from "../types";
import { usePizza } from "../context/PizzaContext";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";

interface PizzaCustomizerProps {
  product: Product;
  onClose: () => void;
}

export const PizzaCustomizer: React.FC<PizzaCustomizerProps> = ({ product, onClose }) => {
  const { addToCart, currentTheme } = usePizza();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("Grande (16\")");
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const sizeOptions = [
    { name: "Personal (12\")", priceAdd: -4.00 },
    { name: "Grande (16\")", priceAdd: 0.00 },
    { name: "Familiar XL (18\")", priceAdd: 4.50 }
  ];

  const standardToppings = [
    { name: "Queso Mozzarella Extra", price: 1.50 },
    { name: "Pepperoni Picante", price: 2.00 },
    { name: "Salsa de Ajo Dulce", price: 1.00 },
    { name: "Miel Especiada de Abeja", price: 1.50 },
    { name: "Jalapeños Frescos", price: 1.00 }
  ];

  // Combined toppings from standard + product-specific custom fields
  const availableToppings = [
    ...standardToppings,
    ...(product.customFields?.map(cf => ({ name: cf.label, price: cf.price })) || [])
  ];

  // Calculate prices
  const sizeOption = sizeOptions.find(s => s.name === selectedSize);
  const sizePriceModifier = sizeOption ? sizeOption.priceAdd : 0;
  
  const toppingsPrice = selectedToppings.reduce((sum, topName) => {
    const found = availableToppings.find(t => t.name === topName);
    return sum + (found ? found.price : 0);
  }, 0);

  const unitPrice = Math.max(3.00, product.price + sizePriceModifier + toppingsPrice);
  const totalPrice = unitPrice * quantity;

  const handleToggleTopping = (topName: string) => {
    setSelectedToppings(prev => 
      prev.includes(topName) 
        ? prev.filter(t => t !== topName) 
        : [...prev, topName]
    );
  };

  const handleAddToCart = () => {
    const item: CartItem = {
      product,
      quantity,
      selectedSize,
      selectedToppings,
      addedPrice: sizePriceModifier + toppingsPrice,
      notes
    };
    addToCart(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className={`relative w-full max-w-lg overflow-hidden rounded-3xl border ${currentTheme.border} ${currentTheme.cardBg} ${currentTheme.text} shadow-2xl flex flex-col max-h-[90vh]`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b ${currentTheme.border}`}>
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-red-500">Personalizar Pizza</span>
            <h3 className="text-xl font-black tracking-tight">{product.name}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Base Product Info */}
          <div className="flex gap-4">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-24 h-24 object-cover rounded-xl border border-white/5" 
              onError={(e) => {
                // Fallback image
                e.currentTarget.src = "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400";
              }}
            />
            <div className="flex-1">
              <p className="text-sm text-gray-400 leading-snug">{product.description}</p>
              <p className="text-lg font-black text-red-500 mt-2">Precio Base: ${product.price.toFixed(2)}</p>
            </div>
          </div>

          {/* Size selection */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-3 text-white">1. Elige el tamaño</h4>
            <div className="grid grid-cols-3 gap-2">
              {sizeOptions.map(opt => {
                const diffLabel = opt.priceAdd > 0 ? `(+$${opt.priceAdd})` : opt.priceAdd < 0 ? `(-$${Math.abs(opt.priceAdd)})` : "";
                const isSelected = selectedSize === opt.name;
                return (
                  <button
                    key={opt.name}
                    onClick={() => setSelectedSize(opt.name)}
                    className={`p-3 rounded-xl border text-xs font-bold text-center flex flex-col justify-center items-center transition-all ${
                      isSelected 
                        ? "border-red-600 bg-red-600/10 text-white shadow-md shadow-red-600/10" 
                        : "border-white/5 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span>{opt.name.split(" ")[0]}</span>
                    <span className="text-[10px] font-normal mt-1 text-gray-500">{opt.name.match(/\((.*?)\)/)?.[0] || opt.name}</span>
                    {diffLabel && <span className="text-[10px] text-red-400 font-bold mt-0.5">{diffLabel}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toppings Checklist */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-3 text-white">2. Agrega ingredientes adicionales</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {availableToppings.map(top => {
                const isChecked = selectedToppings.includes(top.name);
                return (
                  <label
                    key={top.name}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${
                      isChecked 
                        ? "border-red-600/50 bg-red-600/5 text-white" 
                        : "border-white/5 bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => handleToggleTopping(top.name)}
                        className="rounded border-white/10 bg-black text-red-600 focus:ring-red-600"
                      />
                      <span className="text-xs font-medium">{top.name}</span>
                    </div>
                    <span className="text-xs font-black text-red-500">+${top.price.toFixed(2)}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Custom notes */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-2 text-white">3. Instrucciones especiales</h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Doble cocción, sin albahaca, cortar en 12 porciones..."
              rows={2}
              className="w-full text-xs p-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-red-600 placeholder-gray-600 resize-none"
            />
          </div>
        </div>

        {/* Action Footer */}
        <div className={`p-5 bg-black/40 border-t ${currentTheme.border} flex items-center justify-between`}>
          {/* Quantity selector */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 font-black text-sm w-8 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(prev => prev + 1)}
              className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Complete Button */}
          <button
            onClick={handleAddToCart}
            className="flex-1 ml-4 px-6 py-3.5 bg-red-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
          >
            <ShoppingBag className="w-4 h-4" />
            Añadir • ${totalPrice.toFixed(2)}
          </button>
        </div>

      </div>
    </div>
  );
};
