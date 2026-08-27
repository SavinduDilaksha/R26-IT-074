"""Ion Concentration Modbus RTU Serial Sensor Reader.

Reads water ion concentration over RS485 Modbus RTU interface via USB serial.
Configuration is driven by central SENSOR_CONFIG to support multi-USB device systems.
"""

import time
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from config import SENSOR_CONFIG
from utils.logger import get_logger

LOG = get_logger(__name__)




class IonConcentrationReader:
    

 
    BAUDRATE: int = 9600
    BYTESIZE: int = 8
    PARITY: str = "N"
    STOPBITS: int = 1
    TIMEOUT: float = 1.5
    DEVICE_ID: int = 1
    ADDRESS: int = 20

    def __init__(self, port: Optional[str] = None):
        self.port = port or SENSOR_CONFIG.get("ionconcentration_serial_port", "/dev/ttyUSB0")
        self.baudrate = self.BAUDRATE
        self.bytesize = self.BYTESIZE
        self.parity = self.PARITY
        self.stopbits = self.STOPBITS
        self.timeout = self.TIMEOUT
        self.device_id = self.DEVICE_ID
        self.address = self.ADDRESS

        

    def _create_client(self, port: str):
        """Create PyModbus serial client instance."""
        from pymodbus.client import ModbusSerialClient
        return ModbusSerialClient(
            port=port,
            baudrate=self.baudrate,
            bytesize=self.bytesize,
            parity=self.parity,
            stopbits=self.stopbits,
            timeout=self.timeout
        )
#function
    def read(self) -> Dict[str, Any]:
        
        timestamp = datetime.now(timezone.utc).isoformat()
        import os
        from pathlib import Path
        if os.name != "nt" and not Path(self.port).exists():
            LOG.debug("Ion concentration serial port %s does not exist.", self.port)
            return {
                "value": None,
                "unit": "us/cm",
                "timestamp": timestamp,
                "error": f"Port {self.port} does not exist"
            }

        try:
            client = self._create_client(self.port)
            if not client.connect():
                return {
                    "value": None,
                    "unit": "us/cm",
                    "timestamp": timestamp,
                    "error": f"Could not connect to {self.port}"
                }

            try:
                try:
                    rr = client.read_holding_registers(
                        address=self.address,
                        count=1,
                        device_id=self.device_id
                    )
                except TypeError:
                
                    rr = client.read_holding_registers(
                        address=self.address,
                        count=1,
                        slave=self.device_id
                    )

                if rr is None or rr.isError():
                    return {
                        "value": None,
                        "unit": "us/cm",
                        "timestamp": timestamp,
                        "error": "Modbus Read Error"
                    }

                return {
                    "value": float(rr.registers[0]),
                    "unit": "us/cm",
                    "timestamp": timestamp,
                    "source": "modbus_rtu"
                }
            finally:
                client.close()

        except Exception as exc:
            LOG.debug("Modbus read failed on %s: %s", self.port, exc)
            return {
                "value": None,
                "unit": "us/cm",
                "timestamp": timestamp,
                "error": str(exc)
            }


def read() -> Dict[str, Any]:
    """Module-level helper to perform one-shot ion concentration reading."""
    return IonConcentrationReader().read()

#add

if __name__ == "__main__":
    reader = IonConcentrationReader()
    from pymodbus.client import ModbusSerialClient
    client = ModbusSerialClient(
        port=reader.port,
        baudrate=reader.baudrate,
        bytesize=reader.bytesize,
        parity=reader.parity,
        stopbits=reader.stopbits,
        timeout=reader.timeout
    )

    if not client.connect():
        print("Cannot connect")
        raise SystemExit(1)

    try:
        while True:
            try:
                rr = client.read_holding_registers(address=address, count=1, device_id=device_id)
            except TypeError:
                rr = client.read_holding_registers(address=address, count=1, slave=device_id)

            if rr is None or rr.isError():
                print("Read Error")
            else:
                print("ionconcentration =", rr.registers[0], "us/cm")
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping reader.")
    finally:
        client.close()
