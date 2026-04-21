import { Box, IconButton, Slider, Tooltip } from '@mui/material'

interface SliderControlProps {
	icon: React.ReactNode
	activeIcon?: React.ReactNode
	value: number
	onChange: (value: number) => void
	min?: number
	max?: number
	step?: number
	label: string
	active?: boolean
	onIconClick?: () => void
}

export const SliderControl = ({
	icon,
	activeIcon,
	value,
	onChange,
	min = 0,
	max = 100,
	step = 1,
	label,
	active = true,
	onIconClick,
}: SliderControlProps) => {
	const displayIcon = active && activeIcon ? activeIcon : icon

	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
			{onIconClick ? (
				<Tooltip title={label}>
					<IconButton
						onClick={onIconClick}
						size="small"
						aria-label={label}
						sx={{ color: active ? 'background.hover' : 'white' }}
					>
						{displayIcon}
					</IconButton>
				</Tooltip>
			) : (
				<Tooltip title={label}>
					<Box sx={{ color: active ? 'background.hover' : 'white', display: 'flex', alignItems: 'center', px: 0.5 }}>
						{displayIcon}
					</Box>
				</Tooltip>
			)}
			<Slider
				value={value}
				onChange={(_e, val) => onChange(val as number)}
				min={min}
				max={max}
				step={step}
				size="small"
				aria-label={label}
				sx={{
					width: 80,
					color: 'white',
					'& .MuiSlider-thumb': { width: 12, height: 12 },
					'& .MuiSlider-rail': { opacity: 0.3 },
				}}
			/>
		</Box>
	)
}
