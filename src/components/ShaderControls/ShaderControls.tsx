import { useRef, useState } from 'react'
import {
	Box,
  Button,
  Popover,
  Slider,
  Tooltip,
  Typography,
} from '@mui/material'
import {
	PlayArrow,
	Pause,
	Fullscreen,
	FullscreenExit,
	Videocam,
	VideocamOff,
	Mic,
	MicOff,
	VolumeUp,
	VolumeDown,
	VolumeOff,
	FiberManualRecord,
	StopCircle,
	ChevronLeft,
	ChevronRight,
	ExpandMore,
	ExpandLess,
	Preview,
} from '@mui/icons-material'
import ChannelStatusChips from '../ChannelStatusChips/ChannelStatusChips'
import { useAppStorage } from '../../hooks/useAppStorage'

interface ShaderControlsProps {
  isPlaying: boolean
  isRecording: boolean
  isFullscreen: boolean
  webcamEnabled: boolean
  micEnabled: boolean
  strudelAnalyser?: AnalyserNode | null
  onTogglePlay: () => void
  onToggleWebcam: () => void
  onToggleMic: () => void
  onVolumeChange: (value: number) => void
  onToggleMute: () => void
  onStartRecording: () => void
  onStopRecording: () => void
  onToggleFullscreen: () => void
  /** Whether the editor panel is currently collapsed */
  editorCollapsed?: boolean
  /** Callback to toggle editor collapse/expand */
  onToggleEditorCollapsed?: () => void
  /** True when on a narrow/mobile viewport (affects icon direction) */
  isMobile?: boolean
  /** Whether immersive mode is currently active */
  isImmersive?: boolean
  /** Callback to toggle immersive mode */
  onToggleImmersive?: () => void
  /** Background opacity (0–100) used in immersive mode */
  immersiveOpacity?: number
  /** Callback when the immersive opacity slider changes */
  onImmersiveOpacityChange?: (opacity: number) => void
}

