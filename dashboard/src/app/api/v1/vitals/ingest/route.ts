import { NextRequest, NextResponse } from 'next/server';

// In-memory store for demo purposes. In a real app, use a database.
let latestVitals: any = null;
const vitalsHistory: any[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received vitals:', body);

    const vitalEntry = {
      ...body,
      receivedAt: new Date().toISOString()
    };

    latestVitals = vitalEntry;
    vitalsHistory.push(vitalEntry);

    // Keep history manageable
    if (vitalsHistory.length > 100) vitalsHistory.shift();

    return NextResponse.json({ success: true, message: 'Vitals ingested successfully' }, { status: 200 });
  } catch (error) {
    console.error('Ingestion error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ latest: latestVitals, history: vitalsHistory });
}
