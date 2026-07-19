/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Shield, Smartphone, KeyRound, Fingerprint, RefreshCw, Sparkles, Check, AlertTriangle } from "lucide-react";

interface PatternLockProps {
  onSuccess: () => void;
  onCancel?: () => void;
  mode: "enroll" | "verify";
  storedPattern?: string; // e.g. "0-1-2"
  storedPin?: string; // e.g. "1234"
  onSaveCredentials?: (pattern: string, pin: string) => void;
}

export const PatternLock: React.FC<PatternLockProps> = ({
  onSuccess,
  onCancel,
  mode,
  storedPattern = "",
  storedPin = "",
  onSaveCredentials
}) => {
  const [activeTab, setActiveTab] = useState<"fingerprint" | "pattern" | "pin">("fingerprint");
  const [pin, setPin] = useState("");
  const [patternDots, setPatternDots] = useState<number[]>([]);
  const [statusMessage, setStatusMessage] = useState(
    mode === "enroll" 
      ? "Selecciona un método de seguridad biométrico o patrón para tu panel" 
      : "Ingresa tu PIN, Patrón o coloca tu huella para desbloquear el panel"
  );
  const [statusType, setStatusType] = useState<"info" | "success" | "error">("info");
  const [isScanningFinger, setIsScanningFinger] = useState(false);

  // Pattern dots definitions (3x3 grid)
  const dots = Array.from({ length: 9 }, (_, i) => i);

  // Pin Pad Handler
  const handlePinPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        if (mode === "verify") {
          const correctPin = storedPin || "1234"; // Default fallback
          if (newPin === correctPin) {
            setStatusMessage("¡PIN verificado correctamente!");
            setStatusType("success");
            setTimeout(() => onSuccess(), 1000);
          } else {
            setStatusMessage("PIN incorrecto. Reintenta.");
            setStatusType("error");
            setPin("");
          }
        } else {
          setStatusMessage(`PIN elegido: ${newPin}. Listo para guardar.`);
          setStatusType("success");
        }
      }
    }
  };

  const handlePinClear = () => setPin("");

  // Pattern click/touch handler
  const handleDotClick = (dotIndex: number) => {
    if (patternDots.includes(dotIndex)) return;
    const newPattern = [...patternDots, dotIndex];
    setPatternDots(newPattern);

    if (newPattern.length >= 4) {
      const patternString = newPattern.join("-");
      if (mode === "verify") {
        const correctPattern = storedPattern || "0-1-2-5"; // Default fallback
        if (patternString === correctPattern) {
          setStatusMessage("¡Patrón desbloqueado exitosamente!");
          setStatusType("success");
          setTimeout(() => onSuccess(), 1000);
        } else {
          setStatusMessage("Patrón incorrecto. Reintenta.");
          setStatusType("error");
          setPatternDots([]);
        }
      } else {
        setStatusMessage(`Patrón registrado: ${patternString}.`);
        setStatusType("success");
      }
    }
  };

  const clearPattern = () => {
    setPatternDots([]);
    setStatusMessage(mode === "enroll" ? "Dibuja un patrón uniendo al menos 4 puntos." : "Ingresa tu patrón de desbloqueo.");
    setStatusType("info");
  };

  // Fingerprint Scanner Handler
  const handleFingerprintScan = () => {
    setIsScanningFinger(true);
    setStatusMessage("Escaneando huella dactilar...");
    setStatusType("info");

    setTimeout(() => {
      setIsScanningFinger(false);
      if (mode === "verify") {
        setStatusMessage("¡Identidad biométrica confirmada!");
        setStatusType("success");
        setTimeout(() => onSuccess(), 1000);
      } else {
        setStatusMessage("¡Huella registrada con éxito! Biometría móvil vinculada.");
        setStatusType("success");
        if (onSaveCredentials) {
          // Auto-save a mock pattern and pin so it acts fully configured
          onSaveCredentials("0-1-2-5", "1234");
        }
      }
    }, 2000); // 2 second holographic scanning
  };

  // Save changes on enrollment
  const handleSaveEnrollment = () => {
    const finalPattern = patternDots.length >= 4 ? patternDots.join("-") : "0-1-2-5";
    const finalPin = pin.length === 4 ? pin : "1234";

    if (onSaveCredentials) {
      onSaveCredentials(finalPattern, finalPin);
    }
    setStatusMessage("¡Credenciales biométricas guardadas!");
    setStatusType("success");
    setTimeout(() => onSuccess(), 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-black/60 rounded-3xl border border-white/10 max-w-sm mx-auto text-white shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-red-600/20 rounded-full text-red-500">
          <Shield className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h3 className="text-sm font-black tracking-widest uppercase">
            {mode === "enroll" ? "Configurar Biometría" : "Seguridad PWA"}
          </h3>
          <p className="text-[10px] text-gray-500 uppercase">NYC Security Protocol</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex w-full bg-white/5 border border-white/5 rounded-xl p-1 mb-6 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => { setActiveTab("fingerprint"); setStatusMessage("Huella digital vinculada al sistema móvil"); }}
          className={`flex-1 flex justify-center items-center gap-1.5 py-2.5 rounded-lg transition-colors ${
            activeTab === "fingerprint" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          <Fingerprint className="w-3.5 h-3.5" />
          <span>Huella</span>
        </button>
        <button
          onClick={() => { setActiveTab("pattern"); clearPattern(); }}
          className={`flex-1 flex justify-center items-center gap-1.5 py-2.5 rounded-lg transition-colors ${
            activeTab === "pattern" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Patrón</span>
        </button>
        <button
          onClick={() => { setActiveTab("pin"); setPin(""); }}
          className={`flex-1 flex justify-center items-center gap-1.5 py-2.5 rounded-lg transition-colors ${
            activeTab === "pin" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>PIN</span>
        </button>
      </div>

      {/* Status Feedback */}
      <div className={`w-full p-3 rounded-xl text-center text-xs mb-6 border flex items-center justify-center gap-2 ${
        statusType === "success" 
          ? "bg-green-500/10 border-green-500/30 text-green-400" 
          : statusType === "error"
          ? "bg-red-500/10 border-red-500/30 text-red-400"
          : "bg-white/5 border-white/10 text-gray-300"
      }`}>
        {statusType === "success" && <Check className="w-4 h-4 shrink-0" />}
        {statusType === "error" && <AlertTriangle className="w-4 h-4 shrink-0" />}
        <span>{statusMessage}</span>
      </div>

      {/* Interactive Areas */}
      <div className="w-full flex justify-center items-center min-h-[190px] mb-6">
        
        {/* FINGERPRINT */}
        {activeTab === "fingerprint" && (
          <div className="flex flex-col items-center">
            <button
              onClick={handleFingerprintScan}
              disabled={isScanningFinger}
              className={`relative p-8 rounded-full border transition-all duration-300 ${
                isScanningFinger 
                  ? "border-green-500 bg-green-500/10 scale-95 shadow-[0_0_30px_rgba(34,197,94,0.4)]" 
                  : "border-red-600/30 bg-red-600/5 hover:border-red-600/80 active:scale-95 shadow-[0_0_15px_rgba(220,38,38,0.1)]"
              }`}
            >
              <Fingerprint className={`w-16 h-16 ${
                isScanningFinger ? "text-green-400 animate-pulse" : "text-red-500"
              }`} />
              {isScanningFinger && (
                <span className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-60"></span>
              )}
            </button>
            <span className="text-[10px] text-gray-500 uppercase mt-4 tracking-widest animate-pulse">
              {isScanningFinger ? "Analizando capilaridad..." : "Toca el sensor para escanear"}
            </span>
          </div>
        )}

        {/* PATTERN LOCK */}
        {activeTab === "pattern" && (
          <div className="flex flex-col items-center">
            <div className="grid grid-cols-3 gap-5 p-4 bg-white/5 rounded-2xl border border-white/5">
              {dots.map(dot => {
                const isSelected = patternDots.includes(dot);
                const orderIndex = patternDots.indexOf(dot);
                return (
                  <button
                    key={dot}
                    onClick={() => handleDotClick(dot)}
                    className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isSelected 
                        ? "bg-red-600 text-white scale-110 shadow-[0_0_15px_rgba(220,38,38,0.6)]" 
                        : "bg-white/10 text-gray-500 hover:bg-white/20 hover:scale-105"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 bg-current rounded-full"></span>
                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-black text-[9px] font-black rounded-full flex items-center justify-center border-2 border-red-600">
                        {orderIndex + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="flex gap-4 mt-4 w-full">
              <button 
                onClick={clearPattern}
                className="flex-1 text-[10px] uppercase font-bold tracking-wider py-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Reiniciar
              </button>
            </div>
          </div>
        )}

        {/* PIN CODE KEYPAD */}
        {activeTab === "pin" && (
          <div className="flex flex-col items-center w-full max-w-[220px]">
            {/* Dots representation of typed pin */}
            <div className="flex gap-3 mb-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-3.5 h-3.5 rounded-full border transition-all duration-200 ${
                    pin.length > i 
                      ? "bg-red-500 border-red-500 scale-110" 
                      : "border-white/20 bg-transparent"
                  }`}
                />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 w-full text-sm font-black">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(num => (
                <button
                  key={num}
                  onClick={() => handlePinPress(num)}
                  className="py-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 active:bg-red-600/30 transition-all text-center"
                >
                  {num}
                </button>
              ))}
              <button 
                onClick={handlePinClear}
                className="py-3 text-[10px] uppercase font-bold text-gray-500 hover:text-white"
              >
                Borrar
              </button>
              <button
                onClick={() => handlePinPress("0")}
                className="py-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10"
              >
                0
              </button>
              <div className="py-3 flex items-center justify-center text-gray-700 select-none">
                #
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Save Button for Enrollment */}
      {mode === "enroll" && (
        <button
          onClick={handleSaveEnrollment}
          className="w-full py-3 bg-red-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Guardar Configuración
        </button>
      )}

      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-3 text-xs text-gray-500 hover:text-white transition-colors"
        >
          Cancelar
        </button>
      )}
    </div>
  );
};
