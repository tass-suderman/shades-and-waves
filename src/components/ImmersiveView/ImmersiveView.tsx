import { Box } from '@mui/material'
import ShaderPane from '../ShaderPane/ShaderPane'
import ShaderControls from '../ShaderControls/ShaderControls'
import { type ShaderPaneHandle } from '../ShaderPane/ShaderPane'
import { useEffect, useState } from 'react'
import { useMediaStreams } from '../../hooks/useMediaStreams'
import { useAppStorage } from '../../hooks/useAppStorage'

export interface ImmersiveViewProps {
	outerContainerRef: React.RefObject<HTMLDivElement>
	shaderRef: React.RefObject<ShaderPaneHandle>
	tabBar: React.ReactNode
	editorContent: React.ReactNode
	shaderSource: string
	setShaderError: (error: string | null) => void
	isMobile: boolean
	handleToggleImmersive: () => void
}

export const ImmersiveView = ({
	outerContainerRef,
	shaderRef,
	tabBar,
	editorContent,
	shaderSource,
	setShaderError,
	isMobile,
	handleToggleImmersive,
}: ImmersiveViewProps) => {
  const [immersiveShaderPlaying, setImmersiveShaderPlaying] = useState(true)
  const [immersiveShaderRecording, setImmersiveShaderRecording] = useState(false)
  const [immersiveShaderFullscreen, setImmersiveShaderFullscreen] = useState(false)

  const {
    webcamEnabled,
    micEnabled,
    webcamStream,
    audioStream,
    handleToggleWebcam,
    handleToggleMic,
  } = useMediaStreams()

	const {
		immersiveOpacity,
	} = useAppStorage()

  useEffect(() => {
		document.documentElement.dataset.immersive = 'true'
		document.documentElement.style.setProperty('--pg-immersive-alpha', `${immersiveOpacity}%`)
  }, [immersiveOpacity])

	return (
		<Box
			ref={outerContainerRef}
			sx={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}
		>
			{/* Layer 0 – Shader canvas, full viewport, behind everything */}
			<Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
				<ShaderPane
					ref={shaderRef}
					shaderSource={shaderSource}
					webcamStream={webcamStream}
					audioStream={audioStream}
					webcamEnabled={webcamEnabled}
					micEnabled={micEnabled}
					onToggleWebcam={handleToggleWebcam}
					onToggleMic={handleToggleMic}
					onShaderError={setShaderError}
					isMobile={isMobile}
					hideControls
					onPlayStateChange={setImmersiveShaderPlaying}
					onRecordingStateChange={setImmersiveShaderRecording}
					onFullscreenStateChange={setImmersiveShaderFullscreen}
				/>
			</Box>

			{/* Layer 1 – Editor overlay + controls bar stacked in one flex column */}
			<Box sx={{ position: 'absolute', inset: 0, zIndex: 1, display: 'flex', flexDirection: 'column' }}>
				{/* Editor area – flex:1 so it fills space above the controls bar */}
				<Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
					{tabBar}
					{editorContent}
				</Box>

				{/* Controls bar sits at the bottom and takes its natural height */}
				<ShaderControls
					isPlaying={immersiveShaderPlaying}
					isRecording={immersiveShaderRecording}
					isFullscreen={immersiveShaderFullscreen}
					onTogglePlay={() => shaderRef.current?.togglePlay()}
					onStartRecording={() => shaderRef.current?.startRecording()}
					onStopRecording={() => shaderRef.current?.stopRecording()}
					onToggleFullscreen={() => shaderRef.current?.toggleFullscreen()}
					isMobile={isMobile}
					isImmersive={true}
					onToggleImmersive={handleToggleImmersive}
				/>
			</Box>
		</Box>
	)
}
