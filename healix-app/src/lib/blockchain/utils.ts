import algosdk from "algosdk";

// Use public Algorand Testnet nodes (AlgoNode)
const ALGOD_SERVER = "https://testnet-api.algonode.cloud";
const ALGOD_PORT = "";
const ALGOD_TOKEN = "";

export const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);

export interface MedicinePayload {
  name: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
}

/**
 * Builds a 0-ALGO transaction to exactly store standard JSON metadata
 * on the Algorand testnet. Returns a standard transaction object 
 * that can be signed by Pera Wallet.
 */
export async function buildRegisterMedicineTxn(
  senderAddress: string,
  payload: MedicinePayload
): Promise<algosdk.Transaction> {
  const suggestedParams = await algodClient.getTransactionParams().do();
  
  // Encode the medicine metadata as a JSON string into a Uint8Array
  const noteContent = new TextEncoder().encode(JSON.stringify({
    type: "HEALIX_MEDICINE_REGISTRATION",
    ...payload,
    timestamp: new Date().toISOString()
  }));

  // Create a 0-ALGO payment transaction to self
  // The value of this transaction is the immutable JSON note attached to it
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: senderAddress,
    receiver: senderAddress,
    amount: 0,
    note: noteContent,
    suggestedParams,
  });

  return txn;
}
