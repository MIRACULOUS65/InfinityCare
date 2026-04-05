package com.example.infinitecare

data class VitalsResult(
    val heartRate: Int?,
    val respirationRate: Int?,
    val oxygenSaturation: Int?,
    val heartRateVariability: Int?,
    val confidence: Float?,
    val timestamp: Long,
    val sessionId: String,
    val deviceId: String = "device_android",
    val mode: String = "SPOT",
    val calibrationState: String = "Completed"
)

enum class CalibrationState {
    IDLE,
    CALIBRATING,
    READY,
    MEASURING,
    COMPLETED,
    ERROR
}

data class VitalsUiState(
    val calibrationState: CalibrationState = CalibrationState.IDLE,
    val vitals: VitalsResult? = null,
    val isScanning: Boolean = false,
    val calibrationProgress: Float = 0f,
    val statusMessage: String = "Align your face in the center",
    val sessionId: String = ""
)
