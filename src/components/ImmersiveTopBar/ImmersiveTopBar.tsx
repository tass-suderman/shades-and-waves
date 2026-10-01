import { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material'
import { type ViewMode, tabConfigs } from '../../utility/tabConfigs'
import { type EditorPaneHandle } from '../EditorPane/EditorPane'
import { type StrudelPaneHandle } from '../StrudelPane/StrudelPane'
import { getInitialGlslTitle, getInitialStrudelTitle, useAppStorage } from '../../hooks/useAppStorage'
import TitlePill from './TitlePill'
import { DEFAULT_STRUDEL_TITLE } from '../../utility/strudel/defaults'
import { DEFAULT_SHADER_TITLE } from '../../utility/shader/defaults'
import TabsPill from './TabsPill'
import { PlatformNavigationContext } from '../../utility/PlatformNavigationContext'
import { assetUrl } from '../../utility/assetUrl'
import { Close, Menu, MoreHoriz, FileDownload, FileUpload, InfoOutlined, MusicNote, PlayArrow, Save, Stop } from '@mui/icons-material';
import SavedActionsPill from './SavedActionsPill'

interface ImmersiveTopBarProps {
	viewMode: ViewMode
	setViewMode: (mode: ViewMode) => void
	strudelRef: React.RefObject<StrudelPaneHandle>
	editorRef: React.RefObject<EditorPaneHandle>
}

interface PillActionButton {
	title: string
	ariaLabel: string
	onClick: () => void
	icon: React.ReactNode
	disabled?: boolean
}

const mapActionsToButtons = (actions: PillActionButton[]) => {
  return actions.map(({ title, ariaLabel, onClick, icon, disabled = false }, index) => (
    <Tooltip key={index} title={title} placement="bottom">
      <IconButton
        size="medium"
        onClick={onClick}
        sx={{ color: 'textColor.primary', width: 36, height: 36 }}
        aria-label={ariaLabel}
        disabled={disabled}
      >
        {icon}
      </IconButton>
    </Tooltip>
  ))
}

export const ImmersiveTopBar = ({
  viewMode,
  setViewMode,
  strudelRef,
  editorRef,
}: ImmersiveTopBarProps) => {
  const { immersiveOpacity } = useAppStorage()
  const openPlatformNavigation = useContext(PlatformNavigationContext)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [layout, setLayout] = useState<'centered' | 'packed' | 'compact' | 'collapsed'>('centered')
  const toolbarRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLSpanElement>(null)
  const isCollapsed = layout === 'collapsed'
  const hideName = layout === 'compact' || isCollapsed

  const shaderActions: PillActionButton[] = useMemo(() => [
    {
      title: 'Available uniforms',
      ariaLabel: 'Available uniforms',
      onClick: () => editorRef.current?.toggleUniforms(),
      icon: <InfoOutlined fontSize="small" />
    },
    {
      title: 'Save',
      ariaLabel: 'Save',
      onClick: () => editorRef.current?.save(),
      icon: <Save fontSize="small" />
    },
    {
      title: 'Import shader from file',
      ariaLabel: 'Import shader from file',
      onClick: () => editorRef.current?.triggerImport(),
      icon: <FileUpload fontSize="small" />
    },
    {
      title: 'Export shader to file',
      ariaLabel: 'Export shader to file',
      onClick: () => editorRef.current?.triggerExport(),
      icon: <FileDownload fontSize="small" />
    },
    {
      title: 'Run Shader',
      ariaLabel: 'Run Shader',
      onClick: () => editorRef.current?.run(),
      icon: <PlayArrow fontSize="small" />
    },
  ], [editorRef])

  const strudelActions: PillActionButton[] = useMemo(() => [
    {
      title: 'Available sounds',
      ariaLabel: 'Available sounds',
      onClick: () => strudelRef.current?.toggleSounds(),
      icon: <MusicNote fontSize="small" />
    },
    {
      title: 'Save',
      ariaLabel: 'Save',
      onClick: () => strudelRef.current?.save(),
      icon: <Save fontSize="small" />
    },
    {
      title: 'Import pattern from file',
      ariaLabel: 'Import pattern from file',
      onClick: () => strudelRef.current?.triggerImport(),
      icon: <FileUpload fontSize="small" />
    },
    {
      title: 'Export pattern to file',
      ariaLabel: 'Export pattern to file',
      onClick: () => strudelRef.current?.triggerExport(),
      icon: <FileDownload fontSize="small" />
    },
    {
      title: 'Play Strudel',
      ariaLabel: 'Play Strudel',
      onClick: () => strudelRef.current?.play(),
      icon: <PlayArrow fontSize="small" />
    },
    {
      title: 'Stop Strudel',
      ariaLabel: 'Stop Strudel',
      onClick: () => strudelRef.current?.pause(),
      icon: <Stop fontSize="small" />,
    },
  ], [strudelRef])

  const pillSx = useMemo(() => {
    const opacity = Math.min(1, Math.max(0, (immersiveOpacity ?? 50) / 100))
    return {
      display: 'flex',
      alignItems: 'center',
      borderRadius: '20px',
      bgcolor: `rgba(0,0,0,${opacity})`,
      border: '1px solid rgba(255,255,255,0.15)',
      backdropFilter: 'blur(8px)',
      px: 1.5,
      height: 40,
      gap: 0.5,
    }
  }, [immersiveOpacity]);

  const [title, setTitle] = useState(() => {
    if (viewMode === 'strudel') return getInitialStrudelTitle(DEFAULT_STRUDEL_TITLE)
    return getInitialGlslTitle(DEFAULT_SHADER_TITLE)
  })

  // Sync title when switching tabs
  useEffect(() => {
    if (viewMode === 'glsl') {
      setTitle(editorRef.current?.getTitle() ?? getInitialGlslTitle(DEFAULT_SHADER_TITLE))
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
  }

  const titlePill = (
    <TitlePill
      title={title}
      onTitleChange={handleTitleChange}
      tabConfig={tabConfigs.find(c => c.value === viewMode)!}
      sx={ pillSx }
    />
  )

  // Action buttons pill (GLSL or Strudel only)
  const actionPill = useMemo(() =>
  {
    let innerContent: React.ReactNode = null
    switch (viewMode) {
    case 'glsl': 
      innerContent = mapActionsToButtons(shaderActions);
      break;
    case 'strudel': 
      innerContent = mapActionsToButtons(strudelActions);
      break;
    case 'saved': 
      innerContent = <SavedActionsPill />
      break;
    }
    return innerContent ? (
      <Box sx={{ ...pillSx, px: 1, gap: 0.5, pointerEvents: 'auto' }}>
        {innerContent}
      </Box>
    ) : null
  }, [viewMode, shaderActions, strudelActions, pillSx])

  const tabsPill = (
    <TabsPill
      viewMode={viewMode}
      handleTabSelect={handleTabSelect}
      sx={pillSx}
    />
  )

  useLayoutEffect(() => {
    const measure = () => {
      const available = (toolbarRef.current?.clientWidth ?? 0) - 24
      const titleWidth = titleRef.current?.offsetWidth ?? 0
      const groups = Array.from(controlsRef.current?.children ?? [])
      const controlsWidth = groups.reduce((width, group) => width + (group as HTMLElement).offsetWidth, 0) + Math.max(0, groups.length - 1) * 8
      const brandIconsWidth = openPlatformNavigation ? 84 : 36
      const brandWidth = brandIconsWidth + 8 + (nameRef.current?.offsetWidth ?? 0)
      // Two 16px gaps separate the brand, title and controls.
      if (available >= titleWidth + 32 + 2 * Math.max(brandWidth, controlsWidth)) {
        setLayout('centered')
      } else if (available >= brandWidth + titleWidth + controlsWidth + 32) {
        setLayout('packed')
      } else if (available >= brandIconsWidth + titleWidth + controlsWidth + 32) {
        setLayout('compact')
      } else {
        setLayout('collapsed')
      }
    }
    measure()
    const observer = new ResizeObserver(measure)
    ;[toolbarRef, titleRef, controlsRef, nameRef].forEach(ref => {
      if (ref.current) observer.observe(ref.current)
    })
    return () => observer.disconnect()
  }, [viewMode, title, openPlatformNavigation])

  useEffect(() => {
    if (!isCollapsed) setMobileMenuOpen(false)
  }, [isCollapsed])

  return (
    <Box component="header" sx={{ bgcolor: 'rgba(0,0,0,0.8)', color: '#FFFFFF', borderBottom: '1px solid #957FB8' }}>
      <Box ref={toolbarRef} data-header-layout={layout} sx={{
        position: 'relative', display: 'grid',
        gridTemplateColumns: layout === 'centered' ? 'minmax(0, 1fr) auto minmax(0, 1fr)' : 'auto minmax(0, 1fr) auto',
        alignItems: 'center', columnGap: 2, rowGap: 1, minHeight: 64, px: 1.5,
        py: mobileMenuOpen ? 1.5 : 0,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          {openPlatformNavigation && (
            <IconButton
              aria-label="Open navigation"
              onClick={openPlatformNavigation}
              sx={{ width: 40, height: 40, flexShrink: 0, border: '1px solid #957FB8', borderRadius: '12px', color: '#A4B9EF' }}
            >
              <Menu />
            </IconButton>
          )}
          <Box component="img" src={assetUrl('images/sunglasses-logo.png')} alt="" sx={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }} />
          <Typography
            ref={nameRef} component="span" variant="h6" noWrap aria-hidden={hideName || undefined}
            sx={{ width: 'max-content', flexShrink: 0, position: hideName ? 'absolute' : 'static', visibility: hideName ? 'hidden' : 'visible' }}
          >Shades n Waves</Typography>
        </Box>
        <Box ref={titleRef} sx={{ minWidth: 0, justifySelf: layout === 'centered' ? 'center' : 'end' }}>{titlePill}</Box>
        {isCollapsed && (
          <IconButton aria-label={mobileMenuOpen ? 'Close pane controls' : 'Open pane controls'} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(v => !v)} sx={{ color: '#A4B9EF', justifySelf: 'end' }}>
            {mobileMenuOpen ? <Close /> : <MoreHoriz />}
          </IconButton>
        )}
        <Box
          ref={controlsRef}
          aria-hidden={isCollapsed && !mobileMenuOpen || undefined}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1, width: 'max-content', justifySelf: 'end',
            position: isCollapsed && !mobileMenuOpen ? 'absolute' : 'static',
            visibility: isCollapsed && !mobileMenuOpen ? 'hidden' : 'visible',
            gridColumn: mobileMenuOpen ? '1 / -1' : 3,
            gridRow: mobileMenuOpen ? 2 : 1,
            flexWrap: mobileMenuOpen ? 'wrap' : 'nowrap', maxWidth: mobileMenuOpen ? '100%' : undefined,
          }}
        >
          {actionPill}{tabsPill}
        </Box>
      </Box>
    </Box>
  )
}
