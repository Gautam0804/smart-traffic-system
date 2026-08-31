import cv2
import time
import threading
import requests

from flask import Flask, Response, jsonify
from ultralytics import YOLO


# =========================================================
# CONFIG
# =========================================================

CAMERA_PORT = 8001

NODE_API = "http://127.0.0.1:5000/api/traffic/update"

MODEL_NAME = "yolov8n.pt"

SEND_INTERVAL = 1.0

CONFIDENCE = 0.35


# =========================================================
# FLASK
# =========================================================

app = Flask(__name__)


# =========================================================
# CAMERA
# =========================================================

camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)

camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)


if not camera.isOpened():
    print("❌ Cannot open webcam")


# =========================================================
# YOLO
# =========================================================

print("🤖 Loading YOLO model...")

model = YOLO(MODEL_NAME)

print("✅ YOLO model loaded")


# COCO vehicle classes
# 2 = car
# 3 = motorcycle
# 5 = bus
# 7 = truck

VEHICLE_CLASSES = {
    2,
    3,
    5,
    7,
}


# =========================================================
# SHARED STATE
# =========================================================

latest_frame = None

latest_total = 0

traffic = {
    "north": 0,
    "south": 0,
    "east": 0,
    "west": 0,
}

last_update = None

camera_running = True

lock = threading.Lock()


# =========================================================
# DETERMINE TRAFFIC DIRECTION
# =========================================================

def get_direction(cx, cy, width, height):

    center_x = width / 2
    center_y = height / 2

    dx = cx - center_x
    dy = cy - center_y

    # Vehicle is more horizontal from center
    if abs(dx) > abs(dy):

        if dx < 0:
            return "west"

        return "east"

    # Vehicle is more vertical from center
    else:

        if dy < 0:
            return "north"

        return "south"


# =========================================================
# DRAW INTERSECTION ZONES
# =========================================================

