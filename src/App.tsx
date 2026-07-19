/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { PizzaProvider, usePizza } from "./context/PizzaContext";
import { CustomerView } from "./components/CustomerView";
import { AdminView } from "./components/AdminView";
import { Bell, Info, Shield, ShoppingBag, X } from "lucide-react";

const MainApp: React.FC = () => {
  const [viewMode, setViewMode] = useState<"customer" | "admin">("customer");
  const { notifications, currentTheme } = usePizza();
  const [activeNotification, setActiveNotification] = useState<any>(null);

  useEffect(() => {
    if (notifications.length > 0) {
      setActiveNotification(notifications[0]);
      const timer = setTimeout(() => {
        setActiveNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  return (
    <div className={`relative min-h-screen ${currentTheme.bg} selection:bg-red-600 selection:text-white`}>
      
      {/* RENDER ACTIVE SCREEN */}
      {viewMode === "customer" ? (
        <CustomerView onOpenAdmin={() => setViewMode("admin")} />
      ) : (
        <AdminView onCloseAdmin={() => setViewMode("customer")} />
      )}

      {/* Floating Interactive Toast (For instant PWA system alert feedback) */}
      {activeNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-neutral-950/95 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl flex items-start gap-3 animate-slide-up font-sans">
          <div className="p-2 bg-red-600/20 text-red-500 rounded-xl shrink-0">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-white">{activeNotification.title}</p>
            <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{activeNotification.message}</p>
            <span className="text-[9px] text-gray-600 uppercase font-black tracking-wider block mt-2">PWA Push System • {activeNotification.timestamp}</span>
          </div>
          <button 
            onClick={() => setActiveNotification(null)}
            className="text-gray-500 hover:text-white transition-colors cursor-pointer self-start p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <PizzaProvider>
      <MainApp />
    </PizzaProvider>
  );
}
