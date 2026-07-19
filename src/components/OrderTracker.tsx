/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { usePizza } from "../context/PizzaContext";
import { OrderStatus } from "../types";
import { Search, Flame, Truck, CheckCircle2, Clock, MapPin, Phone, MessageSquare } from "lucide-react";

interface OrderTrackerProps {
  initialCode?: string;
  onClose?: () => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ initialCode = "", onClose }) => {
  const { orders, currentTheme } = usePizza();
  const [searchCode, setSearchCode] = useState(initialCode);
  const [trackedOrder, setTrackedOrder] = useState(
    initialCode ? orders.find(o => o.code.toUpperCase() === initialCode.toUpperCase()) : undefined
  );
  const [searched, setSearched] = useState(!!initialCode);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = orders.find(o => o.code.toUpperCase() === searchCode.trim().toUpperCase());
    setTrackedOrder(found);
    setSearched(true);
  };

  const steps = [
    { status: OrderStatus.PENDING, label: "Recibido", desc: "Cola de preparación", icon: Clock },
    { status: OrderStatus.PREPARING, label: "En Preparación", desc: "Estirando masa y horneando", icon: Flame },
    { status: OrderStatus.READY, label: "Para Entregar", desc: "Listo para retiro o repartidor", icon: Truck },
    { status: OrderStatus.DELIVERED, label: "Entregado", desc: "¡Buen provecho, disfruta NYC!", icon: CheckCircle2 }
  ];

  const getStepIndex = (status: OrderStatus) => {
    if (status === OrderStatus.CANCELLED) return -1;
    return steps.findIndex(s => s.status === status);
  };

  const currentStepIdx = trackedOrder ? getStepIndex(trackedOrder.status) : -1;

  return (
    <div className={`p-6 rounded-3xl ${currentTheme.cardBg} ${currentTheme.text} border ${currentTheme.border} shadow-xl max-w-md mx-auto`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-black uppercase tracking-tight">Seguimiento en Vivo</h3>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Real-time Delivery Tracker</p>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="text-xs uppercase font-bold tracking-wider px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            Cerrar
          </button>
        )}
      </div>

      {/* Code Search Input */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="Código (Ej: NYC-2401)"
            className="w-full text-xs font-bold uppercase p-3 pl-9 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-red-600 placeholder-gray-600"
          />
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-600" />
        </div>
        <button
          type="submit"
          className="px-5 bg-red-600 text-white text-xs font-black uppercase rounded-xl hover:bg-red-700 transition-colors"
        >
          Buscar
        </button>
      </form>

      {/* Tracking Results */}
      {searched && trackedOrder ? (
        <div className="space-y-6">
          {/* Order Brief */}
          <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs uppercase tracking-widest font-bold text-red-500">
                Pedido {trackedOrder.code}
              </span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                trackedOrder.status === OrderStatus.CANCELLED 
                  ? "bg-red-600 text-white animate-pulse" 
                  : "bg-green-600 text-white"
              }`}>
                {trackedOrder.status}
              </span>
            </div>
            
            <div className="space-y-1.5 text-xs">
              <p className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="truncate">{trackedOrder.address}</span>
              </p>
              <p className="flex items-center gap-2 text-gray-400">
                <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span>{trackedOrder.phone} ({trackedOrder.name})</span>
              </p>
              <p className="font-bold text-white mt-1">
                Método: {trackedOrder.paymentMethod === "Caja" ? "Retiro en Caja (Local)" : "Envío a Domicilio"}
              </p>
            </div>
          </div>

          {/* Cancelled State */}
          {trackedOrder.status === OrderStatus.CANCELLED ? (
            <div className="p-4 bg-red-600/10 border border-red-600/20 rounded-2xl text-center">
              <p className="text-sm font-black text-red-400">PEDIDO CANCELADO</p>
              <p className="text-[10px] text-gray-500 mt-1">
                Este pedido ha sido anulado por la administración. Comunícate con soporte al local para más información.
              </p>
            </div>
          ) : (
            /* Stepper Graphic */
            <div className="relative pl-6 space-y-6">
              {/* Vertical line connector */}
              <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-white/10"></div>
              
              {steps.map((step, idx) => {
                const isCompleted = idx < currentStepIdx;
                const isActive = idx === currentStepIdx;
                const StepIcon = step.icon;

                return (
                  <div key={step.status} className="relative flex gap-4 items-start">
                    {/* Glowing status circle */}
                    <div className={`absolute -left-[22px] w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-300 ${
                      isCompleted 
                        ? "bg-green-500 border-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.4)]" 
                        : isActive
                        ? "bg-red-600 border-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.6)] animate-pulse"
                        : "bg-[#151515] border-white/10 text-gray-500"
                    }`}>
                      <span className="w-1.5 h-1.5 bg-current rounded-full"></span>
                    </div>

                    {/* Step Icon */}
                    <div className={`p-2 rounded-xl border shrink-0 transition-colors ${
                      isActive 
                        ? "bg-red-600/20 border-red-600 text-red-500" 
                        : isCompleted 
                        ? "bg-green-500/10 border-green-500/30 text-green-400"
                        : "bg-white/5 border-white/5 text-gray-600"
                    }`}>
                      <StepIcon className="w-4 h-4" />
                    </div>

                    {/* Step description */}
                    <div>
                      <h4 className={`text-xs font-black uppercase tracking-wider ${
                        isActive ? "text-white" : isCompleted ? "text-green-400" : "text-gray-500"
                      }`}>
                        {step.label}
                      </h4>
                      <p className="text-[10px] text-gray-500 leading-snug mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Direct WhatsApp Message helper */}
          <div className="pt-2">
            <a
              href={`https://wa.me/${trackedOrder.phone}?text=Hola%20Luigi!%20Consulto%20por%20mi%20pedido%20${trackedOrder.code}%20en%20preparacion.`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Preguntar por WhatsApp
            </a>
          </div>
        </div>
      ) : searched ? (
        <div className="p-8 text-center bg-black/20 rounded-2xl border border-white/5">
          <p className="text-sm font-bold text-gray-400">Código de pedido no encontrado</p>
          <p className="text-[10px] text-gray-600 mt-1">
            Verifica que esté escrito exactamente, por ejemplo: NYC-2401
          </p>
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500 border border-dashed border-white/10 rounded-2xl">
          <Clock className="w-8 h-8 text-gray-600 mx-auto mb-2 animate-bounce" />
          <p className="text-xs font-medium">Ingresa un código para rastrear su estado en vivo.</p>
        </div>
      )}
    </div>
  );
};