export default function ShaderControls({
  isPlaying,
  isRecording,
  isFullscreen,
  webcamEnabled,
  micEnabled,
  strudelAnalyser,
  onTogglePlay,
  onToggleWebcam,
  onToggleMic,
  onVolumeChange,
  onToggleMute,
  onStartRecording,
  onStopRecording,
  onToggleFullscreen,
  editorCollapsed,
  onToggleEditorCollapsed,
  isMobile = false,
  isImmersive = false,
  onToggleImmersive,
  immersiveOpacity = 50,
  onImmersiveOpacityChange,
}: ShaderControlsProps) {
	const { muted, volume } = useAppStorage()

  const Volume = (muted || volume === 0)
    ? VolumeOff
    : volume <= 50
      ? VolumeDown
      : VolumeUp

  const previewBtnRef = useRef<HTMLButtonElement>(null)
  const [opacityPopoverOpen, setOpacityPopoverOpen] = useState(false)

  const handlePreviewClick = () => {
    onToggleImmersive?.()
    setOpacityPopoverOpen(true)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1,
        py: 0.5,
        bgcolor: 'rgba(0,0,0,0.8)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Tooltip title={isPlaying ? 'Pause' : 'Play'}>
        <Button onClick={onTogglePlay} size="small" sx={{ color: 'white' }}>
          {isPlaying ? <Pause /> : <PlayArrow />}
        </Button>
      </Tooltip>

      <Tooltip title={webcamEnabled ? 'Disable Webcam (iChannel0)' : 'Enable Webcam (iChannel0)'}>
        <Button onClick={onToggleWebcam} size="small" sx={{ color: webcamEnabled ? 'primary.main' : 'white' }}>
          {webcamEnabled ? <Videocam /> : <VideocamOff />}
        </Button>
      </Tooltip>

      <Tooltip title={micEnabled ? 'Disable Microphone (iChannel1)' : 'Enable Microphone (iChannel1)'}>
        <Button onClick={onToggleMic} size="small" sx={{ color: micEnabled ? 'primary.main' : 'white' }}>
          {micEnabled ? <Mic /> : <MicOff />}
        </Button>
      </Tooltip>

      <ChannelStatusChips
        webcamEnabled={webcamEnabled}
        micEnabled={micEnabled}
        strudelAnalyser={strudelAnalyser}
      />

      <Box sx={{ flex: 1 }} />

      <Tooltip title={muted ? 'Unmute' : 'Mute'}>
        <Button onClick={onToggleMute} size="small" aria-label={muted ? 'Unmute' : 'Mute'} sx={{ color: 'white' }}>
          <Volume />
        </Button>
      </Tooltip>

      <Slider
        value={volume}
        min={0}
        max={100}
        size="small"
        aria-label="Volume"
        onChange={(_e, val) => onVolumeChange(val as number)}
        sx={{
          width: 80,
          color: 'white',
          '& .MuiSlider-thumb': { width: 12, height: 12 },
          '& .MuiSlider-rail': { opacity: 0.3 },
        }}
      />

      <Tooltip title={isRecording ? 'Stop recording' : 'Start recording'}>
        <Button
          onClick={isRecording ? onStopRecording : onStartRecording}
          size="small"
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          sx={{ color: isRecording ? 'error.main' : 'white' }}
        >
          {isRecording ? <StopCircle /> : <FiberManualRecord />}
        </Button>
      </Tooltip>

      {onToggleImmersive !== undefined && (
        <>
          <Tooltip title={isImmersive ? 'Exit immersive mode' : 'Immersive mode'}>
            <Button
              ref={previewBtnRef}
              onClick={handlePreviewClick}
              size="small"
              aria-label={isImmersive ? 'Exit immersive mode' : 'Immersive mode'}
              sx={{ color: isImmersive ? 'primary.light' : 'white' }}
            >
              <Preview />
            </Button>
          </Tooltip>

          {isImmersive && (
            <Tooltip title={`Opacity: ${immersiveOpacity}%`}>
              <Slider
                value={immersiveOpacity}
                onChange={(_e, val) => onImmersiveOpacityChange?.(val as number)}
                min={0}
                max={100}
                step={1}
                size="small"
                aria-label="Background opacity"
                sx={{
                  width: 80,
                  color: 'primary.light',
                  '& .MuiSlider-thumb': { width: 12, height: 12 },
                  '& .MuiSlider-rail': { opacity: 0.3 },
                }}
              />
            </Tooltip>
          )}

          <Popover
            open={opacityPopoverOpen}
            anchorEl={previewBtnRef.current}
            onClose={() => setOpacityPopoverOpen(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            slotProps={{ paper: { sx: { bgcolor: 'rgba(0,0,0,0.85)', color: 'white', p: 2, minWidth: 200, border: '1px solid rgba(255,255,255,0.15)' } } }}
          >
            <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
              Background opacity: {immersiveOpacity}%
            </Typography>
            <Slider
              value={immersiveOpacity}
              onChange={(_e, val) => onImmersiveOpacityChange?.(val as number)}
              min={0}
              max={100}
              step={1}
              size="small"
              disabled={!isImmersive}
              sx={{
                color: 'white',
                '& .MuiSlider-thumb': { width: 12, height: 12 },
                '& .MuiSlider-rail': { opacity: 0.3 },
              }}
            />
            {!isImmersive && (
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'rgba(255,255,255,0.5)' }}>
                Enable immersive mode to adjust
              </Typography>
            )}
          </Popover>
        </>
      )}

      <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
        <Button onClick={onToggleFullscreen} size="small" sx={{ color: 'white' }}>
          {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
        </Button>
      </Tooltip>

      {onToggleEditorCollapsed !== undefined && (
        <Tooltip title={editorCollapsed ? 'Expand Editor' : 'Collapse Editor'}>
          <Button
            onClick={onToggleEditorCollapsed}
            size="small"
            aria-label={editorCollapsed ? 'Expand Editor' : 'Collapse Editor'}
            sx={{ color: 'white' }}
          >
            {isMobile
              ? (editorCollapsed ? <ExpandMore /> : <ExpandLess />)
              : (editorCollapsed ? <ChevronLeft /> : <ChevronRight />)
            }
          </Button>
        </Tooltip>
      )}
    </Box>
  )
}
