import { useMediaStreams } from '../../hooks/useMediaStreams'
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ReplayIcon from '@mui/icons-material/Replay'
import { UniformEntry, UNIFORMS } from '../../utility/shader/uniformsData'
import { InformationPanel } from '../InformationPanel/InformationPanel';

export default function UniformsPanel() {
  const { uploadedVideo, uploadedAudio } = useMediaStreams()
  const renderUniform = (u: UniformEntry) => (
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
      <Typography variant="caption" sx={{ color: 'textColor.muted', fontFamily: 'monospace', display: 'block', mt: 0.25 }}>
        {u.description}
      </Typography>
    </Box>
  )

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <InformationPanel
        renderer={renderUniform}
        items={UNIFORMS}
        header={
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {([['Video', uploadedVideo], ['Audio', uploadedAudio]] as const).map(([label, media]) => (
                <Button
                  key={label}
                  component="label"
                  size="small"
                  variant="outlined"
                  startIcon={<FileUploadIcon fontSize="small" />}
                  sx={{
                    textTransform: 'none', fontSize: '0.75rem', color: 'textColor.muted',
                    borderColor: 'border.faint', '&:hover': { borderColor: 'textColor.muted' },
                  }}
                >
                  Upload {label.toLowerCase()}
                  <input hidden type="file" aria-label={`Upload ${label.toLowerCase()}`} accept={`${label.toLowerCase()}/*`}
                    onChange={event => { const file = event.target.files?.[0]; if (file) media.upload(file); event.target.value = '' }} />
                </Button>
              ))}
            </Box>
            {([['Video', uploadedVideo], ['Audio', uploadedAudio]] as const).map(([label, media]) => (
              media.element && (
                <Box key={label} sx={{ mb: 2 }}>
                  <>
                    <Typography
                      variant="caption"
                      sx={{ color: 'textColor.muted', textTransform: 'uppercase', display: 'block', mb: 0.5 }}
                    >
                      Uploaded {label.toLowerCase()}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.25, mb: 1 }}>
                      <Typography
                        component="span"
                        sx={{
                          bgcolor: 'background.button', px: 0.75, py: 0.25, borderRadius: 0.5,
                          fontSize: '0.8rem', fontFamily: 'monospace', color: '#9cdcfe', flexShrink: 0,
                        }}
                      >
                        iChannel{label === 'Video' ? '3' : '4'}
                      </Typography>
                      <Typography
                        variant="caption"
                        title={media.name}
                        sx={{ color: 'textColor.muted', fontFamily: 'monospace', maxWidth: '40%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}
                      >
                        {media.name}
                      </Typography>
                      <Tooltip title={`${media.playing ? 'Pause' : 'Play'} ${label.toLowerCase()}`}>
                        <IconButton
                          size="small"
                          aria-label={`${media.playing ? 'Pause' : 'Play'} ${label}`}
                          onClick={() => media.playing ? media.pause() : void media.play()}
                          disabled={media.converting}
                          sx={{ color: 'textColor.muted', flexShrink: 0, p: 0.25 }}
                        >
                          {media.playing ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={`Restart ${label.toLowerCase()}`}>
                        <IconButton
                          size="small"
                          aria-label={`Restart ${label}`}
                          onClick={media.restart}
                          disabled={media.converting}
                          sx={{ color: 'textColor.muted', flexShrink: 0, p: 0.25 }}
                        >
                          <ReplayIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={`Remove ${label.toLowerCase()}`}>
                        <IconButton
                          size="small"
                          aria-label={`Remove ${label}`}
                          onClick={media.clear}
                          sx={{ color: 'textColor.muted', flexShrink: 0, p: 0.25 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </>
                </Box>
              )
            ))}
            {uploadedAudio.converting && <Typography variant="caption" role="status" sx={{ color: 'textColor.muted', display: 'block' }}>Converting M4A audio for this browser…</Typography>}
            {([uploadedVideo, uploadedAudio] as const).map((media, index) =>
              media.error && <Typography key={index} role="alert" color="error" variant="caption" sx={{ display: 'block', mt: 0.5 }}>{media.error}</Typography>
            )}
          </Box>
        }
        footer={(
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ color: 'textColor.muted', display: 'block' }}>
              Files stay in this browser session. Both loop; video is muted. Shader pause freezes rendering only.
            </Typography>
            <Typography variant="caption" sx={{ color: 'textColor.muted', fontFamily: 'monospace', display: 'block', mt: 1 }}>
              These uniforms are compatible with <code style={{ color: '#9cdcfe' }}>ShaderToy</code> shaders.
            </Typography>
          </Box>
        )}
      />
    </Box>
  )
}
