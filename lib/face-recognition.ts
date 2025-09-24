export interface FaceEmbedding {
  data: number[]
  confidence: number
  timestamp: Date
}

export interface LivenessResult {
  isLive: boolean
  confidence: number
  checks: {
    blinkDetected: boolean
    headMovement: boolean
    faceQuality: boolean
  }
}

export interface FaceVerificationResult {
  verified: boolean
  confidence: number
  similarity: number
  liveness: LivenessResult
  embedding?: FaceEmbedding
}

export interface PhotoEnrollmentResult {
  success: boolean
  photoUrl?: string
  embedding?: FaceEmbedding
  error?: string
}

export class FaceRecognitionService {
  private isInitialized = false
  private stream: MediaStream | null = null

  async initialize(): Promise<boolean> {
    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("[v0] Camera access not supported in this browser")
        throw new Error("Camera access not supported in this browser")
      }

      // Check if we're in a secure context (HTTPS or localhost)
      if (!window.isSecureContext) {
        console.error("[v0] Camera access requires HTTPS or localhost")
        throw new Error("Camera access requires HTTPS or localhost")
      }

      console.log("[v0] Face recognition service initialized successfully")
      this.isInitialized = true
      return true
    } catch (error) {
      console.error("[v0] Failed to initialize face recognition:", error)
      return false
    }
  }

  async requestCameraPermission(): Promise<boolean> {
    try {
      console.log("[v0] Requesting camera permission...")
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      })
      console.log("[v0] Camera permission granted")
      return true
    } catch (error) {
      console.error("[v0] Camera permission denied:", error)
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          throw new Error("Camera permission denied. Please allow camera access and try again.")
        } else if (error.name === "NotFoundError") {
          throw new Error("No camera found. Please connect a camera and try again.")
        } else if (error.name === "NotReadableError") {
          throw new Error("Camera is already in use by another application.")
        }
      }
      return false
    }
  }

  async startCamera(videoElement: HTMLVideoElement): Promise<boolean> {
    try {
      console.log("[v0] Starting camera...")
      if (!this.stream) {
        const hasPermission = await this.requestCameraPermission()
        if (!hasPermission) return false
      }

      videoElement.srcObject = this.stream

      return new Promise((resolve) => {
        videoElement.onloadedmetadata = () => {
          videoElement
            .play()
            .then(() => {
              console.log("[v0] Camera started successfully")
              resolve(true)
            })
            .catch((error) => {
              console.error("[v0] Failed to play video:", error)
              resolve(false)
            })
        }

        videoElement.onerror = (error) => {
          console.error("[v0] Video element error:", error)
          resolve(false)
        }
      })
    } catch (error) {
      console.error("[v0] Failed to start camera:", error)
      return false
    }
  }

  stopCamera(): void {
    console.log("[v0] Stopping camera...")
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        track.stop()
        console.log("[v0] Camera track stopped:", track.kind)
      })
      this.stream = null
    }
  }

  async captureFrame(videoElement: HTMLVideoElement): Promise<ImageData | null> {
    try {
      if (!videoElement.videoWidth || !videoElement.videoHeight) {
        console.error("[v0] Video element not ready for capture")
        return null
      }

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        console.error("[v0] Failed to get canvas context")
        return null
      }

      canvas.width = videoElement.videoWidth
      canvas.height = videoElement.videoHeight
      ctx.drawImage(videoElement, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      console.log("[v0] Frame captured successfully:", imageData.width, "x", imageData.height)
      return imageData
    } catch (error) {
      console.error("[v0] Failed to capture frame:", error)
      return null
    }
  }

  async detectLiveness(videoElement: HTMLVideoElement): Promise<LivenessResult> {
    console.log("[v0] Starting liveness detection...")

    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate more realistic liveness checks with better success rates
    const blinkDetected = Math.random() > 0.2 // 80% success rate
    const headMovement = Math.random() > 0.25 // 75% success rate
    const faceQuality = Math.random() > 0.15 // 85% success rate

    const isLive = blinkDetected && headMovement && faceQuality
    const confidence = isLive ? 0.85 + Math.random() * 0.1 : 0.3 + Math.random() * 0.4

    console.log("[v0] Liveness detection result:", { isLive, confidence, blinkDetected, headMovement, faceQuality })

    return {
      isLive,
      confidence,
      checks: {
        blinkDetected,
        headMovement,
        faceQuality,
      },
    }
  }

  async generateEmbedding(imageData: ImageData): Promise<FaceEmbedding> {
    // Simulate face embedding generation
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate mock 128-dimensional embedding
    const data = Array.from({ length: 128 }, () => Math.random() * 2 - 1)

    return {
      data,
      confidence: 0.8 + Math.random() * 0.15,
      timestamp: new Date(),
    }
  }

  async verifyFace(currentEmbedding: FaceEmbedding, storedEmbedding: FaceEmbedding, threshold = 0.7): Promise<number> {
    // Simulate cosine similarity calculation
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock similarity calculation
    const similarity = 0.6 + Math.random() * 0.35
    return similarity
  }

  async performFullVerification(
    videoElement: HTMLVideoElement,
    storedEmbedding?: FaceEmbedding,
    mode: "enrollment" | "verification" = "verification",
  ): Promise<FaceVerificationResult> {
    try {
      console.log(`[v0] Starting full face ${mode}...`)

      if (!videoElement.videoWidth || !videoElement.videoHeight) {
        throw new Error("Video stream not ready. Please ensure camera is active.")
      }

      // Step 1: Liveness detection
      console.log("[v0] Step 1: Liveness detection")
      const liveness = await this.detectLiveness(videoElement)

      if (!liveness.isLive) {
        console.log("[v0] Liveness check failed")
        return {
          verified: false,
          confidence: 0,
          similarity: 0,
          liveness,
        }
      }

      // Step 2: Capture and generate embedding
      console.log("[v0] Step 2: Capturing frame and generating embedding")
      const imageData = await this.captureFrame(videoElement)
      if (!imageData) {
        throw new Error("Failed to capture face image")
      }

      const embedding = await this.generateEmbedding(imageData)

      // Step 3: Verify against stored embedding (if provided)
      console.log(`[v0] Step 3: Face ${mode}`)
      let similarity = 0
      let verified = false

      if (mode === "verification" && storedEmbedding) {
        similarity = await this.verifyFace(embedding, storedEmbedding)
        verified = similarity > 0.7 && liveness.confidence > 0.8
        console.log("[v0] Verification against stored embedding:", { similarity, verified })
      } else if (mode === "enrollment") {
        // For enrollment, just check if liveness is good
        verified = liveness.confidence > 0.8
        similarity = 1.0
        console.log("[v0] Enrollment mode - liveness check:", { verified, confidence: liveness.confidence })
      } else {
        // No stored embedding for verification
        console.log("[v0] No stored embedding found for verification")
        verified = false
        similarity = 0
      }

      const confidence = Math.min(liveness.confidence, similarity)

      console.log(`[v0] ${mode} complete:`, { verified, confidence, similarity })

      return {
        verified,
        confidence,
        similarity,
        liveness,
        embedding,
      }
    } catch (error) {
      console.error(`[v0] Face ${mode} failed:`, error)
      return {
        verified: false,
        confidence: 0,
        similarity: 0,
        liveness: {
          isLive: false,
          confidence: 0,
          checks: {
            blinkDetected: false,
            headMovement: false,
            faceQuality: false,
          },
        },
      }
    }
  }

  async captureReferencePhoto(videoElement: HTMLVideoElement): Promise<PhotoEnrollmentResult> {
    try {
      console.log("[v0] Capturing reference photo...")

      if (!videoElement.videoWidth || !videoElement.videoHeight) {
        throw new Error("Video stream not ready for photo capture")
      }

      // Capture frame as before
      const imageData = await this.captureFrame(videoElement)
      if (!imageData) {
        throw new Error("Failed to capture photo frame")
      }

      // Convert ImageData to blob for storage
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        throw new Error("Failed to get canvas context for photo")
      }

      canvas.width = imageData.width
      canvas.height = imageData.height
      ctx.putImageData(imageData, 0, 0)

      // Convert to blob
      const photoBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error("Failed to create photo blob"))
          },
          "image/jpeg",
          0.8,
        )
      })

      // Generate embedding from the photo
      const embedding = await this.generateEmbedding(imageData)

      // Create object URL for preview (temporary)
      const photoUrl = URL.createObjectURL(photoBlob)

      console.log("[v0] Reference photo captured successfully")
      return {
        success: true,
        photoUrl,
        embedding,
      }
    } catch (error) {
      console.error("[v0] Failed to capture reference photo:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

export const faceRecognitionService = new FaceRecognitionService()
