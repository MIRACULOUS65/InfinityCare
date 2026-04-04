import os
import urllib.parse
import psycopg2
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from deepface import DeepFace

app = Flask(__name__)
CORS(app)

CACHE_DIR = "db_cache"
env_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env")

def get_database_url():
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            for line in f:
                if line.startswith("DATABASE_URL="):
                    # Remove quotes, whitespace, and query params like ?pgbouncer=true
                    url = line.split("=", 1)[1].strip().strip('"').strip("'")
                    return url.split("?")[0]
    return None

def sync_patient_faces():
    """Fetches patients from Supabase PG and downloads their Face IDs locally."""
    if not os.path.exists(CACHE_DIR):
        os.makedirs(CACHE_DIR)

    db_url = get_database_url()
    if not db_url:
        print("Warning: DATABASE_URL not found in .env")
        return

    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        cur.execute("SELECT id, image FROM users WHERE role = 'PATIENT' AND image IS NOT NULL;")
        patients = cur.fetchall()
        
        for patient_id, image_url in patients:
            file_path = os.path.join(CACHE_DIR, f"{patient_id}.jpg")
            if not os.path.exists(file_path):
                print(f"Downloading face for patient {patient_id}...")
                try:
                    response = requests.get(image_url, timeout=10)
                    if response.status_code == 200:
                        with open(file_path, "wb") as f:
                            f.write(response.content)
                except Exception as e:
                    print(f"Failed to download image for {patient_id}: {e}")
                    
        cur.close()
        conn.close()
        print("Database sync complete.")
    except Exception as e:
        print(f"PostgreSQL connection error: {e}")

@app.route('/match', methods=['POST'])
def match_face():
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file part"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "error": "No selected file"}), 400

    temp_path = "temp_capture.jpg"
    file.save(temp_path)

    try:
        # Before matching, sync to ensure we have the latest patients
        sync_patient_faces()
        
        # Check if cache is empty
        if len(os.listdir(CACHE_DIR)) == 0:
            return jsonify({"success": False, "error": "No patients in database to match against"}), 404

        # Run DeepFace.find
        dfs = DeepFace.find(
            img_path=temp_path,
            db_path=CACHE_DIR,
            model_name="VGG-Face",
            enforce_detection=False,
            # Using cosine distance, lower threshold means stricter
            distance_metric="cosine", 
            silent=True
        )
        
        if len(dfs) > 0 and len(dfs[0]) > 0:
            # Match found! Extract patient ID from filename
            best_match_path = dfs[0].iloc[0]['identity']
            # e.g. db_cache/cm8i8x0... .jpg
            filename = os.path.basename(best_match_path)
            patient_id = os.path.splitext(filename)[0]
            
            return jsonify({
                "success": True, 
                "patient_id": patient_id,
                "distance": float(dfs[0].iloc[0]['distance'])
            })
            
        return jsonify({"success": False, "error": "No matching patient found"}), 404
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == '__main__':
    print("Pre-syncing database faces...")
    sync_patient_faces()
    # Force initial DeepFace model load to make first query fast
    # By running find on empty/dummy or it natively loads during first hit. We'll let it load on first hit.
    app.run(host='0.0.0.0', port=5000, debug=False)
