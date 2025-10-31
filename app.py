# app.py
import io
import threading
import time
import traceback
import logging
import base64
from pathlib import Path
from typing import Optional, Union

from flask import Flask, jsonify, Response, request
from flask_cors import CORS
import cv2
import numpy as np

# Import your SyringeDetector implementation
from syringe_detector.realtime_detector import SyringeDetector

# ---------- Logging ----------
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("syringe-server")

# ---------- Flask App ----------
app = Flask(__name__)
# If you want to restrict origins in production, replace "*" with explicit origins
CORS(app, origins=["http://localhost:3001", "http://127.0.0.1:3001", "http://localhost:8000", "*"])

# Where uploaded frames will be stored (for debugging)
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# ---------- Detector Service Wrapper ----------
class DetectorService:
    def __init__(self, model_path: str, confidence: float = 0.25, camera_index: int = 0, device: Optional[Union[str,int]] = None):
        self.model_path = model_path
        self.confidence = confidence
        self.camera_index = camera_index
        self.device = device or "auto"
        self.detector: Optional[SyringeDetector] = None
        self.thread: Optional[threading.Thread] = None

    def start(self):
        if self.detector is not None:
            logger.info("Detector already instantiated.")
            return

        logger.info("Instantiating SyringeDetector (headless).")
        try:
            self.detector = SyringeDetector(
                model_path=self.model_path,
                confidence=self.confidence,
                camera_index=self.camera_index,
                headless=True,
                force_display=False,
                device=self.device,
            )
        except Exception as e:
            logger.exception("Failed to create SyringeDetector: %s", e)
            self.detector = None
            return

        # Try to initialize camera if method exists (helpful for devices with cameras)
        try:
            if hasattr(self.detector, "initialize_camera"):
                ok = self.detector.initialize_camera()
                logger.info("Called detector.initialize_camera() -> %s", ok)
            else:
                logger.info("Detector has no initialize_camera() method; run() will handle camera open.")
        except Exception as e:
            logger.warning("initialize_camera() raised: %s", e)
            logger.debug(traceback.format_exc())

        # Start detector.run() on background thread
        def run_wrapper():
            try:
                logger.info("Starting detector.run() loop.")
                self.detector.run()
            except Exception as e:
                logger.exception("Exception inside detector.run(): %s", e)

        self.thread = threading.Thread(target=run_wrapper, daemon=True)
        self.thread.start()
        logger.info("Detector thread started.")

    def switch_camera(self, index: int) -> bool:
        if self.detector is None:
            logger.warning("switch_camera called but detector is None.")
            return False
        try:
            logger.info("Switching camera index: %s -> %s", getattr(self.detector, "camera_index", None), index)
            if getattr(self.detector, "cap", None):
                try:
                    self.detector.cap.release()
                    logger.info("Released existing cv2.VideoCapture")
                except Exception:
                    logger.exception("Error releasing cap")
            self.detector.camera_index = index
            if hasattr(self.detector, "initialize_camera"):
                return bool(self.detector.initialize_camera())
            else:
                # quick cv2 check
                cap = cv2.VideoCapture(index)
                ok = cap.isOpened()
                cap.release()
                logger.info("cv2 quick open returned: %s", ok)
                return ok
        except Exception as e:
            logger.exception("switch_camera failed: %s", e)
            return False

service = DetectorService(model_path="models/fine_tuned_yolov8.pt", confidence=0.1, camera_index=0)
service.start()

# ---------- Helpers ----------
def encode_image_to_jpeg_bytes(img_bgr: np.ndarray) -> Optional[bytes]:
    try:
        ok, buf = cv2.imencode(".jpg", img_bgr)
        if not ok:
            logger.error("cv2.imencode returned False")
            return None
        return buf.tobytes()
    except Exception:
        logger.exception("Failed to encode image to JPEG")
        return None

def image_bytes_to_data_url(img_bytes: bytes, mime: str = "image/jpeg") -> str:
    b64 = base64.b64encode(img_bytes).decode("ascii")
    return f"data:{mime};base64,{b64}"

# ---------- API Endpoints ----------

@app.get("/api/status")
def api_status():
    d = service.detector
    if d is None:
        return jsonify({"ready": False, "message": "detector not instantiated"}), 503

    # If detector has no local camera and is meant to receive client frames, let UI know
    # Some detectors may set a 'mode' attribute or similar; we fallback to checking cap
    cap = getattr(d, "cap", None)
    cap_opened = False
    try:
        if cap is not None and hasattr(cap, "isOpened"):
            cap_opened = bool(cap.isOpened())
    except Exception:
        cap_opened = False

    # safe attributes
    def attr(name):
        return getattr(d, name, None)

    # message: if no cap but we have detector, instruct UI to send frames
    if not cap_opened:
        msg = "Ready to receive frames from client."
    else:
        msg = "Detector running with local camera."

    return jsonify({
        "ready": True,
        "message": msg,
        "camera_attached": cap_opened,
        "angle": attr("last_angle"),
        "confidence": attr("last_confidence"),
        "status": attr("last_status"),
        "class": attr("last_class"),
        "fps": attr("current_fps"),
    })

@app.get("/api/snapshot")
def api_snapshot():
    d = service.detector
    if d is None:
        return Response(status=204)
    frame = getattr(d, "last_frame", None)
    if frame is None:
        # no last frame available
        return Response(status=204)
    img_bytes = encode_image_to_jpeg_bytes(frame)
    if img_bytes is None:
        return Response(status=500)
    return Response(img_bytes, mimetype="image/jpeg")

