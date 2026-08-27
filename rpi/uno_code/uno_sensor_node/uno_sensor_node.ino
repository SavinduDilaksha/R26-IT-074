/*
 *
 *
 * Hardware Connections:
 *   - DS18B20 Temperature Sensor: Digital Pin 2 (with 4.7k pull-up resistor to 5V)
 *   - PH-4502C Analog pH Sensor: Analog Pin A0
 *   - Analog Turbidity Sensor: Analog Pin A1
 *   - USB Serial: Arduino Uno USB port connected to Raspberry Pi (/dev/ttyUSB1)
 *
 * Baud Rate: 9600
 * Output Format: Clean telemetry JSON transmitted once per second
 *   {"temp": 25.80, "ph": 7.20, "turbidity": 120.5}
 *
 * Water quality classification and stress decisions are computed by the ML
 * modules on Raspberry Pi.
 */

#include <DallasTemperature.h>
#include <OneWire.h>

#define PH_PIN A0
#define TURBIDITY_PIN A1
#define ONE_WIRE_BUS 2

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

void setup() {
  Serial.begin(9600);
  sensors.begin();
}


float readAnalogSampled(int pin) {
  int buffer_arr[10];
  for (int i = 0; i < 10; i++) {
    buffer_arr[i] = analogRead(pin);
    delay(10);
  }

 
  for (int i = 0; i < 9; i++) {
    for (int j = i + 1; j < 10; j++) {
      if (buffer_arr[i] > buffer_arr[j]) {
        int temp = buffer_arr[i];
        buffer_arr[i] = buffer_arr[j];
        buffer_arr[j] = temp;
      }
    }
  }

 
  unsigned long avgval = 0;
  for (int i = 2; i < 8; i++) {
    avgval += buffer_arr[i];
  }
  return (float)avgval / 6.0;
}

void loop() {
 
  sensors.requestTemperatures();
  float tempC = sensors.getTempCByIndex(0);

  
  float raw_ph_adc = readAnalogSampled(PH_PIN);
  float ph_volt = raw_ph_adc * 5.0 / 1023.0;
  float ph_act = 7.0 + ((2.50 - ph_volt) / 0.18);

  
  float raw_turb_adc = readAnalogSampled(TURBIDITY_PIN);
  float turb_volt = raw_turb_adc * 5.0 / 1023.0;
  float turbidity_ntu =
      -1120.4 * (turb_volt * turb_volt) + 5742.3 * turb_volt - 4352.9;
  if (turbidity_ntu < 0)
    turbidity_ntu = 0;

  
  char str_ph[10];
  char str_turb[10];
  dtostrf(ph_act, 1, 2, str_ph);
  dtostrf(turbidity_ntu, 1, 1, str_turb);

  char buf[80];
  if (tempC != DEVICE_DISCONNECTED_C) {
    char str_temp[10];
    dtostrf(tempC, 1, 2, str_temp);
    snprintf(buf, sizeof(buf),
             "{\"temp\":%s,\"ph\":%s,\"turbidity\":%s}",
             str_temp, str_ph, str_turb);
  } else {
    snprintf(buf, sizeof(buf),
             "{\"temp\":null,\"ph\":%s,\"turbidity\":%s}",
             str_ph, str_turb);
  }
  Serial.println(buf);


  delay(50);
}
