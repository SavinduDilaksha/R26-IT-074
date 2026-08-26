

import os
import sys
import time
import json
import argparse
from pathlib import Path
from typing import Tuple, Dict, Any, Optional

import cv2


BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

#add 

def preview_camera(camera_index: int, width: int = 640, height: int = 480) -> None:
    """Open and stream live video preview for the specified camera index."""
    print("=" * 65)
    print(f" Camera Preview Utility — Camera Index {camera_index} (/dev/video{camera_index})")
    print("=" * 65)

    if os.name != "nt" and not os.environ.get("DISPLAY") and not os.environ.get("WAYLAND_DISPLAY"):
        os.environ["DISPLAY"] = ":0"

    print(f"[INFO] Opening Camera device index {camera_index}...")
    if os.name != "nt":
        cap = cv2.VideoCapture(camera_index, cv2.CAP_V4L2)
    else:
        cap = cv2.VideoCapture(camera_index)

    if not cap or not cap.isOpened():
        cap = cv2.VideoCapture(camera_index)

    if not cap or not cap.isOpened():
        print(f"[ERROR] Could not open camera at index {camera_index}.")
        print("[TIP] List connected video devices with: ls -l /dev/video* or v4l2-ctl --list-devices")
        return

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
    actual_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    actual_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    print(f"[OK] Camera {camera_index} opened successfully ({actual_w}x{actual_h}).")
    print("Streaming video... Press 'q' or 'ESC' in the window to exit.\n")

    window_name = f"AquaMonitor - Camera Index {camera_index} (/dev/video{camera_index})"
    try:
        cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
        cv2.resizeWindow(window_name, 800, 520)
    except Exception as exc:
        print(f"[WARN] GUI window initialization note: {exc}")

    fps = 30.0
    last_time = time.time()
    frame_count = 0

    try:
        while True:
            ok, frame = cap.read()
            if not ok or frame is None:
                print(f"[WARN] Failed to read frame from Camera {camera_index}.")
                time.sleep(0.1)
                continue

            frame_count += 1
            fh, fw = frame.shape[:2]
            vis = frame.copy()

            
            overlay = vis.copy()
            cv2.rectangle(overlay, (0, 0), (fw, 48), (20, 20, 20), -1)
            cv2.addWeighted(overlay, 0.75, vis, 0.25, 0, vis)

           
            cv2.putText(vis, f"Camera Index: {camera_index} | Res: {fw}x{fh} | FPS: {fps:.1f}", (12, 22),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.52, (0, 255, 255), 1, cv2.LINE_AA)
            cv2.putText(vis, "Press 'q' or ESC to exit preview", (12, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.40, (200, 200, 200), 1, cv2.LINE_AA)

         
            cv2.imshow(window_name, vis)
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q') or key == 27:
                print(f"[INFO] Exiting preview for Camera {camera_index}.")
                break

            dt = time.time() - last_time
            last_time = time.time()
            if dt > 0:
                fps = 0.9 * fps + 0.1 * (1.0 / dt)

    except KeyboardInterrupt:
        print("\n[INFO] Stopped by user.")
    finally:
        cap.release()
        try:
            cv2.destroyWindow(window_name)
        except Exception:
            pass
        print(f"[OK] Camera {camera_index} released.\n")


def probe_uno(port: str) -> Tuple[bool, Dict[str, Any]]:
    """Attempt reading Arduino Uno JSON telemetry stream (temp, pH, turbidity)."""
    print(f"  [1/2] Probing {port} as Arduino Uno (9600 baud, ASCII/JSON)...")
    try:
        import serial
    except ImportError:
        print("        [ERROR] 'pyserial' not installed. Run: pip install pyserial")
        return False, {}

    ser = None
    try:
        ser = serial.Serial(port=port, baudrate=9600, timeout=2.0, dsrdtr=False, rtscts=False)
        time.sleep(1.8) 
        ser.reset_input_buffer()

        for _ in range(5):
            line = ser.readline().decode("utf-8", errors="ignore").strip()
            if line.startswith("{") and line.endswith("}"):
                try:
                    data = json.loads(line)
                    if any(k in data for k in ["temp", "ph", "turbidity"]):
                        return True, data
                except Exception:
                    pass
    except Exception as exc:
        print(f"        Uno probe error: {exc}")
    finally:
        if ser is not None:
            try:
                ser.close()
            except Exception:
                pass
    return False, {}


def probe_modbus(port: str, address: int = 20, device_id: int = 1) -> Tuple[bool, Dict[str, Any]]:
    """Attempt reading Modbus RS485 Ion Concentration holding register."""
    print(f"  [2/2] Probing {port} as Modbus RS485 RTU (Slave {device_id}, Reg {address})...")
    try:
        from pymodbus.client import ModbusSerialClient
    except ImportError:
        print("        [ERROR] 'pymodbus' not installed. Run: pip install pymodbus")
        return False, {}

    try:
        client = ModbusSerialClient(
            port=port,
            baudrate=9600,
            bytesize=8,
            parity="N",
            stopbits=1,
            timeout=1.5,
        )
        if not client.connect():
            return False, {}

        try:
            try:
                rr = client.read_holding_registers(address=address, count=1, device_id=device_id)
            except TypeError:
                rr = client.read_holding_registers(address=address, count=1, slave=device_id)

            if rr is not None and not rr.isError():
                val = float(rr.registers[0])
                return True, {"ionconcentration": val, "unit": "us/cm"}
        finally:
            client.close()
    except Exception as exc:
        print(f"        Modbus probe error: {exc}")
    return False, {}


def probe_usb_port(port: str) -> None:
    """Identify and display data for device connected to a specific USB serial port."""
    print("=" * 65)
    print(f" USB Port Device Auto-ID Prober: {port}")
    print("=" * 65)

    if os.name != "nt":
        if not Path(port).exists():
            print(f"[ERROR] Port {port} does not exist on this system.")
            print("Available serial ports:")
            found_any = False
            for p in sorted(Path("/dev").glob("ttyUSB*")) + sorted(Path("/dev").glob("ttyACM*")):
                print(f"  - {p}")
                found_any = True
            if not found_any:
                print("  (None found in /dev/ttyUSB* or /dev/ttyACM*)")
            print()
            return

   
    is_uno, uno_data = probe_uno(port)
    if is_uno:
        print("\n" + "*" * 65)
        print(" [RESULT] >>> DEVICE IDENTIFIED AS ARDUINO UNO <<<")
        print("*" * 65)
        print(f"  |-- Temperature : {uno_data.get('temp', 'N/A')} °C")
        print(f"  |-- pH          : {uno_data.get('ph', 'N/A')}")
        print(f"  +-- Turbidity   : {uno_data.get('turbidity', 'N/A')} NTU")
        print(f"  Raw JSON: {uno_data}\n")
        return

    
    is_modbus, modbus_data = probe_modbus(port)
    if is_modbus:
        print("\n" + "*" * 65)
        print(" [RESULT] >>> DEVICE IDENTIFIED AS MODBUS RS485 ION SENSOR <<<")
        print("*" * 65)
        print(f"  +-- Ion Concentration: {modbus_data.get('ionconcentration', 'N/A')} us/cm\n")
        return

    print("\n" + "-" * 65)
    print(f"[UNKNOWN] Could not identify device on {port} as Uno or Modbus.")
    print("Check cable connection, baud rate (9600), or sensor wiring.\n" + "-" * 65 + "\n")



def run_all_checks() -> None:
    """Quick non-blocking audit of all video nodes and USB serial ports."""
    print("=" * 65)
    print(" AquaMonitor Complete Hardware Scan")
    print("=" * 65)

    print("\n[1/2] Scanning Connected Cameras (Indices 0, 1, 2)...")
    for idx in [0, 1, 2]:
        backend = cv2.CAP_V4L2 if os.name != "nt" else 0
        cap = cv2.VideoCapture(idx, backend) if backend else cv2.VideoCapture(idx)
        if cap.isOpened():
            w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            print(f"  [PASS] Camera {idx} (/dev/video{idx}) is accessible (Default: {w}x{h})")
            cap.release()
        else:
            print(f"  [----] Camera {idx} (/dev/video{idx}) not available / not a video capture device")

    print("\n[2/2] Scanning Serial Ports...")
    ports_to_check = []
    if os.name != "nt":
        for p in sorted(Path("/dev").glob("ttyUSB*")) + sorted(Path("/dev").glob("ttyACM*")):
            ports_to_check.append(str(p))
    else:
        ports_to_check = ["COM1", "COM2", "COM3", "COM4"]

    if not ports_to_check:
        print("  [WARN] No USB serial ports detected.")
    else:
        for port in ports_to_check:
            print(f"\n--- Checking Port: {port} ---")
            is_uno, uno_data = probe_uno(port)
            if is_uno:
                print(f"  >>> MATCH: Arduino Uno (Temp: {uno_data.get('temp')} C, pH: {uno_data.get('ph')}, Turbidity: {uno_data.get('turbidity')} NTU)")
                continue
            is_modbus, modbus_data = probe_modbus(port)
            if is_modbus:
                print(f"  >>> MATCH: Modbus RS485 (Ion Concentration: {modbus_data.get('ionconcentration')} us/cm)")
                continue
            print("  >>> UNKNOWN / NO RESPONSE")

    print("\n" + "=" * 65 + "\n")



def interactive_menu():
    """Display interactive CLI terminal menu."""
    while True:
        print("=" * 65)
        print("   AquaMonitor — Unified Hardware Test Suite (testrun.py)")
        print("=" * 65)
        print(" [1] Test Camera 0 Preview (/dev/video0)")
        print(" [2] Test Camera 1 Preview (/dev/video1)")
        print(" [3] Test Camera 2 Preview (/dev/video2)")
        print(" [4] Probe USB 0 (/dev/ttyUSB0) — Arduino Uno vs Modbus Auto-ID")
        print(" [5] Probe USB 1 (/dev/ttyUSB1) — Arduino Uno vs Modbus Auto-ID")
        print(" [6] Scan All Cameras & USB Serial Ports")
        print(" [0] Exit")
        print("=" * 65)
        
        try:
            choice = input("Select an option [0-6]: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nExiting.")
            break

        if choice == "1":
            preview_camera(0)
        elif choice == "2":
            preview_camera(1)
        elif choice == "3":
            preview_camera(2)
        elif choice == "4":
            port = "/dev/ttyUSB0" if os.name != "nt" else "COM1"
            probe_usb_port(port)
        elif choice == "5":
            port = "/dev/ttyUSB1" if os.name != "nt" else "COM2"
            probe_usb_port(port)
        elif choice == "6":
            run_all_checks()
        elif choice == "0" or choice.lower() in ["q", "exit"]:
            print("Exiting test suite. Goodbye!")
            break
        else:
            print("[!] Invalid option. Please enter 0-6.\n")



def main():
    parser = argparse.ArgumentParser(description="AquaMonitor Unified Hardware Test Suite")
    parser.add_argument("--cam", type=int, choices=[0, 1, 2], help="Preview specified camera index (0, 1, or 2)")
    parser.add_argument("--usb", type=int, choices=[0, 1], help="Probe specified USB index (0 for /dev/ttyUSB0, 1 for /dev/ttyUSB1)")
    parser.add_argument("--port", type=str, help="Probe an explicit serial port path (e.g. /dev/ttyUSB0, /dev/ttyACM0, COM3)")
    parser.add_argument("--all", action="store_true", help="Run comprehensive scan of all cameras and serial devices")
    args = parser.parse_args()

   
    if args.cam is not None:
        preview_camera(args.cam)
    elif args.usb is not None:
        port = f"/dev/ttyUSB{args.usb}" if os.name != "nt" else f"COM{args.usb + 1}"
        probe_usb_port(port)
    elif args.port is not None:
        probe_usb_port(args.port)
    elif args.all:
        run_all_checks()
    else:
        interactive_menu()


if __name__ == "__main__":
    main()
