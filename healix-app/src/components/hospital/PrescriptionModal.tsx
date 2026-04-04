"use client";

import { useState } from "react";
import { X, Search, User, Loader2, Pill, SendHorizontal, Plus, Trash2, CheckCircle2 } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  email: string;
}

interface MedicineEntry {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const emptyMedicine = (): MedicineEntry => ({ name: "", dosage: "", frequency: "", duration: "" });

export function PrescriptionModal({ isOpen, onClose }: PrescriptionModalProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [medicines, setMedicines] = useState<MedicineEntry[]>([emptyMedicine()]);
  const [instructions, setInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const resetState = () => {
    setQuery("");
    setPatients([]);
    setHasSearched(false);
    setSelectedPatient(null);
    setMedicines([emptyMedicine()]);
    setInstructions("");
    setIsSubmitting(false);
    setSuccess(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    setPatients([]);
    setHasSearched(false);
    setSelectedPatient(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/hospital/search-patient?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setPatients(data.patients);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  const updateMedicine = (index: number, field: keyof MedicineEntry, value: string) => {
    setMedicines((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };

  const addMedicine = () => setMedicines((prev) => [...prev, emptyMedicine()]);

  const removeMedicine = (index: number) => {
    if (medicines.length > 1) {
      setMedicines((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!selectedPatient) return;
    const validMedicines = medicines.filter((m) => m.name.trim());
    if (validMedicines.length === 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/hospital/prescribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          medicines: validMedicines,
          instructions: instructions.trim() || null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-5xl bg-[#0a0a0a] border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Type Prescription</h2>
              <p className="text-xs text-white/40">Search a patient, then prescribe medication directly into their vault</p>
            </div>
          </div>
          <button onClick={handleClose} className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 rounded-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-[500px]">

          {/* Left panel: Search */}
          <div className="w-full lg:w-2/5 border-r border-white/10 flex flex-col bg-black">
            <div className="p-6 border-b border-white/10 shrink-0">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Name, Email, or ID..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30 font-mono"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isSearching || !query.trim()}
                  className="px-4 py-2 bg-white text-black text-xs font-bold uppercase disabled:opacity-50 hover:bg-white/90 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                </button>
              </form>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              {isSearching ? (
                <div className="p-8 text-center text-white/50 text-xs flex flex-col justify-center items-center gap-2 h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-white/40" />
                  Querying patient registry...
                </div>
              ) : hasSearched && patients.length === 0 ? (
                <div className="p-8 text-center text-white/50 text-xs h-full flex items-center justify-center flex-col gap-2">
                  <User className="w-8 h-8 text-white/20" />
                  No patients found matching your search.
                </div>
              ) : patients.length > 0 ? (
                <div className="space-y-1 p-2">
                  {patients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => { setSelectedPatient(patient); setSuccess(false); }}
                      className={`w-full text-left p-4 flex items-center gap-4 transition-colors border ${
                        selectedPatient?.id === patient.id
                          ? "bg-white/10 border-white/20 ring-1 ring-indigo-500/50"
                          : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/10"
                      }`}
                    >
                      <div className="w-10 h-10 border border-white/10 bg-black flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-white/50" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-sm text-white truncate">{patient.name}</p>
                        <p className="text-xs text-white/40 truncate font-mono mt-0.5">{patient.email}</p>
                      </div>
                      <div className="ml-auto shrink-0">
                        <span className="text-[10px] text-indigo-400 border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 font-bold uppercase">Prescribe</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-white/30 text-xs h-full flex flex-col items-center justify-center gap-3">
                  <Search className="w-8 h-8 text-white/10" />
                  Search for a patient to begin prescribing.
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Prescription Form */}
          <div className="w-full lg:w-3/5 flex flex-col bg-[#050505]">
            {!selectedPatient ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-white/30 text-xs gap-3">
                <Pill className="w-10 h-10 text-white/10" />
                Select a patient from search results to begin writing a prescription.
              </div>
            ) : success ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-400" />
                <h3 className="text-lg font-bold text-emerald-400">Prescription Sent!</h3>
                <p className="text-xs text-white/40 max-w-[300px]">
                  Prescription for <span className="text-white font-bold">{selectedPatient.name}</span> has been saved to their medical vault. The patient has been notified.
                </p>
                <button
                  onClick={() => { setSelectedPatient(null); setSuccess(false); setMedicines([emptyMedicine()]); setInstructions(""); }}
                  className="mt-4 px-6 py-2 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase hover:bg-indigo-500/10 transition-all"
                >
                  Prescribe Another
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Patient Header */}
                <div className="p-6 bg-white/[0.02] border-b border-white/10 shrink-0">
                  <h3 className="font-bold text-lg text-white mb-1">Prescribing for: <span className="text-indigo-400">{selectedPatient.name}</span></h3>
                  <p className="text-xs text-white/40 font-mono">ID: {selectedPatient.id}</p>
                </div>

                {/* Form */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                  {/* Medicines */}
                  <div className="space-y-3">
                    <h4 className="text-xs text-white/60 font-bold uppercase tracking-widest">Medicines</h4>
                    {medicines.map((med, i) => (
                      <div key={i} className="grid grid-cols-[1fr_auto] gap-2 p-4 border border-white/10 bg-black">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            placeholder="Medicine Name"
                            value={med.name}
                            onChange={(e) => updateMedicine(i, "name", e.target.value)}
                            className="bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30 col-span-2"
                          />
                          <input
                            placeholder="Dosage (e.g. 500mg)"
                            value={med.dosage}
                            onChange={(e) => updateMedicine(i, "dosage", e.target.value)}
                            className="bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                          />
                          <input
                            placeholder="Frequency (e.g. Twice daily)"
                            value={med.frequency}
                            onChange={(e) => updateMedicine(i, "frequency", e.target.value)}
                            className="bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                          />
                          <input
                            placeholder="Duration (e.g. 7 days)"
                            value={med.duration}
                            onChange={(e) => updateMedicine(i, "duration", e.target.value)}
                            className="bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30 col-span-2"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMedicine(i)}
                          disabled={medicines.length === 1}
                          className="self-start p-2 text-white/30 hover:text-red-400 disabled:opacity-20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addMedicine}
                      className="flex items-center gap-2 w-full py-2 text-xs border border-dashed border-white/20 hover:border-white/40 text-white/50 hover:text-white justify-center transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Another Medicine
                    </button>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-2">
                    <h4 className="text-xs text-white/60 font-bold uppercase tracking-widest">Additional Instructions</h4>
                    <textarea
                      placeholder="Any dietary restrictions, follow-up notes, or warnings..."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30 resize-none"
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="p-6 border-t border-white/10 shrink-0">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || medicines.every((m) => !m.name.trim())}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-500 text-white text-sm font-bold uppercase tracking-wider hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <SendHorizontal className="w-4 h-4" />
                        Push Prescription to Patient Vault
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
