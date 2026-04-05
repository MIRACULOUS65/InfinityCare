package com.example.infinitecare

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.mockito.Mockito.*
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever

@OptIn(ExperimentalCoroutinesApi::class)
class MainViewModelTest {

    private val testDispatcher = StandardTestDispatcher()
    private val sdkWrapper: SmartSpectraWrapper = mock()
    private val repository: VitalsRepository = mock()
    private lateinit var viewModel: MainViewModel

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        viewModel = MainViewModel(sdkWrapper, repository)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `startCalibration updates state to CALIBRATING`() = runTest {
        viewModel.startCalibration()
        assertEquals(CalibrationState.CALIBRATING, viewModel.uiState.value.calibrationState)
    }

    @Test
    fun `stopScan updates state to COMPLETED`() {
        viewModel.stopScan()
        assertEquals(CalibrationState.COMPLETED, viewModel.uiState.value.calibrationState)
        verify(sdkWrapper).stop()
    }

    @Test
    fun `reset sets state back to IDLE`() {
        viewModel.stopScan()
        viewModel.reset()
        assertEquals(CalibrationState.IDLE, viewModel.uiState.value.calibrationState)
    }
}
