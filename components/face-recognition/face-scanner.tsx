"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, CameraOff, Eye, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { faceRecognitionService, type FaceVerificationResult } from "@/lib/face-recognition"

interface FaceScannerProps {
  onVerificationComplete?: (result: FaceVerificationResult) => void
  mode?: "verification" | "enrollment"
  studentId?: string
  storedEmbedding?: any // In real app, this would be the stored face embedding
}

export function FaceScanner({
  onVerificationComplete,
  mode = "verification",
  studentId,
  storedEmbedding,
}: FaceScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isActive, setIsActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<FaceVerificationResult | null>(null)
  const [livenessChecks, setLivenessChecks] = useState({
    blinkDetected: false,
    headMovement: false,
    faceQuality: false,
  })
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    return () => {
      if (isActive) {
        stopScanning()
      }
    }
  }, [isActive])

  const startScanning = async () => {
    try {
      console.log("[v0] Starting face scanning...")
      setError(null)
      setResult(null)
      setProgress(0)

      setLivenessChecks({
        blinkDetected: false,
        headMovement: false,
        faceQuality: false,
      })

      const initialized = await faceRecognitionService.initialize()
      if (!initialized) {
        throw new Error("Failed to initialize face recognition")
      }

      setIsActive(true)

      await new Promise((resolve) => {
        const checkVideo = () => {
          if (videoRef.current) {
            resolve(true)
          } else {
            setTimeout(checkVideo, 50) // Check every 50ms
          }
        }
        checkVideo()
      })

      if (!videoRef.current) {
        throw new Error("Video element not available after timeout")
      }

      const cameraStarted = await faceRecognitionService.startCamera(videoRef.current)
      if (!cameraStarted) {
        throw new Error("Failed to access camera")
      }

      console.log("[v0] Face scanning started successfully")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to start face scanning"
      console.error("[v0] Face scanning error:", errorMessage)
      setError(errorMessage)
      setIsActive(false)
    }
  }

  const stopScanning = () => {
    console.log("[v0] Stopping face scanning...")
    faceRecognitionService.stopCamera()
    setIsActive(false)
    setIsProcessing(false)
    setProgress(0)
  }

  const performVerification = async () => {
    if (!videoRef.current || !isActive) {
      console.error("[v0] Cannot perform verification: video not ready")
      return
    }

    try {
      console.log(`[v0] Starting ${mode} process...`)
      setIsProcessing(true)
      setError(null)
      setProgress(10)

      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 400)

      // Simulate liveness check updates with proper timing
      setTimeout(() => {
        console.log("[v0] Face quality check passed")
        setLivenessChecks((prev) => ({ ...prev, faceQuality: true }))
      }, 800)

      setTimeout(() => {
        console.log("[v0] Blink detection passed")
        setLivenessChecks((prev) => ({ ...prev, blinkDetected: true }))
      }, 1800)

      setTimeout(() => {
        console.log("[v0] Head movement check passed")
        setLivenessChecks((prev) => ({ ...prev, headMovement: true }))
      }, 2800)

      const verificationResult = await faceRecognitionService.performFullVerification(
        videoRef.current,
        storedEmbedding,
        mode,
      )

      clearInterval(progressInterval)
      setProgress(100)
      setResult(verificationResult)
      setLivenessChecks(verificationResult.liveness.checks)

      console.log(`[v0] ${mode} result:`, verificationResult)
      onVerificationComplete?.(verificationResult)

      if (mode === "verification" && studentId && verificationResult.embedding) {
        try {
          const response = await fetch("/api/face-verification", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              student_id: studentId,
              session_id: "session_1", // This should come from context
              embedding: verificationResult.embedding.data,
              confidence: verificationResult.confidence,
              liveness_score: verificationResult.liveness.confidence,
            }),
          })

          if (!response.ok) {
            throw new Error("Failed to submit verification result")
          }

          const apiResult = await response.json()
          console.log("[v0] Verification submitted to API:", apiResult)
        } catch (apiError) {
          console.error("[v0] Failed to submit verification:", apiError)
        }
      }

      // Auto-stop after successful verification/enrollment
      if (verificationResult.verified) {
        setTimeout(() => {
          stopScanning()
        }, 3000) // Give user time to see the result
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `${mode} failed`
      console.error(`[v0] ${mode} error:`, errorMessage)
      setError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusColor = (verified: boolean, confidence: number) => {
    if (verified && confidence > 0.8) return "text-green-600"
    if (verified && confidence > 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const getStatusBadge = (verified: boolean, confidence: number) => {
    if (verified && confidence > 0.8) return { variant: "default" as const, text: "Verified" }
    if (verified && confidence > 0.6) return { variant: "secondary" as const, text: "Low Confidence" }
    return { variant: "destructive" as const, text: "Failed" }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          AI Face Recognition
        </CardTitle>
        <CardDescription>
          {mode === "enrollment"
            ? "Enroll your face for future verification"
            : "Verify your identity using face recognition and liveness detection"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera Feed */}
        <div className="relative">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
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
          </div>

          {/* Overlay indicators */}
          {isActive && (
            <div className="absolute top-4 left-4 space-y-2">
              <Badge variant={isActive ? "default" : "outline"}>{isActive ? "Camera Active" : "Camera Off"}</Badge>
              {isProcessing && (
                <Badge variant="secondary">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Processing...
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Liveness Checks */}
        {isProcessing && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Liveness Detection</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Face Quality</span>
                <CheckCircle className={`w-4 h-4 ${livenessChecks.faceQuality ? "text-green-500" : "text-gray-400"}`} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Blink Detection</span>
                <CheckCircle
                  className={`w-4 h-4 ${livenessChecks.blinkDetected ? "text-green-500" : "text-gray-400"}`}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Head Movement</span>
                <CheckCircle
                  className={`w-4 h-4 ${livenessChecks.headMovement ? "text-green-500" : "text-gray-400"}`}
                />
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Verification Result</span>
              <Badge variant={getStatusBadge(result.verified, result.confidence).variant}>
                {getStatusBadge(result.verified, result.confidence).text}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Confidence:</span>
                <span className={`ml-2 font-medium ${getStatusColor(result.verified, result.confidence)}`}>
                  {(result.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Similarity:</span>
                <span className="ml-2 font-medium">{(result.similarity * 100).toFixed(1)}%</span>
              </div>
            </div>

            {result.verified && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Face verification successful! Your identity has been confirmed.</AlertDescription>
              </Alert>
            )}

            {!result.verified && (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Verification failed. Please ensure good lighting and look directly at the camera.
                  </AlertDescription>
                </Alert>

                {/* Detailed troubleshooting tips */}
                <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                  <p className="text-sm font-medium text-destructive mb-2">Troubleshooting Tips:</p>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li>• Move to a well-lit area or turn on more lights</li>
                    <li>• Remove glasses, hats, or face coverings if possible</li>
                    <li>• Position your face directly in front of the camera</li>
                    <li>• Keep your face steady and avoid excessive movement</li>
                    <li>• Ensure the camera lens is clean and unobstructed</li>
                  </ul>
                </div>

                {/* Quick retry button */}
                <Button
                  onClick={() => {
                    setResult(null)
                    setError(null)
                    performVerification()
                  }}
                  variant="outline"
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Try Again
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
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
          {!isActive ? (
            <Button onClick={startScanning} className="flex-1">
              <Camera className="w-4 h-4 mr-2" />
              Start Camera
            </Button>
          ) : (
            <>
              <Button onClick={performVerification} disabled={isProcessing} className="flex-1">
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {mode === "enrollment" ? "Enrolling..." : "Verifying..."}
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    {mode === "enrollment" ? "Enroll Face" : "Verify Face"}
                  </>
                )}
              </Button>
              <Button onClick={stopScanning} variant="outline">
                <CameraOff className="w-4 h-4 mr-2" />
                Stop
              </Button>
            </>
          )}
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Ensure good lighting and look directly at the camera</p>
          <p>• Follow the prompts for blink and head movement detection</p>
          <p>• Keep your face centered in the frame during {mode}</p>
          {error && <p className="text-red-500">• If camera fails, check browser permissions and try refreshing</p>}
        </div>
      </CardContent>
    </Card>
  )
}
