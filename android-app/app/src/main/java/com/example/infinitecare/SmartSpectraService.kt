package com.example.infinitecare

import android.content.Context
import android.util.Log
import com.presagetech.smartspectra.SmartSpectraSdk
import com.presage.physiology.proto.MetricsProto
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow

class SmartSpectraService(private val context: Context) {

    private val sdk = SmartSpectraSdk.getInstance()

    init {
        // Securely initialize the SDK with the API key
        sdk.apply {
            setApiKey("lEHxGxUEji7vFiQKMXqiS44LbuMrwLuBaqLBbiWS")
        }
    }

    fun startMetricsFlow(): Flow<MetricsProto.MetricsBuffer> = callbackFlow {
        val observer: (MetricsProto.MetricsBuffer) -> Unit = { metrics ->
            trySend(metrics)
        }
        sdk.setMetricsBufferObserver(observer)
        
        awaitClose {
            // SDK observer is non-nullable, so we provide an empty lambda to "stop" processing
            sdk.setMetricsBufferObserver { }
        }
    }

    fun stopMetrics() {
        sdk.setMetricsBufferObserver { }
    }
}
