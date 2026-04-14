import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { UNIFORMS } from './uniformsData'

/** Inline uniforms reference panel – shown in-pane as a resizable split below the editor. */
export default function UniformsPanel() {
  return (
    <Box
      sx={{
        flex: 1,
        overflow: 'auto',
        p: 2,
        bgcolor: 'background.panel',
        color: 'textColor.primary',
      }}
    >
      {UNIFORMS.map(u => (
        <Box key={u.name} sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography
              component="code"
              sx={{ bgcolor: 'background.button', px: 0.75, py: 0.25, borderRadius: 0.5, fontSize: '0.8rem', fontFamily: 'monospace', color: '#9cdcfe' }}
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
          <Typography variant="caption" sx={{ color: 'textColor.muted', display: 'block', mt: 0.25 }}>
            {u.description}
          </Typography>
        </Box>
      ))}
      <Typography variant="caption" sx={{ color: 'textColor.muted', fontFamily: 'monospace', display: 'block', mt: 1 }}>
        These uniforms are compatible with <code style={{ color: '#9cdcfe' }}>ShaderToy</code> shaders.
      </Typography>
    </Box>
  )
}
