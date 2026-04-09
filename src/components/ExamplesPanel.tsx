import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'

interface ExampleMeta {
  id: string
  title: string
  aiGenerated?: boolean
}

interface ExamplesPanelProps {
  type: 'glsl' | 'strudel'
  onLoad: (title: string, content: string) => void
}

export default function ExamplesPanel({ type, onLoad }: ExamplesPanelProps) {
  const [examples, setExamples] = useState<ExampleMeta[]>([])
  const [listError, setListError] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [pending, setPending] = useState<ExampleMeta | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    setListError(false)
    fetch(`./examples/${type}/index.json`)
      .then(r => r.json())
      .then((data: ExampleMeta[]) => setExamples(data))
      .catch(() => setListError(true))
  }, [type])

  const handleSelect = (example: ExampleMeta) => {
    setLoadError(false)
    setPending(example)
    setConfirmOpen(true)
  }

  const handleConfirm = () => {
    if (!pending) return
    setConfirmOpen(false)
    const ext = type === 'glsl' ? 'glsl' : 'strudel'
    fetch(`./examples/${type}/${pending.id}.${ext}`)
      .then(r => r.text())
      .then((content: string) => onLoad(pending.title, content))
      .catch(() => setLoadError(true))
    setPending(null)
  }

  const handleCancel = () => {
    setConfirmOpen(false)
    setPending(null)
  }

  const itemLabel = type === 'glsl' ? 'shader' : 'pattern'

  return (
    <Box sx={{ height: '100%', overflow: 'auto', bgcolor: '#1e1e1e' }}>
      {listError && (
        <Typography
          variant="caption"
          sx={{ display: 'block', p: 2, color: '#ff8080', fontFamily: 'monospace' }}
        >
          Failed to load examples. Please try again later.
        </Typography>
      )}
      {loadError && (
        <Typography
          variant="caption"
          sx={{ display: 'block', px: 2, pt: 1, color: '#ff8080', fontFamily: 'monospace' }}
        >
          Failed to load example. Please try again.
        </Typography>
      )}
      {!listError && examples.length === 0 && (
        <Typography
          variant="caption"
          sx={{ display: 'block', p: 2, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}
        >
          No examples found.
        </Typography>
      )}
      {!listError && examples.length > 0 && (
        <List dense disablePadding>
          {examples.map(ex => (
            <ListItem key={ex.id} disablePadding>
              <ListItemButton
                onClick={() => handleSelect(ex)}
                sx={{
                  px: 2,
                  py: 1,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                }}
              >
                <ListItemText
                  primary={ex.title}
                  primaryTypographyProps={{
                    sx: {
                      color: 'rgba(255,255,255,0.85)',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                    },
                  }}
                />
                {ex.aiGenerated && (
                  <AutoAwesomeIcon titleAccess="AI-generated example" sx={{ fontSize: '0.875rem', color: 'rgba(255,220,100,0.8)', ml: 1 }} />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}

      <Dialog
        open={confirmOpen}
        onClose={handleCancel}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#1e1e1e', color: '#fff' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" sx={{ fontFamily: 'monospace', fontSize: '1rem' }}>
            Load example?
          </Typography>
          <IconButton size="small" onClick={handleCancel} aria-label="Close dialog" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>
            Loading <strong style={{ color: '#9cdcfe' }}>{pending?.title}</strong> will replace
            your current {itemLabel}. Any unsaved progress will be lost.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button
            onClick={handleCancel}
            size="small"
            sx={{ textTransform: 'none', color: 'rgba(255,255,255,0.7)' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color="primary"
            size="small"
            sx={{ textTransform: 'none' }}
          >
            Load
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
