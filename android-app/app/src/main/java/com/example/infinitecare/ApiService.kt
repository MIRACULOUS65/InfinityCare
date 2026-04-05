package com.example.infinitecare

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST

interface ApiService {
    @POST("/api/v1/vitals/ingest")
    suspend fun ingestVitals(
        @Header("Authorization") token: String,
        @Body vitals: VitalsResult
    ): Response<Unit>
}
