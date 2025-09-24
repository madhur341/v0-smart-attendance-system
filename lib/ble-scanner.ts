export interface BeaconData {
  id: string
  rssi: number
  distance: number
  timestamp: Date
}

export interface BLEDevice {
  id: string
  name: string
  rssi: number
  services: string[]
}

export class BLEScanner {
  private scanning = false
  private devices = new Map<string, BLEDevice>()
  private callbacks: ((devices: BLEDevice[]) => void)[] = []
  private beaconCallbacks: ((beacon: BeaconData) => void)[] = []

  constructor() {
    // Check if Web Bluetooth API is available
    if (!navigator.bluetooth) {
      console.warn("Web Bluetooth API not available")
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      if (!navigator.bluetooth) {
        throw new Error("Bluetooth not supported")
      }

      // Request device access
      await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["battery_service", "device_information"],
      })

      return true
    } catch (error) {
      console.error("Bluetooth permission denied:", error)
      return false
    }
  }

  async startScanning(): Promise<void> {
    if (this.scanning) return

    try {
      // For web demo, we'll simulate BLE scanning
      this.scanning = true
      this.simulateBeaconDetection()

      console.log("[v0] BLE scanning started")
    } catch (error) {
      console.error("Failed to start BLE scanning:", error)
      throw error
    }
  }

  stopScanning(): void {
    this.scanning = false
    console.log("[v0] BLE scanning stopped")
  }

  private simulateBeaconDetection(): void {
    if (!this.scanning) return

    // Simulate finding classroom beacon
    const beaconData: BeaconData = {
      id: "beacon_001",
      rssi: -45 + Math.random() * 20 - 10, // Simulate signal variation
      distance: this.calculateDistance(-45),
      timestamp: new Date(),
    }

    // Notify beacon callbacks
    this.beaconCallbacks.forEach((callback) => callback(beaconData))

    // Continue scanning
    setTimeout(() => this.simulateBeaconDetection(), 2000)
  }

  private calculateDistance(rssi: number): number {
    // Simple distance calculation based on RSSI
    // Distance = 10^((Tx Power - RSSI) / (10 * N))
    // Assuming Tx Power = -59 dBm, N = 2
    const txPower = -59
    const pathLoss = 2
    return Math.pow(10, (txPower - rssi) / (10 * pathLoss))
  }

  onDeviceFound(callback: (devices: BLEDevice[]) => void): void {
    this.callbacks.push(callback)
  }

  onBeaconDetected(callback: (beacon: BeaconData) => void): void {
    this.beaconCallbacks.push(callback)
  }

  removeCallback(callback: (devices: BLEDevice[]) => void): void {
    const index = this.callbacks.indexOf(callback)
    if (index > -1) {
      this.callbacks.splice(index, 1)
    }
  }

  removeBeaconCallback(callback: (beacon: BeaconData) => void): void {
    const index = this.beaconCallbacks.indexOf(callback)
    if (index > -1) {
      this.beaconCallbacks.splice(index, 1)
    }
  }

  isScanning(): boolean {
    return this.scanning
  }

  getDevices(): BLEDevice[] {
    return Array.from(this.devices.values())
  }
}

export const bleScanner = new BLEScanner()
