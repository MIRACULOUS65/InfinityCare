package com.example.infinitecare

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.compose.ui.viewinterop.AndroidView
import com.presagetech.smartspectra.SmartSpectraButton
import com.example.infinitecare.ui.theme.InfiniteCareTheme

class MainActivity : ComponentActivity() {
    
    private val smartSpectraWrapper by lazy { SmartSpectraWrapper(applicationContext) }
    private val repository by lazy { VitalsRepository() }
    
    private val viewModel: MainViewModel by viewModels {
        object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                @Suppress("UNCHECKED_CAST")
                return MainViewModel(smartSpectraWrapper, repository) as T
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            InfiniteCareTheme {
                MainScreen(viewModel)
            }
        }
    }
}

@Composable
fun MainScreen(viewModel: MainViewModel) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    
    val permissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            viewModel.onPermissionGranted()
        } else {
            Toast.makeText(context, "Camera permission required", Toast.LENGTH_LONG).show()
        }
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = Color(0xFF0F172A)
    ) { padding ->
        Box(modifier = Modifier.padding(padding)) {
            when (uiState.calibrationState) {
                CalibrationState.IDLE -> HomeScreen(onStart = {
                    val permission = Manifest.permission.CAMERA
                    if (ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED) {
                        viewModel.startCalibration()
                    } else {
                        permissionLauncher.launch(permission)
                    }
                })
                CalibrationState.CALIBRATING -> CalibrationScreen(uiState)
                CalibrationState.READY, CalibrationState.MEASURING -> ScanScreen(uiState, viewModel)
                CalibrationState.COMPLETED -> SummaryScreen(uiState.vitals, onReset = { viewModel.reset() })
                CalibrationState.ERROR -> ErrorScreen(uiState.statusMessage, onReset = { viewModel.reset() })
            }
        }
    }
}

@Composable
fun HomeScreen(onStart: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("InfiniteCare", fontSize = 32.sp, fontWeight = FontWeight.Bold, color = Color.White)
        Spacer(modifier = Modifier.height(8.dp))
        Text("Precision Vital Signs Monitoring", color = Color(0xFF94A3B8), fontSize = 16.sp)
        Spacer(modifier = Modifier.height(48.dp))
        Button(
            onClick = onStart,
            modifier = Modifier.fillMaxWidth().height(56.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3B82F6))
        ) {
            Text("Start New Session", fontSize = 18.sp)
        }
    }
}

@Composable
fun CalibrationScreen(uiState: VitalsUiState) {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        CircularProgressIndicator(
            progress = { uiState.calibrationProgress },
            modifier = Modifier.size(120.dp),
            color = Color(0xFF3B82F6),
            strokeWidth = 8.dp
        )
        Spacer(modifier = Modifier.height(32.dp))
        Text("Calibrating...", fontSize = 24.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
        Spacer(modifier = Modifier.height(16.dp))
        Card(
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
            shape = RoundedCornerShape(16.dp)
        ) {
            Text(uiState.statusMessage, modifier = Modifier.padding(24.dp), color = Color.White, textAlign = TextAlign.Center)
        }
    }
}

@Composable
fun ScanScreen(uiState: VitalsUiState, viewModel: MainViewModel) {
    Box(modifier = Modifier.fillMaxSize()) {
        // SDK UI Integration Point
        AndroidView(
            factory = { context ->
                SmartSpectraButton(context, null).apply {
                    // The button handles the transition to the scanning UI
                    // and internal SDK results.
                }
            },
            modifier = Modifier.fillMaxSize()
        )

        Column(
            modifier = Modifier.fillMaxSize().padding(24.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                StatusChip("LIVE", Color(0xFFEF4444))
                StatusChip("Confidence: ${"%.0f".format((uiState.vitals?.confidence ?: 0f) * 100)}%", Color(0xFF10B981))
            }

            Column(modifier = Modifier.fillMaxWidth()) {
                VitalsCard("Heart Rate", uiState.vitals?.heartRate?.toString() ?: "--", "BPM")
                Spacer(modifier = Modifier.height(16.dp))
                VitalsCard("SpO2", uiState.vitals?.oxygenSaturation?.toString() ?: "--", "%")
                Spacer(modifier = Modifier.height(16.dp))
                VitalsCard("Respiration", uiState.vitals?.respirationRate?.toString() ?: "--", "RPM")
            }

            Button(
                onClick = { viewModel.stopScan() },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444))
            ) {
                Text("Stop Scan")
            }
        }
    }
}

@Composable
fun SummaryScreen(vitals: VitalsResult?, onReset: () -> Unit) {
    Column(modifier = Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
        Text("Session Complete", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = Color.White)
        Spacer(modifier = Modifier.height(32.dp))
        VitalsCard("Final HR", vitals?.heartRate?.toString() ?: "--", "BPM")
        Spacer(modifier = Modifier.height(16.dp))
        VitalsCard("Final SpO2", vitals?.oxygenSaturation?.toString() ?: "--", "%")
        Spacer(modifier = Modifier.height(16.dp))
        VitalsCard("Final Resp", vitals?.respirationRate?.toString() ?: "--", "RPM")
        Spacer(modifier = Modifier.height(48.dp))
        Button(onClick = onReset, modifier = Modifier.fillMaxWidth()) { Text("Back to Home") }
    }
}

@Composable
fun StatusChip(text: String, color: Color) {
    Surface(color = color.copy(alpha = 0.2f), contentColor = color, shape = RoundedCornerShape(16.dp)) {
        Text(text, modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp), fontSize = 12.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun VitalsCard(label: String, value: String, unit: String) {
    Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(20.dp), colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))) {
        Row(modifier = Modifier.padding(24.dp).fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Column {
                Text(label, color = Color(0xFF94A3B8), fontSize = 14.sp)
                Text(value, color = Color.White, fontSize = 48.sp, fontWeight = FontWeight.Bold)
            }
            Text(unit, color = Color(0xFF94A3B8), fontSize = 18.sp)
        }
    }
}

@Composable
fun ErrorScreen(message: String, onReset: () -> Unit) {
    Column(modifier = Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
        Text("Error", color = Color.Red, fontSize = 24.sp)
        Text(message, color = Color.White, textAlign = TextAlign.Center)
        Spacer(modifier = Modifier.height(24.dp))
        Button(onClick = onReset) { Text("Retry") }
    }
}
