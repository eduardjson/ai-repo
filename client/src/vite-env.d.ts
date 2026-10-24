/// <reference types="vite/client" />

declare module '@mui/icons-material' {
  import type { SvgIconProps } from '@mui/material'
  
  type SvgIconComponent = (props: SvgIconProps) => JSX.Element | null

  export const Add: SvgIconComponent
  export const ArrowBack: SvgIconComponent
  export const Build: SvgIconComponent
  export const Business: SvgIconComponent
  export const CalendarMonth: SvgIconComponent
  export const CheckCircle: SvgIconComponent
  export const CloudUpload: SvgIconComponent
  export const DarkMode: SvgIconComponent
  export const Delete: SvgIconComponent
  export const Edit: SvgIconComponent
  export const Email: SvgIconComponent
  export const Inventory: SvgIconComponent
  export const LightMode: SvgIconComponent
  export const Logout: SvgIconComponent
  export const People: SvgIconComponent
  export const Person: SvgIconComponent
  export const Phone: SvgIconComponent
  export const Send: SvgIconComponent
}
