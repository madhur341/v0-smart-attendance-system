"use client"

import { useState, useEffect, useCallback } from "react"
import { bleScanner, type BeaconData, type BLEDevice } from "@/lib/ble-scanner"

export function useBLE() {
  const [isScanning, setIsScanning] = useState(false)
  const [devices, setDevices] = useState<BLEDevice[]>([])
  const [beacons, setBeacons] = useState<BeaconData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [permissionGranted, setPermissionGranted] = useState(false)

  const handleDeviceFound = useCallback((foundDevices: BLEDevice[]) => {
    setDevices(foundDevices)
  }, [])

  const handleBeaconDetected = useCallback((beacon: BeaconData) => {
    setBeacons((prev) => {
      const updated = [...prev.filter((b) => b.id !== beacon.id), beacon]
      return updated.slice(-10) // Keep last 10 beacon readings
    })
  }, [])

  useEffect(() => {
    bleScanner.onDeviceFound(handleDeviceFound)
    bleScanner.onBeaconDetected(handleBeaconDetected)

    return () => {
      bleScanner.removeCallback(handleDeviceFound)
      bleScanner.removeBeaconCallback(handleBeaconDetected)
    }
  }, [handleDeviceFound, handleBeaconDetected])

  const requestPermissions = async (): Promise<boolean> => {
    try {
      setError(null)
      const granted = await bleScanner.requestPermissions()
      setPermissionGranted(granted)
      return granted
    } catch (err) {
      setError(err instanceof Error ? err.message : "Permission request failed")
      return false
    }
  }

  const startScanning = async (): Promise<void> => {
    try {
      setError(null)

      if (!permissionGranted) {
        const granted = await requestPermissions()
        if (!granted) {
          throw new Error("Bluetooth permissions required")
        }
      }

      await bleScanner.startScanning()
      setIsScanning(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start scanning")
      setIsScanning(false)
    }
  }

  const stopScanning = (): void => {
    bleScanner.stopScanning()
    setIsScanning(false)
  }

  const getLatestBeacon = (beaconId: string): BeaconData | null => {
    return beacons.find((b) => b.id === beaconId) || null
  }

  const isBeaconInRange = (beaconId: string, maxDistance = 10): boolean => {
    const beacon = getLatestBeacon(beaconId)
    return beacon ? beacon.distance <= maxDistance : false
  }

  return {
    isScanning,
    devices,
    beacons,
    error,
    permissionGranted,
    requestPermissions,
    startScanning,
    stopScanning,
    getLatestBeacon,
    isBeaconInRange,
  }
}
