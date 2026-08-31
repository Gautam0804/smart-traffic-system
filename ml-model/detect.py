import cv2
import time
import requests
from ultralytics import YOLO


# =========================================================
# CONFIG
# =========================================================

MODEL_PATH = "yolov8n.pt"

CAMERA_INDEX = 0

BACKEND_URL = "http://127.0.0.1:5000/api/traffic/update"

SEND_INTERVAL = 1.0


# =========================================================
# YOLO MODEL
# =========================================================

print("🧠 Loading YOLO model...")

model = YOLO(MODEL_PATH)

print("✅ YOLO model loaded")


# =========================================================
# CAMERA
# =========================================================

cap = cv2.VideoCapture(CAMERA_INDEX)

if not cap.isOpened():

    print("❌ Could not open camera")

    exit()


print("📷 Camera started")


# =========================================================
# VEHICLE CLASSES
# COCO:
#
# 2 = car
# 3 = motorcycle
# 5 = bus
# 7 = truck
# =========================================================

VEHICLE_CLASSES = {
    2,
    3,
    5,
    7
}


# =========================================================
# TRAFFIC DATA
# =========================================================

traffic = {
    "north": 0,
    "south": 0,
    "east": 0,
    "west": 0
}


last_sent = 0


# =========================================================
# SEND DATA TO NODE.JS
# =========================================================

def send_traffic_data():

    global last_sent

    now = time.time()

    if now - last_sent < SEND_INTERVAL:

        return


    try:

        response = requests.post(
            BACKEND_URL,
            json=traffic,
            timeout=2
        )


        if response.ok:

            print(
                "📡 Sent:",
                traffic
            )

        else:

            print(
                "⚠️ Backend error:",
                response.status_code
            )


    except requests.exceptions.RequestException:

        print(
            "⚠️ Node.js backend not running"
        )


    last_sent = now


# =========================================================
# DETECTION LOOP
# =========================================================

while True:

    ret, frame = cap.read()


    if not ret:

        print("❌ Camera frame failed")

        break


    # =====================================================
    # YOLO
    # =====================================================

    results = model(
        frame,
        verbose=False
    )


    vehicle_count = 0


    # =====================================================
    # DETECT VEHICLES
    # =====================================================

    for result in results:

        for box in result.boxes:

            cls = int(
                box.cls[0]
            )


            if cls in VEHICLE_CLASSES:

                vehicle_count += 1


                x1, y1, x2, y2 = map(
                    int,
                    box.xyxy[0]
                )


                confidence = float(
                    box.conf[0]
                )


                # Draw bounding box

                cv2.rectangle(
                    frame,
                    (x1, y1),
                    (x2, y2),
                    (0, 255, 0),
                    2
                )


                cv2.putText(
                    frame,
                    f"Vehicle {confidence:.2f}",
                    (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (0, 255, 0),
                    2
                )


    # =====================================================
    # CURRENT CAMERA = NORTH
    #
    # For now this camera represents North.
    #
    # Later we'll connect:
    #
    # CAM-01 → North
    # CAM-02 → South
    # CAM-03 → East
    # CAM-04 → West
    # =====================================================

    traffic["north"] = vehicle_count


    # =====================================================
    # SEND TO NODE.JS
    # =====================================================

    send_traffic_data()


    # =====================================================
    # DISPLAY
    # =====================================================

    cv2.putText(
        frame,
        f"Vehicles: {vehicle_count}",
        (20, 45),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2
    )


    cv2.putText(
        frame,
        "SMART TRAFFIC AI",
        (20, 85),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (255, 255, 255),
        2
    )


    cv2.putText(
        frame,
        "Press Q to quit",
        (20, 120),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (255, 255, 255),
        2
    )


    cv2.imshow(
        "Smart Traffic AI - YOLO",
        frame
    )


    # =====================================================
    # EXIT
    # =====================================================

    if cv2.waitKey(1) & 0xFF == ord("q"):

        break


# =========================================================
# CLEANUP
# =========================================================

cap.release()

cv2.destroyAllWindows()

print("🛑 Detection stopped")