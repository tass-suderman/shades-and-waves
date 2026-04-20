import { useEffect, useRef, useState } from 'react'
import {
  Box,
  IconButton,
  InputBase,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Tooltip,
} from '@mui/material'
import CodeIcon from '@mui/icons-material/Code'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import FolderIcon from '@mui/icons-material/Folder'
import SettingsIcon from '@mui/icons-material/Settings'
import InfoIcon from '@mui/icons-material/Info'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import SaveIcon from '@mui/icons-material/Save'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import StopIcon from '@mui/icons-material/Stop'
import { type ViewMode, tabConfigs } from '../../constants/tabConfigs'
import { type EditorPaneHandle } from '../EditorPane/EditorPane'
import { type StrudelPaneHandle } from '../StrudelPane/StrudelPane'
import { getInitialGlslTitle, getInitialStrudelTitle } from '../../hooks/useAppStorage'

const DEFAULT_GLSL_TITLE = 'Fragment Shader (GLSL)'
const DEFAULT_STRUDEL_TITLE = 'Strudel Pattern'

const TAB_ICONS: Record<ViewMode, React.ReactElement> = {
  glsl: <CodeIcon fontSize="small" />,
  strudel: <MusicNoteIcon fontSize="small" />,
  saved: <FolderIcon fontSize="small" />,
  settings: <SettingsIcon fontSize="small" />,
  about: <InfoIcon fontSize="small" />,
}

interface ImmersiveTopBarProps {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  strudelRef: React.RefObject<StrudelPaneHandle>
  editorRef: React.RefObject<EditorPaneHandle>
}

const pillSx = {
  display: 'flex',
  alignItems: 'center',
  borderRadius: '20px',
  bgcolor: 'rgba(0,0,0,0.55)',
  border: '1px solid rgba(255,255,255,0.15)',
  backdropFilter: 'blur(8px)',
  px: 1.5,
  py: 0.5,
  gap: 0.5,
}

