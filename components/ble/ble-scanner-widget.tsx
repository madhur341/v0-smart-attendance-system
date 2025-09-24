"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wifi, WifiOff, Signal, Bluetooth, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { useBLE } from "@/hooks/use-ble"

interface BLEScannerWidgetProps {
  onBeaconDetected?: (beaconId: string, rssi: number) => void
  targetBeaconId?: string
}

export function BLEScannerWidget({ onBeaconDetected, targetBeaconId = "beacon_001" }: BLEScannerWidgetProps) {
  const {
    isScanning,
    beacons,
    error,
    permissionGranted,
    requestPermissions,
    startScanning,
    stopScanning,
    getLatestBeacon,
    isBeaconInRange,
  } = useBLE()

  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected")

  const targetBeacon = getLatestBeacon(targetBeaconId)
  const inRange = isBeaconInRange(targetBeaconId, 15) // 15 meter range

  useEffect(() => {
    if (targetBeacon && inRange) {
      setConnectionStatus("connected")
      onBeaconDetected?.(targetBeacon.id, targetBeacon.rssi)
    } else if (isScanning) {
      setConnectionStatus("connecting")
    } else {
      setConnectionStatus("disconnected")
    }
  }, [targetBeacon, inRange, isScanning, onBeaconDetected])

  const getSignalStrength = (rssi: number): { strength: number; label: string; color: string } => {
    if (rssi >= -50) return { strength: 100, label: "Excellent", color: "text-green-600" }
    if (rssi >= -60) return { strength: 75, label: "Good", color: "text-green-500" }
    if (rssi >= -70) return { strength: 50, label: "Fair", color: "text-yellow-500" }
    if (rssi >= -80) return { strength: 25, label: "Poor", color: "text-orange-500" }
    return { strength: 10, label: "Very Poor", color: "text-red-500" }
  }

  const handleToggleScanning = async () => {
    if (isScanning) {
      stopScanning()
    } else {
      await startScanning()
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bluetooth className="w-5 h-5" />
          BLE Scanner
        </CardTitle>
        <CardDescription>Bluetooth Low Energy beacon detection for attendance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {connectionStatus === "connected" ? (
                <Wifi className="w-6 h-6 text-green-500" />
              ) : connectionStatus === "connecting" ? (
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              ) : (
                <WifiOff className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div>
              <p className="font-medium">
                {connectionStatus === "connected"
                  ? "Connected to Classroom"
                  : connectionStatus === "connecting"
                    ? "Scanning for Beacons"
                    : "Not Connected"}
              </p>
              <p className="text-sm text-muted-foreground">
                {targetBeacon ? `Beacon: ${targetBeacon.id}` : "No beacon detected"}
              </p>
            </div>
          </div>
          <Badge
            variant={
              connectionStatus === "connected" ? "default" : connectionStatus === "connecting" ? "secondary" : "outline"
            }
          >
            {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
          </Badge>
        </div>

        {/* Signal Strength */}
        {targetBeacon && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Signal Strength</span>
              <div className="flex items-center gap-2">
                <Signal className={`w-4 h-4 ${getSignalStrength(targetBeacon.rssi).color}`} />
                <span className={`text-sm ${getSignalStrength(targetBeacon.rssi).color}`}>
                  {getSignalStrength(targetBeacon.rssi).label}
                </span>
              </div>
            </div>
            <Progress value={getSignalStrength(targetBeacon.rssi).strength} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>RSSI: {targetBeacon.rssi} dBm</span>
              <span>Distance: ~{targetBeacon.distance.toFixed(1)}m</span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          {!permissionGranted && (
            <Button onClick={requestPermissions} variant="outline" className="flex-1 bg-transparent">
              <Bluetooth className="w-4 h-4 mr-2" />
              Enable Bluetooth
            </Button>
          )}
          {permissionGranted && (
            <Button onClick={handleToggleScanning} className="flex-1" disabled={!permissionGranted}>
              {isScanning ? (
                <>
                  <WifiOff className="w-4 h-4 mr-2" />
                  Stop Scanning
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4 mr-2" />
                  Start Scanning
                </>
              )}
            </Button>
          )}
        </div>

        {/* Status Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {connectionStatus === "connected" && inRange && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Successfully connected to classroom beacon. Attendance will be automatically tracked.
            </AlertDescription>
          </Alert>
        )}

        {isScanning && !targetBeacon && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Scanning for classroom beacon. Please ensure you're within range of the classroom.
            </AlertDescription>
          </Alert>
        )}

        {/* Beacon List */}
        {beacons.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Detected Beacons</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {beacons.map((beacon, index) => (
                <div
                  key={`${beacon.id}-${index}`}
                  className="flex items-center justify-between p-2 border border-border rounded text-xs"
                >
                  <span className="font-mono">{beacon.id}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{beacon.rssi} dBm</span>
                    <Badge variant={beacon.id === targetBeaconId ? "default" : "outline"} className="text-xs">
                      {beacon.id === targetBeaconId ? "Target" : "Other"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
