import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Square, Save, XCircle, Play, Pause } from "lucide-react";
import { uploadToGoogleDrive } from "@/lib/googleDriveService";

interface StatementRecorderProps {
  onSave: (audioBlob: Blob, audioUrl: string) => void;
  onCancel: () => void;
  caseNumber: string;
  personName: string;
  personType: string;
}

const StatementRecorder: React.FC<StatementRecorderProps> = ({
  onSave,
  onCancel,
  caseNumber,
  personName,
  personType,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Clean up function to stop recording and release media resources
  const cleanup = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Clean up on component unmount
  useEffect(() => {
    return cleanup;
  }, []);

  const startRecording = async () => {
    try {
      // Reset state
      setAudioBlob(null);
      setAudioUrl(null);
      chunksRef.current = [];
      setRecordingTime(0);

      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Set up event handlers
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setIsRecording(false);
        setIsPaused(false);

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);

      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not access microphone. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const pauseRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const resumeRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "paused"
    ) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);

      // Restart timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleSave = async () => {
    if (!audioBlob) return;

    try {
      setIsUploading(true);

      // Format filename for Google Drive
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `case_${caseNumber}_${personType}_${personName.replace(/\s+/g, "_")}_${timestamp}.webm`;

      // In a real implementation, this would upload to Google Drive
      // For now, we'll just pass the blob and URL to the parent component
      // const { fileUrl } = await uploadToGoogleDrive(audioBlob, filename);

      onSave(audioBlob, audioUrl!);
    } catch (error) {
      console.error("Error saving recording:", error);
      alert("Failed to save recording. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          {!isRecording && !audioUrl ? (
            <div className="text-center">
              <div className="mb-4 text-muted-foreground">
                Click the button below to start recording a statement
              </div>
              <Button onClick={startRecording} className="flex items-center">
                <Mic className="mr-2 h-4 w-4" />
                Start Recording
              </Button>
            </div>
          ) : isRecording ? (
            <div className="flex flex-col items-center w-full">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <div className="w-6 h-6 rounded-full bg-red-500 animate-pulse"></div>
              </div>

              <div className="text-2xl font-bold mb-6">
                {formatTime(recordingTime)}
              </div>

              <div className="flex gap-4">
                {isPaused ? (
                  <Button onClick={resumeRecording} variant="outline">
                    <Play className="mr-2 h-4 w-4" />
                    Resume
                  </Button>
                ) : (
                  <Button onClick={pauseRecording} variant="outline">
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </Button>
                )}

                <Button onClick={stopRecording} variant="destructive">
                  <Square className="mr-2 h-4 w-4" />
                  Stop
                </Button>
              </div>
            </div>
          ) : audioUrl ? (
            <div className="w-full">
              <audio controls className="w-full mb-6">
                <source src={audioUrl} type="audio/webm" />
                Your browser does not support the audio element.
              </audio>

              <div className="flex justify-center gap-4">
                <Button onClick={startRecording} variant="outline">
                  <Mic className="mr-2 h-4 w-4" />
                  Record Again
                </Button>

                <Button onClick={onCancel} variant="outline">
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel
                </Button>

                <Button onClick={handleSave} disabled={isUploading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isUploading ? "Saving..." : "Save Recording"}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatementRecorder;