export const ImmersiveTopBar = ({
  viewMode,
  setViewMode,
  strudelRef,
  editorRef,
}: ImmersiveTopBarProps) => {
  const [tabMenuOpen, setTabMenuOpen] = useState(false)
  const tabTriggerRef = useRef<HTMLDivElement>(null)

  const [title, setTitle] = useState(() => {
    if (viewMode === 'strudel') return getInitialStrudelTitle(DEFAULT_STRUDEL_TITLE)
    return getInitialGlslTitle(DEFAULT_GLSL_TITLE)
  })

  // Sync title when switching tabs
  useEffect(() => {
    if (viewMode === 'glsl') {
      setTitle(editorRef.current?.getTitle() ?? getInitialGlslTitle(DEFAULT_GLSL_TITLE))
    } else if (viewMode === 'strudel') {
      setTitle(strudelRef.current?.getTitle() ?? getInitialStrudelTitle(DEFAULT_STRUDEL_TITLE))
    }
  }, [viewMode, editorRef, strudelRef])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTitle(val)
    if (viewMode === 'glsl') {
      editorRef.current?.setTitle(val)
    } else if (viewMode === 'strudel') {
      strudelRef.current?.setTitle(val)
    }
  }

  const handleTabSelect = (mode: ViewMode) => {
    if (mode !== viewMode && viewMode === 'strudel') {
      strudelRef.current?.closeSounds()
    }
    setViewMode(mode)
    setTabMenuOpen(false)
  }

  const showTitlePill = viewMode === 'glsl' || viewMode === 'strudel'

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1,
        flexShrink: 0,
        pointerEvents: 'none',
      }}
    >
      {/* Left pill: editable title */}
      {showTitlePill ? (
        <Box sx={{ ...pillSx, width: 300, pointerEvents: 'auto' }}>
          <InputBase
            value={title}
            onChange={handleTitleChange}
            sx={{
              color: 'white',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              flex: 1,
              '& input': { p: 0 },
            }}
            inputProps={{ 'aria-label': viewMode === 'glsl' ? 'Shader title' : 'Pattern title' }}
          />
        </Box>
      ) : (
        <Box />
      )}

      {/* Right pill: tab switcher + action buttons */}
      <Box sx={{ ...pillSx, pointerEvents: 'auto', position: 'relative' }}>
        {/* Tab switcher icon – hover to open dropdown */}
        <Box
          ref={tabTriggerRef}
          onMouseEnter={() => setTabMenuOpen(true)}
          onMouseLeave={() => setTabMenuOpen(false)}
          sx={{ position: 'relative' }}
        >
          <Tooltip title="Switch tab">
            <IconButton size="small" sx={{ color: 'white' }}>
              {TAB_ICONS[viewMode]}
            </IconButton>
          </Tooltip>

          {tabMenuOpen && (
            <Box
              sx={{
                position: 'absolute',
                top: '100%',
                right: 0,
                mt: 0.5,
                bgcolor: 'rgba(0,0,0,0.85)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 1,
                overflow: 'hidden',
                minWidth: 150,
                zIndex: 10,
              }}
            >
              {tabConfigs.map(({ value, label }) => (
                <MenuItem
                  key={value}
                  selected={value === viewMode}
                  onClick={() => handleTabSelect(value)}
                  sx={{
                    color: 'white',
                    py: 0.5,
                    px: 1.5,
                    '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.12)' },
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                    fontSize: '0.875rem',
                  }}
                >
                  <ListItemIcon sx={{ color: 'white', minWidth: 28 }}>
                    {TAB_ICONS[value]}
                  </ListItemIcon>
                  <ListItemText
                    primary={label}
                    sx={{ '& .MuiListItemText-primary': { fontSize: '0.875rem', color: 'white' } }}
                  />
                </MenuItem>
              ))}
            </Box>
          )}
        </Box>

        {/* GLSL action buttons */}
        {viewMode === 'glsl' && (
          <>
            <Tooltip title="Available uniforms">
              <IconButton
                size="small"
                sx={{ color: 'white' }}
                onClick={() => editorRef.current?.toggleUniforms()}
              >
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Save">
              <IconButton
                size="small"
                sx={{ color: 'white' }}
                onClick={() => editorRef.current?.save()}
              >
                <SaveIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Import shader from file">
              <IconButton
                size="small"
                sx={{ color: 'white' }}
                onClick={() => editorRef.current?.triggerImport()}
              >
                <FileUploadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export shader to file">
              <IconButton
                size="small"
                sx={{ color: 'white' }}
                onClick={() => editorRef.current?.triggerExport()}
              >
                <FileDownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Run Shader">
              <IconButton
                size="small"
                sx={{ color: 'white' }}
                onClick={() => editorRef.current?.run()}
              >
                <PlayArrowIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}

        {/* Strudel action buttons */}
        {viewMode === 'strudel' && (
          <>
            <Tooltip title="Available sounds">
              <IconButton
                size="small"
                sx={{ color: 'white' }}
                onClick={() => strudelRef.current?.toggleSounds()}
              >
                <MusicNoteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Save">
              <IconButton
                size="small"
                sx={{ color: 'white' }}
                onClick={() => strudelRef.current?.save()}
              >
                <SaveIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Import pattern from file">
              <IconButton
                size="small"
                sx={{ color: 'white' }}
                onClick={() => strudelRef.current?.triggerImport()}
              >
                <FileUploadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export pattern to file">
              <IconButton
                size="small"
                sx={{ color: 'white' }}
                onClick={() => strudelRef.current?.triggerExport()}
              >
                <FileDownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Play Strudel">
              <IconButton
                size="small"
                sx={{ color: 'white' }}
                onClick={() => strudelRef.current?.play()}
              >
                <PlayArrowIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Stop Strudel">
              <IconButton
                size="small"
                sx={{ color: 'white' }}
                onClick={() => strudelRef.current?.pause()}
              >
                <StopIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
    </Box>
  )
}
