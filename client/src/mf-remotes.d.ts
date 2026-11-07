// Типы для remote-модулей Module Federation, которые хост подгружает лениво.
declare module 'houseConstructor/Builder' {
  import type { ComponentType } from 'react'

  export interface BuilderProps {
    apiBaseUrl?: string
    getAccessToken?: () => string | null
    setAccessToken?: (token: string | null) => void
    themeMode?: 'light' | 'dark'
  }

  export const Builder: ComponentType<BuilderProps>
  export default Builder
}
