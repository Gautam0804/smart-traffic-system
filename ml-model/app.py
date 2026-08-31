import os
import base64
import cv2
import numpy as np
import requests

from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO


# =========================================================
# CONFIG
# =========================================================

HOST = "0.0.0.0"
PORT = int(os.getenv("PORT", "8001"))

MODEL_NAME = os.getenv("MODEL_NAME", "yolov8n.pt")

NODE_API_URL = os.getenv(
    "NODE_API_URL",
    "http://192.168.1.5:5000/api/traffic/update"
)


# =========================================================
# FLASK
# =========================================================

app = Flask(__name__)

CORS(
    app,
    resources={
        r"/*": {
            "origins": "*"
        }
    }
)


# =========================================================
# YOLO MODEL
# =========================================================

print("🧠 Loading YOLO model...")

model = YOLO(MODEL_NAME)

print("✅ YOLO model loaded")


# =========================================================
# VEHICLE CLASSES
# =========================================================

# COCO classes
#
# 2 = car
# 3 = motorcycle
# 5 = bus
# 7 = truck

VEHICLE_CLASSES = {
    2,
    3,
    5,
    7
}


CLASS_NAMES = {
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck"
}


# =========================================================
# HEALTH CHECK
# =========================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "success": True,
        "service": "Smart Traffic AI - YOLO ML",
        "status": "running",
        "model": MODEL_NAME,
        "host": HOST,
        "port": PORT,

        "endpoints": {
            "health": "GET /",
            "prediction": "GET /ml-predict",
            "detection": "POST /detect"
        }
    })


# =========================================================
# TRAFFIC PREDICTION
# =========================================================

@app.route("/ml-predict", methods=["GET"])
def ml_predict():

    return jsonify({
        "success": True,

        "prediction": {
            "north": 0,
            "south": 0,
            "east": 0,
            "west": 0
        },

        "trafficLevel": "low",

        "message": "Traffic prediction service is running"
    })


# =========================================================
# VEHICLE DETECTION
# =========================================================

@app.route("/detect", methods=["POST"])
def detect():

    try:

        image_bytes = None

        # =================================================
        # OPTION 1: MULTIPART IMAGE
        # =================================================

        if "image" in request.files:

            file = request.files["image"]

            image_bytes = file.read()

        # =================================================
        # OPTION 2: BASE64 JSON
        # =================================================

        else:

            data = request.get_json(silent=True)

            if not data:

                return jsonify({
                    "success": False,
                    "message": "Request body is required"
                }), 400

            if "image" not in data:

                return jsonify({
                    "success": False,
                    "message": "Image is required"
                }), 400

            image_data = data["image"]

            if not isinstance(image_data, str):

                return jsonify({
                    "success": False,
                    "message": "Image must be a base64 string"
                }), 400

            # Remove:
            #
            # data:image/jpeg;base64,
            #

            if "," in image_data:

                image_data = image_data.split(
                    ",",
                    1
                )[1]

            try:

                image_bytes = base64.b64decode(
                    image_data,
                    validate=True
                )

            except Exception:

                return jsonify({
                    "success": False,
                    "message": "Invalid base64 image"
                }), 400

        # =================================================
        # CHECK IMAGE
        # =================================================

        if not image_bytes:

            return jsonify({
                "success": False,
                "message": "Empty image"
            }), 400

        # =================================================
        # DECODE IMAGE
        # =================================================

        np_array = np.frombuffer(
            image_bytes,
            dtype=np.uint8
        )

        frame = cv2.imdecode(
            np_array,
            cv2.IMREAD_COLOR
        )

        if frame is None:

            return jsonify({
                "success": False,
                "message": "Invalid image"
            }), 400

        # =================================================
        # YOLO DETECTION
        # =================================================

        results = model(
            frame,
            verbose=False
        )

        vehicle_count = 0

        detections = []

        vehicle_summary = {
            "car": 0,
            "motorcycle": 0,
            "bus": 0,
            "truck": 0
        }

        # =================================================
        # PROCESS RESULTS
        # =================================================

        for result in results:

            if result.boxes is None:
                continue

            for box in result.boxes:

                cls = int(
                    box.cls[0].item()
                )

                confidence = float(
                    box.conf[0].item()
                )

                # Only vehicles
                if cls not in VEHICLE_CLASSES:
                    continue

                vehicle_count += 1

                vehicle_name = CLASS_NAMES.get(
                    cls,
                    "vehicle"
                )

                vehicle_summary[vehicle_name] += 1

                # Bounding box
                x1, y1, x2, y2 = map(
                    int,
                    box.xyxy[0].tolist()
                )

                detections.append({

                    "class": cls,

                    "name": vehicle_name,

                    "confidence": round(
                        confidence,
                        3
                    ),

                    "box": [
                        x1,
                        y1,
                        x2,
                        y2
                    ]
                })

        # =================================================
        # TRAFFIC DATA
        # =================================================

        traffic = {

            "north": vehicle_count,

            "south": 0,

            "east": 0,

            "west": 0
        }

        # =================================================
        # TRAFFIC LEVEL
        # =================================================

        if vehicle_count >= 20:

            traffic_level = "high"

        elif vehicle_count >= 10:

            traffic_level = "medium"

        else:

            traffic_level = "low"

        # =================================================
        # SEND DATA TO NODE
        # =================================================

        node_backend = False

        try:

            response = requests.post(

                NODE_API_URL,

                json=traffic,

                timeout=3
            )

            node_backend = response.ok

        except requests.RequestException as error:

            print(
                "⚠️ Node backend unavailable:",
                error
            )

        # =================================================
        # RESPONSE
        # =================================================

        return jsonify({

            "success": True,

            "vehicles": vehicle_count,

            "traffic": traffic,

            "trafficLevel": traffic_level,

            "vehicleSummary": vehicle_summary,

            "detections": detections,

            "nodeBackend": node_backend

        })

    except Exception as error:

        print(
            "❌ Detection error:",
            error
        )

        return jsonify({

            "success": False,

            "message": str(error)

        }), 500


# =========================================================
# START SERVER
# =========================================================

if __name__ == "__main__":

    print()
    print("==========================================")
    print("       SMART TRAFFIC AI - YOLO")
    print("==========================================")
    print(f"Local:   http://127.0.0.1:{PORT}")
    print(f"Network: http://192.168.1.5:{PORT}")
    print("------------------------------------------")
    print("GET  /")
    print("GET  /ml-predict")
    print("POST /detect")
    print("==========================================")
    print()

    app.run(
        host=HOST,
        port=PORT,
        debug=False,
        threaded=True
    )