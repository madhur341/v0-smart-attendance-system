"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, Upload, CheckCircle, AlertCircle, Loader2, User } from "lucide-react"
import { faceRecognitionService, type PhotoEnrollmentResult } from "@/lib/face-recognition"

interface PhotoEnrollmentProps {
  studentId: string
  onEnrollmentComplete?: (result: { success: boolean; photoUrl?: string; embedding?: any }) => void
}

export function PhotoEnrollment({ studentId, onEnrollmentComplete }: PhotoEnrollmentProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isActive, setIsActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [enrollmentResult, setEnrollmentResult] = useState<PhotoEnrollmentResult | null>(null)

  const startCamera = async () => {
    try {
      console.log("[v0] Starting camera for photo enrollment...")
      setError(null)

      const initialized = await faceRecognitionService.initialize()
      if (!initialized) {
        throw new Error("Failed to initialize face recognition")
      }

      setIsActive(true)

      // Wait for video element to be available
      await new Promise((resolve) => {
        const checkVideo = () => {
          if (videoRef.current) {
            resolve(true)
          } else {
            setTimeout(checkVideo, 50)
          }
        }
        checkVideo()
      })

      if (!videoRef.current) {
        throw new Error("Video element not available")
      }

      const cameraStarted = await faceRecognitionService.startCamera(videoRef.current)
      if (!cameraStarted) {
        throw new Error("Failed to access camera")
      }

      console.log("[v0] Camera started for photo enrollment")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to start camera"
      console.error("[v0] Camera error:", errorMessage)
      setError(errorMessage)
      setIsActive(false)
    }
  }

  const stopCamera = () => {
    console.log("[v0] Stopping camera...")
    faceRecognitionService.stopCamera()
    setIsActive(false)
    setIsProcessing(false)
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !isActive) {
      console.error("[v0] Cannot capture photo: video not ready")
      return
    }

    try {
      console.log("[v0] Capturing reference photo...")
      setIsProcessing(true)
      setError(null)

      // First perform liveness check
      const verificationResult = await faceRecognitionService.performFullVerification(
        videoRef.current,
        undefined,
        "enrollment",
      )

      if (!verificationResult.verified) {
        throw new Error("Liveness check failed. Please ensure good lighting and look directly at the camera.")
      }

      // Capture the reference photo
      const photoResult = await faceRecognitionService.captureReferencePhoto(videoRef.current)

      if (!photoResult.success) {
        throw new Error(photoResult.error || "Failed to capture photo")
      }

      setCapturedPhoto(photoResult.photoUrl || null)
      setEnrollmentResult(photoResult)

      // Submit to API
      if (photoResult.embedding) {
        try {
          const response = await fetch("/api/photo-enrollment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              student_id: studentId,
              embedding: photoResult.embedding.data,
              confidence: photoResult.embedding.confidence,
              photo_url: photoResult.photoUrl, // In real app, upload to storage first
            }),
          })

          if (!response.ok) {
            throw new Error("Failed to save enrollment data")
          }

          const apiResult = await response.json()
          console.log("[v0] Photo enrollment saved:", apiResult)

          onEnrollmentComplete?.({
            success: true,
            photoUrl: photoResult.photoUrl,
            embedding: photoResult.embedding,
          })
        } catch (apiError) {
          console.error("[v0] Failed to save enrollment:", apiError)
          setError("Photo captured but failed to save. Please try again.")
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to capture photo"
      console.error("[v0] Photo capture error:", errorMessage)
      setError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const retakePhoto = () => {
    setCapturedPhoto(null)
    setEnrollmentResult(null)
    setError(null)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Photo Enrollment
        </CardTitle>
        <CardDescription>
          Capture your reference photo for face verification. This will be used to verify your identity in future
          sessions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera Feed or Captured Photo */}
        <div className="relative">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            {capturedPhoto ? (
              <img
                src={capturedPhoto || "/placeholder.svg"}
                alt="Captured reference photo"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover ${isActive ? "block" : "hidden"}`}
                  autoPlay
                  muted
                  playsInline
                />
                {!isActive && (
                  <div className="text-center">
                    <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Camera not active</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Status overlay */}
          {isActive && !capturedPhoto && (
            <div className="absolute top-4 left-4 space-y-2">
              <Badge variant="default">Camera Active</Badge>
              {isProcessing && (
                <Badge variant="secondary">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Processing...
                </Badge>
              )}
            </div>
          )}

          {capturedPhoto && (
            <div className="absolute top-4 left-4">
              <Badge variant="default">
                <CheckCircle className="w-3 h-3 mr-1" />
                Photo Captured
              </Badge>
            </div>
          )}
        </div>

        {/* Success Message */}
        {enrollmentResult?.success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Reference photo captured successfully! You can now use face verification for attendance.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          {!isActive && !capturedPhoto ? (
            <Button onClick={startCamera} className="flex-1">
              <Camera className="w-4 h-4 mr-2" />
              Start Camera
            </Button>
          ) : capturedPhoto ? (
            <>
              <Button onClick={retakePhoto} variant="outline" className="flex-1 bg-transparent">
                <Camera className="w-4 h-4 mr-2" />
                Retake Photo
              </Button>
              <Button onClick={stopCamera} variant="default" className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Enrollment
              </Button>
            </>
          ) : (
            <>
              <Button onClick={capturePhoto} disabled={isProcessing} className="flex-1">
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Capturing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Capture Photo
                  </>
                )}
              </Button>
              <Button onClick={stopCamera} variant="outline">
                Cancel
              </Button>
            </>
          )}
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Ensure good lighting and look directly at the camera</p>
          <p>• Keep your face centered and clearly visible</p>
          <p>• This photo will be securely stored and used for future verification</p>
          <p>• You can retake the photo if you're not satisfied with the result</p>
        </div>
      </CardContent>
    </Card>
  )
}
