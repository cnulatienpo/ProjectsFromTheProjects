export type ReportSection = {
  id: string
  label: string
  description: string
}

export type ReportType = {
  id: string
  name: string
  description: string
  sections: ReportSection[]
  default?: boolean
  includesStyle?: boolean
}

export const reportTypes: ReportType[] = [
  {
    id: 'sigil-core',
    name: 'Sigil Core Report',
    description: 'Score + momentum recap tailored for Sigil_&_Syntax attempts.',
    default: true,
    includesStyle: true,
    sections: [
      {
        id: 'scorecard',
        label: 'Scorecard',
        description: 'Overall score plus key dimensions mapped to the current level.',
      },
      {
        id: 'badges',
        label: 'Badges',
        description: 'Any new badges awarded with reasons and XP boosts.',
      },
      {
        id: 'style',
        label: 'Style Report',
        description: 'Line-level findings powered by the Sigil_&_Syntax style analyzer.',
      },
      {
        id: 'next',
        label: 'Next Moves',
        description: 'Concrete steps to take on the next attempt.',
      },
    ],
  },
]

export default reportTypes