@app.post("/api/process_frame")
def api_process_frame():
    """
    Accepts multipart 'frame' file (image). Decodes to BGR numpy and:
      - if detector has per-frame API (process_frame/infer/predict), call it and return result
      - otherwise save the frame and return ok; UI can poll /api/snapshot to get annotated image
    Returns JSON. If detector produced annotated image bytes, returns base64 'annotated' data URL.
    """
    if "frame" not in request.files:
        return jsonify({"ok": False, "error": "frame field required"}), 400

    file = request.files["frame"]
    try:
        data = file.read()
        arr = np.frombuffer(data, dtype=np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)  # BGR
        if img is None:
            logger.warning("Uploaded image decode failed")
            return jsonify({"ok": False, "error": "could not decode image"}), 400

        # Save uploaded frame for debugging
        fname = UPLOAD_DIR / f"frame_{int(time.time()*1000)}.jpg"
        try:
            cv2.imwrite(str(fname), img)
            logger.info("Saved uploaded frame: %s", str(fname))
        except Exception:
            logger.exception("Failed to write uploaded frame to disk")

        detector = service.detector
        if detector is None:
            return jsonify({"ok": False, "error": "detector not running"}), 503

        # Try multiple common method names that detectors might expose for single-frame inference
        for method_name in ("process_frame", "infer", "predict", "run_frame", "process"):
            if hasattr(detector, method_name):
                try:
                    logger.debug("Calling detector.%s on uploaded frame", method_name)
                    result = getattr(detector, method_name)(img)
                    # if result contains an annotated image, try to return it
                    # Accept different possible result formats:
                    # - result is dict with 'annotated' = bgr numpy OR base64 str
                    # - result is annotated numpy array directly
                    if isinstance(result, dict):
                        # annotated numpy
                        ann = result.get("annotated") or result.get("annotated_img") or result.get("image")
                        if isinstance(ann, np.ndarray):
                            bytes_out = encode_image_to_jpeg_bytes(ann)
                            if bytes_out:
                                return jsonify({"ok": True, "annotated": image_bytes_to_data_url(bytes_out)})
                        # annotated base64 string (data URL)
                        ann_str = result.get("annotated_b64") or result.get("annotated_base64") or result.get("annotated_dataurl")
                        if isinstance(ann_str, str) and ann_str.startswith("data:"):
                            return jsonify({"ok": True, "annotated": ann_str})
                        # else return whatever result dict to client for debugging
                        return jsonify({"ok": True, "result": result})
                    elif isinstance(result, np.ndarray):
                        # detector returned annotated image (BGR)
                        bytes_out = encode_image_to_jpeg_bytes(result)
                        if bytes_out:
                            return jsonify({"ok": True, "annotated": image_bytes_to_data_url(bytes_out)})
                        else:
                            return jsonify({"ok": True, "message": "processed but encoding failed"})
                    else:
                        # generic result (string, numbers)
                        return jsonify({"ok": True, "result": result})
                except Exception as e:
                    logger.exception("detector.%s raised exception: %s", method_name, e)
                    return jsonify({"ok": False, "error": f"detector.{method_name} error: {e}"}), 500

        # If we reach here, detector has no per-frame API; we saved the frame above.
        # Optionally, some detectors watch the uploads folder and will produce a snapshot; inform client to poll snapshot.
        return jsonify({"ok": True, "saved": str(fname), "message": "frame saved; poll /api/snapshot for updated image"}), 200

    except Exception as e:
        logger.exception("Exception in /api/process_frame: %s", e)
        return jsonify({"ok": False, "error": str(e)}), 500

@app.get("/api/debug_camera")
def api_debug_camera():
    """
    Diagnostic endpoint to check detector and camera state.
    """
    try:
        d = service.detector
        if d is None:
            return jsonify({"detector_present": False, "message": "detector not instantiated"}), 200
        cap = getattr(d, "cap", None)
        cap_is_opened = False
        try:
            if cap is not None and hasattr(cap, "isOpened"):
                cap_is_opened = bool(cap.isOpened())
        except Exception:
            cap_is_opened = False
        return jsonify({
            "detector_present": True,
            "camera_index": getattr(d, "camera_index", None),
            "has_cap": cap is not None,
            "cap_isOpened": cap_is_opened,
            "last_frame_present": getattr(d, "last_frame", None) is not None,
            "last_angle": getattr(d, "last_angle", None),
            "last_confidence": getattr(d, "last_confidence", None),
            "message": "ok"
        }), 200
    except Exception as e:
        logger.exception("api_debug_camera exception: %s", e)
        return jsonify({"ok": False, "error": str(e)}), 500

@app.post("/api/camera")
def api_camera():
    """
    Change camera index on the detector (if supported).
    """
    body = request.get_json(silent=True) or {}
    index = body.get("index")
    if index is None:
        return jsonify({"ok": False, "error": "index required"}), 400
    ok = service.switch_camera(int(index))
    return jsonify({"ok": ok, "index": int(index)})

# ---------- Run ----------
if __name__ == "__main__":
    logger.info("Starting Flask app on 0.0.0.0:8001")
    # In production run behind gunicorn/uWsgi + nginx; this is fine for quick testing.
    app.run(host="0.0.0.0", port=8001, debug=False)
