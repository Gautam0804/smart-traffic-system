import subprocess
import sys
import time


print()
print("=" * 50)
print("🚦 SMART TRAFFIC AI")
print("=" * 50)
print()


print("▶ Starting Traffic API...")

app_process = subprocess.Popen([
    sys.executable,
    "app.py"
])


time.sleep(2)


print("▶ Starting Camera + YOLO...")

camera_process = subprocess.Popen([
    sys.executable,
    "camera.py"
])


print()
print("=" * 50)
print("✅ ALL SERVICES STARTED")
print("=" * 50)
print()

print("🧠 Traffic API")
print("   http://localhost:8000")

print()

print("📷 Camera + YOLO")
print("   http://localhost:8001/video")

print()

print("🌐 Node.js Backend")
print("   http://localhost:5000")

print()

print("Press CTRL+C to stop everything.")
print()


try:

    while True:

        time.sleep(1)


except KeyboardInterrupt:

    print()
    print("🛑 Stopping Smart Traffic AI...")


    app_process.terminate()

    camera_process.terminate()


    app_process.wait()

    camera_process.wait()


    print("✅ All services stopped.")