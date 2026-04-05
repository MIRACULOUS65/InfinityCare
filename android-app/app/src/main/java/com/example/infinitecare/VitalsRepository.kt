package com.example.infinitecare

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class VitalsRepository {

    private val retrofit = Retrofit.Builder()
        .baseUrl("http://10.0.2.2:3000") // Use 10.0.2.2 for Android Emulator to access host localhost
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    private val api = retrofit.create(ApiService::class.java)

    suspend fun syncVitals(result: VitalsResult) = withContext(Dispatchers.IO) {
        try {
            val response = api.ingestVitals(
                token = "Bearer your_secure_token", // TODO: Use real secure token
                vitals = result
            )
            if (response.isSuccessful) {
                Log.d("VitalsRepository", "Successfully synced vitals")
            } else {
                Log.e("VitalsRepository", "Failed to sync vitals: ${response.code()}")
            }
        } catch (e: Exception) {
            Log.e("VitalsRepository", "Error syncing vitals", e)
        }
    }
}
