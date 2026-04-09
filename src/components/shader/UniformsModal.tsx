import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import { UNIFORMS } from './uniformsData'

interface UniformsModalProps {
  open: boolean
  onClose: () => void
}

export default function UniformsModal({ open, onClose }: UniformsModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { bgcolor: 'var(--pg-bg-panel)', color: 'var(--pg-text-primary)' } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" sx={{ fontFamily: 'monospace', fontSize: '1rem' }}>
          Available Uniforms
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label="Close uniforms dialog" sx={{ color: 'var(--pg-text-primary)' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        {UNIFORMS.map(u => (
          <Box key={u.name} sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography
                component="code"
                sx={{ bgcolor: 'var(--pg-bg-button)', px: 0.75, py: 0.25, borderRadius: 0.5, fontSize: '0.8rem', fontFamily: 'monospace', color: '#9cdcfe' }}
              >
                {u.name}
              </Typography>
              <Typography
                component="span"
                sx={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#4ec9b0' }}
              >
                {u.type}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'var(--pg-text-muted)', display: 'block', mt: 0.25 }}>
              {u.description}
            </Typography>
          </Box>
        ))}
        <Typography variant="caption" sx={{ color: 'var(--pg-text-muted)', fontFamily: 'monospace', display: 'block', mt: 1 }}>
          These uniforms are compatible with <code style={{ color: '#9cdcfe' }}>ShaderToy</code> shaders.
        </Typography>
      </DialogContent>
    </Dialog>
  )
}
