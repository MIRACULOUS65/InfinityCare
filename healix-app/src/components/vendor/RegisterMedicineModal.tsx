"use client";

import { useState, useEffect } from "react";
import { X, PackagePlus, Link as LinkIcon } from "lucide-react";
import { PeraWalletConnect } from "@perawallet/connect";
import { algodClient, buildRegisterMedicineTxn } from "@/lib/blockchain/utils";
import algosdk from "algosdk";

let peraWallet: PeraWalletConnect;

const getPeraWallet = () => {
  if (typeof window === "undefined") return null;
  if (!peraWallet) {
    peraWallet = new PeraWalletConnect({
      shouldShowSignTxnToast: false,
    });
  }
  return peraWallet;
};

interface RegisterMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RegisterMedicineModal({
  isOpen,
  onClose,
  onSuccess,
}: RegisterMedicineModalProps) {
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    manufacturer: "",
    batchNumber: "",
    expiryDate: "",
    quantity: "",
  });

  // Reconnect session on mount if it exists
  useEffect(() => {
    if (isOpen) {
      const wallet = getPeraWallet();
      if (!wallet) return;

      wallet
        .reconnectSession()
        .then((accounts) => {
          if (accounts.length) {
            setAccountAddress(accounts[0]);
          }
        })
        .catch((e) => console.log(e));
    }
  }, [isOpen]);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError("");
      const wallet = getPeraWallet();
      if (!wallet) return;

      const accounts = await wallet.connect();
      setAccountAddress(accounts[0]);
    } catch (err: any) {
      setError(err?.message || "Failed to connect to Pera Wallet.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    const wallet = getPeraWallet();
    if (wallet) wallet.disconnect();
    setAccountAddress(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountAddress) return;

    try {
      setIsRegistering(true);
      setError("");

      const payload = {
        name: formData.name,
        manufacturer: formData.manufacturer,
        batchNumber: formData.batchNumber,
        expiryDate: formData.expiryDate,
        quantity: parseInt(formData.quantity, 10),
      };

      // 1. Build Algorand Transaction
      const txn = await buildRegisterMedicineTxn(accountAddress, payload);

      // 2. Sign Transaction with Pera Wallet
      const wallet = getPeraWallet();
      if (!wallet) throw new Error("Wallet not initialized");

      const txGroup = [{ txn, signers: [accountAddress] }];
      const signedTxn = await wallet.signTransaction([txGroup]);

      // 3. Submit Transaction to Algorand Testnet
      const txResponse = (await algodClient.sendRawTransaction(signedTxn).do()) as Record<string, any>;
      const txId = txResponse.txid || txResponse.txId;

      // Ensure the transaction hits the network (wait for confirmation)
      await algosdk.waitForConfirmation(algodClient, txId, 4);

      // 4. Save to Database via our API
      const res = await fetch("/api/register-medicine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          txHash: txId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save medicine record to database.");
      }

      onSuccess();
      onClose();
      setFormData({
        name: "",
        manufacturer: "",
        batchNumber: "",
        expiryDate: "",
        quantity: "",
      });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to register medicine. Check the console.");
    } finally {
      setIsRegistering(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl mx-4 bg-[#0a0a0a] border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-white/20 flex items-center justify-center bg-white/5">
              <PackagePlus className="w-4 h-4 text-white/60" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Register Medicine</h2>
              <p className="text-xs text-white/40">Provide batch details to mint an immutable record.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {!accountAddress ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 border-2 border-dashed border-white/10">
              <div className="w-12 h-12 bg-[#FFF04D] flex items-center justify-center rounded-sm">
                <LinkIcon className="w-6 h-6 text-black" />
              </div>
              <div className="text-center">
                <p className="text-sm text-white/90 font-medium mb-1">Connect Pera Wallet</p>
                <p className="text-xs text-white/40 max-w-xs mx-auto">
                  Sign in with your vendor wallet to authenticate and sign the blockchain transaction.
                </p>
              </div>
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="mt-2 bg-[#FFF04D] text-black hover:bg-[#e6d845] font-bold text-xs px-6 py-2.5 transition-colors disabled:opacity-50"
              >
                {isConnecting ? "Connecting..." : "Connect Pera Wallet"}
              </button>
              {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between p-3 border border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-white/60 font-mono">
                    {accountAddress.substring(0, 8)}...{accountAddress.substring(accountAddress.length - 8)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="text-[10px] text-white/40 hover:text-white uppercase tracking-wider underline-offset-2 hover:underline"
                >
                  Disconnect
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 focus-within:text-white text-white/40 transition-colors">
                  <label className="text-[10px] uppercase font-bold tracking-widest">Medicine Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-colors"
                    placeholder="e.g. Amoxicillin 500mg"
                  />
                </div>

                <div className="space-y-1.5 focus-within:text-white text-white/40 transition-colors">
                  <label className="text-[10px] uppercase font-bold tracking-widest">Manufacturer</label>
                  <input
                    required
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full bg-black border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-colors"
                    placeholder="e.g. PharmaCorp Inc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5 focus-within:text-white text-white/40 transition-colors">
                  <label className="text-[10px] uppercase font-bold tracking-widest">Batch Number</label>
                  <input
                    required
                    type="text"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    className="w-full bg-black border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/40 transition-colors font-mono"
                    placeholder="BN-109283"
                  />
                </div>

                <div className="space-y-1.5 focus-within:text-white text-white/40 transition-colors">
                  <label className="text-[10px] uppercase font-bold tracking-widest">Expiry Date</label>
                  <input
                    required
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full bg-black border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/40 transition-colors [color-scheme:dark]"
                  />
                </div>

                <div className="space-y-1.5 focus-within:text-white text-white/40 transition-colors">
                  <label className="text-[10px] uppercase font-bold tracking-widest">Quantity</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full bg-black border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/40 transition-colors"
                    placeholder="1000"
                  />
                </div>
              </div>

              {error && <div className="text-xs text-red-500 bg-red-500/10 p-3 border border-red-500/20">{error}</div>}

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isRegistering}
                  className="px-4 py-2 text-xs font-medium text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="px-6 py-2 text-xs font-medium bg-white text-black hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isRegistering && <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />}
                  {isRegistering ? "Signing & Minting..." : "Sign & Register (0 ALGO)"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
