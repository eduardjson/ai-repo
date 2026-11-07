// Типы remote-модулей Module Federation, которые хост подгружает в рантайме.
declare module 'houseConstructor/mount' {
  /**
   * Пропсы монтирования (резерв для будущего: apiBaseUrl, token, themeMode…).
   * Пока конструктор самодостаточен и пропсов не требует.
   */
  export type MountOptions = Record<string, unknown>

  /** Монтирует remote-приложение в контейнер и возвращает функцию размонтирования. */
  export function mount(container: HTMLElement, options?: MountOptions): () => void
}
