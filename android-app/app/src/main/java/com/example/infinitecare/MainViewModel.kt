package com.example.infinitecare

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.*

class MainViewModel(
    private val sdkWrapper: SmartSpectraWrapper,
    private val repository: VitalsRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(VitalsUiState(sessionId = UUID.randomUUID().toString()))
    val uiState = _uiState.asStateFlow()

    fun onPermissionGranted() {
        startCalibration()
    }

    fun startCalibration() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(calibrationState = CalibrationState.CALIBRATING)
            
            val tips = listOf(
                "Align your face within the frame",
                "Ensure you are in a well-lit area",
                "Keep a stable posture",
                "Ready in 3...",
                "Ready in 2...",
                "Ready in 1..."
            )

            for (i in tips.indices) {
                _uiState.value = _uiState.value.copy(
                    statusMessage = tips[i],
                    calibrationProgress = (i + 1).toFloat() / tips.size
                )
                delay(1000)
            }

            _uiState.value = _uiState.value.copy(
                calibrationState = CalibrationState.MEASURING,
                isScanning = true
            )
            startMeasurement()
        }
    }

    private fun startMeasurement() {
        viewModelScope.launch {
            sdkWrapper.observeMetrics().collect { result ->
                _uiState.value = _uiState.value.copy(vitals = result)
                
                // Sync to backend via repository
                repository.syncVitals(result)
            }
        }
    }

    fun stopScan() {
        sdkWrapper.stop()
        _uiState.value = _uiState.value.copy(
            calibrationState = CalibrationState.COMPLETED,
            isScanning = false
        )
    }

    fun reset() {
        _uiState.value = VitalsUiState(sessionId = UUID.randomUUID().toString())
    }
}