def draw_zones(frame):

    height, width = frame.shape[:2]

    center_x = width // 2
    center_y = height // 2

    # Vertical line
    cv2.line(
        frame,
        (center_x, 0),
        (center_x, height),
        (255, 255, 0),
        2
    )

    # Horizontal line
    cv2.line(
        frame,
        (0, center_y),
        (width, center_y),
        (255, 255, 0),
        2
    )

    # Direction labels

    cv2.putText(
        frame,
        "NORTH",
        (center_x - 70, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.9,
        (255, 255, 0),
        2
    )

    cv2.putText(
        frame,
        "SOUTH",
        (center_x - 70, height - 20),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.9,
        (255, 255, 0),
        2
    )

    cv2.putText(
        frame,
        "WEST",
        (20, center_y),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.9,
        (255, 255, 0),
        2
    )

    cv2.putText(
        frame,
        "EAST",
        (width - 100, center_y),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.9,
        (255, 255, 0),
        2
    )


# =========================================================
# CAMERA + YOLO PROCESSING
# =========================================================

def process_camera():

    global latest_frame
    global latest_total
    global traffic
    global last_update

    last_send_time = 0

    while camera_running:

        success, frame = camera.read()

        if not success:

            print("❌ Unable to read camera")

            time.sleep(1)

            continue


        height, width = frame.shape[:2]


        # =================================================
        # RESET COUNTS
        # =================================================

        current_traffic = {
            "north": 0,
            "south": 0,
            "east": 0,
            "west": 0,
        }


        # =================================================
        # DRAW ZONES
        # =================================================

        draw_zones(frame)


        # =================================================
        # YOLO
        # =================================================

        results = model(
            frame,
            verbose=False,
            conf=CONFIDENCE
        )


        total = 0


        for result in results:

            for box in result.boxes:

                cls = int(box.cls[0])

                confidence = float(box.conf[0])


                # Only vehicles
                if cls not in VEHICLE_CLASSES:
                    continue


                total += 1


                # =================================================
                # BOUNDING BOX
                # =================================================

                x1, y1, x2, y2 = map(
                    int,
                    box.xyxy[0]
                )


                # Vehicle center
                cx = int((x1 + x2) / 2)
                cy = int((y1 + y2) / 2)


                # =================================================
                # FIND DIRECTION
                # =================================================

                direction = get_direction(
                    cx,
                    cy,
                    width,
                    height
                )


                current_traffic[direction] += 1


                # =================================================
                # DRAW BOX
                # =================================================

                cv2.rectangle(
                    frame,
                    (x1, y1),
                    (x2, y2),
                    (0, 255, 0),
                    2
                )


                # Center point

                cv2.circle(
                    frame,
                    (cx, cy),
                    5,
                    (0, 0, 255),
                    -1
                )


                # =================================================
                # LABEL
                # =================================================

                label = (
                    f"{direction.upper()} "
                    f"{confidence:.2f}"
                )


                cv2.putText(
                    frame,
                    label,
                    (x1, max(y1 - 10, 20)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 255, 0),
                    2
                )


        # =================================================
        # UPDATE STATE
        # =================================================

        with lock:

            traffic = current_traffic.copy()

            latest_total = total


        # =================================================
        # DISPLAY TOTAL
        # =================================================

        cv2.putText(
            frame,
            f"TOTAL VEHICLES: {total}",
            (20, 45),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.9,
            (0, 255, 0),
            2
        )


        cv2.putText(
            frame,
            f"N: {current_traffic['north']}",
            (20, 90),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 255, 0),
            2
        )


        cv2.putText(
            frame,
            f"S: {current_traffic['south']}",
            (20, 120),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 255, 0),
            2
        )


        cv2.putText(
            frame,
            f"E: {current_traffic['east']}",
            (20, 150),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 255, 0),
            2
        )


        cv2.putText(
            frame,
            f"W: {current_traffic['west']}",
            (20, 180),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 255, 0),
            2
        )


        # =================================================
        # TITLE
        # =================================================

        cv2.putText(
            frame,
            "SMART TRAFFIC AI",
            (width - 280, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (255, 255, 255),
            2
        )


        # =================================================
        # ENCODE FRAME
        # =================================================

        success, encoded = cv2.imencode(
            ".jpg",
            frame
        )


        if success:

            with lock:

                latest_frame = encoded.tobytes()


        # =================================================
        # SEND TO NODE.JS
        # =================================================

        current_time = time.time()


        if current_time - last_send_time >= SEND_INTERVAL:

            payload = {
                "north": current_traffic["north"],
                "south": current_traffic["south"],
                "east": current_traffic["east"],
                "west": current_traffic["west"],
            }


            try:

                response = requests.post(
                    NODE_API,
                    json=payload,
                    timeout=2
                )


                if response.ok:

                    print(
                        "📡 Traffic →",
                        payload
                    )

                    last_update = (
                        time.strftime(
                            "%Y-%m-%d %H:%M:%S"
                        )
                    )

                else:

                    print(
                        "❌ Node API:",
                        response.status_code
                    )


            except requests.RequestException as error:

                print(
                    "⚠️ Node.js unavailable:",
                    error
                )


            last_send_time = current_time


# =========================================================
# MJPEG STREAM
# =========================================================

def generate_frames():

    while True:

        with lock:

            frame = latest_frame


        if frame is None:

            time.sleep(0.05)

            continue


        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n"
            + frame
            + b"\r\n"
        )


        time.sleep(0.03)


# =========================================================
# VIDEO ENDPOINT
# =========================================================

@app.route("/video")
def video():

    return Response(
        generate_frames(),
        mimetype=(
            "multipart/x-mixed-replace;"
            " boundary=frame"
        )
    )


# =========================================================
# STATUS ENDPOINT
# =========================================================

@app.route("/")
def home():

    with lock:

        current = traffic.copy()

        total = latest_total


    return jsonify({

        "status":
            "Smart Traffic AI Camera Running",

        "video":
            "http://localhost:8001/video",

        "vehicles":
            total,

        "traffic":
            current,

        "lastUpdate":
            last_update,

    })


# =========================================================
# START
# =========================================================

if __name__ == "__main__":

    thread = threading.Thread(
        target=process_camera,
        daemon=True
    )

    thread.start()


    print()
    print("=" * 50)
    print("🚦 SMART TRAFFIC AI CAMERA")
    print("=" * 50)
    print("📷 Camera: READY")
    print("🤖 YOLO: READY")
    print("🎥 Stream: http://localhost:8001/video")
    print("📡 Node API:", NODE_API)
    print("=" * 50)
    print()


    try:

        app.run(
            host="0.0.0.0",
            port=CAMERA_PORT,
            threaded=True,
            debug=False
        )

    finally:

        camera_running = False

        camera.release()

        print("📷 Camera released")