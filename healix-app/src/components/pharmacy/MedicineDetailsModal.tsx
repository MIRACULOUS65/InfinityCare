"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Pill, Plus, Package, Clock, Building2 } from "lucide-react";

interface MedicineItem {
  id: string;
  name: string;
  batchNumber: string;
  manufacturer: string;
  expiryDate: string;
  quantity: number;
  status: string;
  registeredAt: string;
}

interface MedicineDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MedicineDetailsModal({ isOpen, onClose }: MedicineDetailsModalProps) {
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [quantity, setQuantity] = useState("");

  const fetchMedicines = () => {
    setIsLoading(true);
    fetch("/api/pharmacy/medicines")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMedicines(data.medicines);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (isOpen) fetchMedicines();
  }, [isOpen]);

  const resetForm = () => {
    setName("");
    setBatchNumber("");
    setManufacturer("");
    setExpiryDate("");
    setQuantity("");
    setShowForm(false);
  };

  const handleAdd = async () => {
    if (!name.trim() || !batchNumber.trim() || !manufacturer.trim() || !expiryDate || !quantity) return;
    setIsAdding(true);
    try {
      const res = await fetch("/api/pharmacy/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, batchNumber, manufacturer, expiryDate, quantity }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMedicines((prev) => [data.medicine, ...prev]);
        resetForm();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center border border-teal-500/30 bg-teal-500/10 text-teal-400">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Medicine Inventory</h2>
              <p className="text-xs text-white/40">Add and view your medicine stock database</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 rounded-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Add New Medicine */}
        <div className="px-6 pt-4 shrink-0">
          {!showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 text-xs border border-dashed border-teal-500/30 text-teal-400 hover:bg-teal-500/10 transition-all font-mono uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5" />
              Add New Medicine to Inventory
            </button>
          ) : (
            <div className="border border-teal-500/20 bg-teal-500/5 p-4 space-y-3">
              <h4 className="text-xs text-teal-400 font-bold uppercase tracking-widest">New Medicine Entry</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Medicine Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30 col-span-2"
                />
                <input
                  placeholder="Batch Number"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                />
                <input
                  placeholder="Manufacturer"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  className="bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                />
                <input
                  type="date"
                  placeholder="Expiry Date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30 [color-scheme:dark]"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={isAdding || !name.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-teal-500 text-black text-xs font-bold uppercase disabled:opacity-50 hover:bg-teal-400 transition-all"
                >
                  {isAdding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  Add Medicine
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 border border-white/10 text-white/50 text-xs hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Inventory Count */}
        {!isLoading && (
          <div className="px-6 pt-3 text-[10px] text-white/30 font-mono uppercase tracking-widest">
            Total Inventory: {medicines.length} medicine{medicines.length !== 1 ? "s" : ""}
          </div>
        )}

        {/* Medicine List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/40 text-xs">
              <Loader2 className="w-6 h-6 animate-spin" />
              Loading inventory...
            </div>
          ) : medicines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/30 text-xs border border-dashed border-white/10">
              <Package className="w-8 h-8 text-white/15" />
              No medicines in inventory. Add your first medicine above.
            </div>
          ) : (
            medicines.map((med) => (
              <div key={med.id} className="border border-white/10 bg-black p-4 flex items-center justify-between">
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-white mb-1">{med.name}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-white/40 font-mono">
                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {med.manufacturer}</span>
                    <span>Batch: {med.batchNumber}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Exp: {new Date(med.expiryDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <span className="text-xs font-mono text-white/60 bg-white/5 border border-white/10 px-2 py-1">
                    Qty: {med.quantity}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${
                    med.status === "GENUINE" ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" : "text-red-400 border-red-500/30 bg-red-500/10"
                  }`}>
                    {med.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
