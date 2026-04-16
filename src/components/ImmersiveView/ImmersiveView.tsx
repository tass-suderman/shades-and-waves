import { Box, ThemeProvider, createTheme, alpha, useTheme as useMuiTheme } from '@mui/material'
import { useMemo } from 'react'
import ShaderPane from '../ShaderPane/ShaderPane'
import ShaderControls from '../ShaderControls/ShaderControls'
import { type ShaderPaneHandle } from '../ShaderPane/ShaderPane'
import { useEffect, useState } from 'react'
import { useAppStorage } from '../../hooks/useAppStorage'
import { useStrudelAnalyzer } from '../../hooks/useStrudelAnalyzer'
import { useStrudelAudioStream } from '../../hooks/useStrudelAudioStream'

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
		immersiveOpacity,
	} = useAppStorage()

	const { analyzer: strudelAnalyser } = useStrudelAnalyzer()
	const { strudelAudioStream } = useStrudelAudioStream()

  const baseTheme = useMuiTheme()

  // Build a theme variant with alpha-blended backgrounds so every component
  // inside the overlay respects the immersive opacity slider automatically.
  const immersiveTheme = useMemo(() => {
    const a = immersiveOpacity / 100
    const bg = baseTheme.palette.background
    return createTheme(baseTheme, {
      palette: {
        background: {
          app:      alpha(bg.app,      a),
          panel:    alpha(bg.panel,    a),
          header:   alpha(bg.header,   a),
          button:   alpha(bg.button,   a),
          card:     alpha(bg.card,     a),
          disabled: alpha(bg.disabled, a),
          hover:    alpha(bg.hover,    a),
        },
      },
    })
  }, [baseTheme, immersiveOpacity])

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
					strudelAnalyser={strudelAnalyser}
					strudelAudioStream={strudelAudioStream}
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
				{/* Editor area – wrapped in immersive theme so backgrounds become semi-transparent */}
				<ThemeProvider theme={immersiveTheme}>
					<Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
						{tabBar}
						{editorContent}
					</Box>
				</ThemeProvider>

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
