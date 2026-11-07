import type { ModuleConfig } from './estimate'

// Лёгкий fetch-клиент для конструктора. Remote-приложение не использует общий
// Redux/RTK Query хоста — оно автономно и общается с бэкендом напрямую.
// Токен доступа предоставляет хост через функции getToken/setToken (пропсы),
// что позволяет remote-приложению так же перевыпускать токен при 401.

export interface ProjectDto {
  id: string
  name: string
  config: ModuleConfig
  userId: string
  createdAt: string
  updatedAt: string
}

export interface PriceListItemDto {
  id: string
  productId: string
  productTitle: string
  category?: string | null
  manufacturer?: string | null
  unit?: string | null
  quantity: number
  purchasePrice?: number | null
  estimatePrice?: number | null
  salePrice?: number | null
  discount?: number | null
  warehouseId: string
  warehouseName: string
  firstArrivedAt?: string | null
}

export interface ConstructorApi {
  listProjects(): Promise<ProjectDto[]>
  createProject(name: string, config: ModuleConfig): Promise<ProjectDto>
  updateProject(id: string, name: string, config: ModuleConfig): Promise<ProjectDto>
  removeProject(id: string): Promise<void>
  listPriceList(): Promise<PriceListItemDto[]>
}

export type TokenGetter = () => string | null
export type TokenSetter = (token: string | null) => void

export function createConstructorApi(
  baseUrl: string,
  getToken: TokenGetter,
  setToken: TokenSetter,
): ConstructorApi {
  const request = async (path: string, init: RequestInit = {}): Promise<Response> => {
    const doFetch = (token: string | null) =>
      fetch(`${baseUrl}${path}`, {
        ...init,
        credentials: 'include',
        headers: {
          ...(init.body ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(init.headers ?? {}),
        },
      })

    let res = await doFetch(getToken())

    if (res.status === 401) {
      const refreshRes = await fetch(`${baseUrl}/auth/refresh-tokens`, {
        method: 'POST',
        credentials: 'include',
      })
      if (refreshRes.ok) {
        const data = (await refreshRes.json()) as { accessToken?: string }
        if (data.accessToken) {
          setToken(data.accessToken)
          res = await doFetch(data.accessToken)
        }
      } else {
        setToken(null)
      }
    }

    return res
  }

  const read = async <T>(res: Response): Promise<T> => {
    if (!res.ok) throw new Error(`API error ${res.status}`)
    return res.json() as Promise<T>
  }

  return {
    async listProjects() {
      return read<ProjectDto[]>(await request('/projects'))
    },
    async createProject(name, config) {
      return read<ProjectDto>(
        await request('/projects', { method: 'POST', body: JSON.stringify({ name, config }) }),
      )
    },
    async updateProject(id, name, config) {
      return read<ProjectDto>(
        await request(`/projects/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ name, config }),
        }),
      )
    },
    async removeProject(id) {
      await request(`/projects/${id}`, { method: 'DELETE' })
    },
    async listPriceList() {
      return read<PriceListItemDto[]>(await request('/warehouses/price-lists/all'))
    },
  }
}
