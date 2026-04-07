// ---------------------------------------------------------------------------
// Sounds reference data – available sound names grouped by category
// ---------------------------------------------------------------------------

export interface SoundCategory {
  label: string
  sounds: readonly string[]
  aliases?: Record<string, string>
  note?: string
}

export const SOUND_CATEGORIES: readonly SoundCategory[] = [
  {
    label: 'Oscillator waveforms',
    sounds: ['sine', 'sawtooth', 'square', 'triangle'],
    aliases: { sin: 'sine', saw: 'sawtooth', sqr: 'square', tri: 'triangle' },
  },
  {
    label: 'Synth voices',
    sounds: ['sbd', 'supersaw', 'bytebeat', 'pulse', 'bus', 'user', 'one'],
  },
  {
    label: 'Noise',
    sounds: ['pink', 'white', 'brown', 'crackle'],
  },
  {
    label: 'ZZFX (procedural)',
    sounds: ['zzfx', 'z_sine', 'z_sawtooth', 'z_triangle', 'z_square', 'z_tan', 'z_noise'],
  },
  // ---------------------------------------------------------------------------
  // Drum samples – loaded automatically on first play (requires internet).
  // Use with s("name") or .sound("name"), e.g. s("TR808_bd TR808_sd TR808_hh").
  // ---------------------------------------------------------------------------
  {
    label: 'Drums — generic (uzu-drumkit)',
    sounds: ['bd', 'sn', 'hh', 'oh', 'cp', 'cr', 'brk', 'cb', 'lt', 'mt', 'ht'],
    note: 'Loaded from tidalcycles/uzu-drumkit on first play.',
  },
  {
    label: 'Roland TR-808',
    sounds: [
      'TR808_bd', 'TR808_sd', 'TR808_hh', 'TR808_oh',
      'TR808_cp', 'TR808_cr', 'TR808_lt', 'TR808_mt', 'TR808_ht',
      'TR808_rim', 'TR808_cb', 'TR808_sh', 'TR808_perc',
    ],
    note: 'Alias: RolandTR808_*',
  },
  {
    label: 'Roland TR-909',
    sounds: [
      'TR909_bd', 'TR909_sd', 'TR909_hh', 'TR909_oh',
      'TR909_cp', 'TR909_cr', 'TR909_lt', 'TR909_mt', 'TR909_ht',
      'TR909_rd', 'TR909_rim',
    ],
    note: 'Alias: RolandTR909_*',
  },
  {
    label: 'Roland TR-606 & TR-707',
    sounds: [
      'TR606_bd', 'TR606_sd', 'TR606_hh', 'TR606_oh', 'TR606_cr', 'TR606_lt', 'TR606_ht',
      'TR707_bd', 'TR707_sd', 'TR707_hh', 'TR707_oh', 'TR707_cp', 'TR707_cr',
      'TR707_lt', 'TR707_mt', 'TR707_ht', 'TR707_rim', 'TR707_cb',
    ],
    note: 'Aliases: RolandTR606_* / RolandTR707_*',
  },
  {
    label: 'Linn LM-1 & Oberheim DMX',
    sounds: [
      'LM1_bd', 'LM1_sd', 'LM1_hh', 'LM1_oh', 'LM1_cp',
      'LM1_lt', 'LM1_ht', 'LM1_rim', 'LM1_cb', 'LM1_perc',
      'DMX_bd', 'DMX_sd', 'DMX_hh', 'DMX_oh', 'DMX_cp', 'DMX_cr',
      'DMX_lt', 'DMX_mt', 'DMX_ht', 'DMX_rd', 'DMX_rim',
    ],
    note: 'Aliases: LinnLM1_* / OberheimDMX_*',
  },
  {
    label: 'More classic machines',
    sounds: [
      'DR55_bd', 'DR55_sd', 'DR55_hh', 'DR55_cp',
      'DR110_bd', 'DR110_sd', 'DR110_hh', 'DR110_oh', 'DR110_cp',
      'KR55_bd', 'KR55_sd', 'KR55_hh',
      'Minipops_bd', 'Minipops_sd', 'Minipops_hh',
      'MPC60_bd', 'MPC60_sd', 'MPC60_hh', 'MPC60_oh', 'MPC60_cp',
      'R8_bd', 'R8_sd', 'R8_hh', 'R8_oh', 'R8_cp', 'R8_cr', 'R8_rim',
    ],
    note: 'Aliases: BossDR55_* / BossDR110_* / KorgKR55_* / KorgMinipops_* / AkaiMPC60_* / RolandR8_*',
  },
] as const
