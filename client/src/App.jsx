import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/items')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setItems(data)
      setError('')
    } catch (e) {
      setError(`Не удалось загрузить данные: ${e}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setName('')
      setDescription('')
      await fetchItems()
    } catch (e) {
      setError(`Не удалось добавить запись: ${e}`)
    }
  }

  return (
    <main className="app">
      <h1>Vite + React + NestJS + Prisma + PostgreSQL</h1>
      <p className="subtitle">
        Всё крутится в отдельных Docker-контейнерах
      </p>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder="Название"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Описание (необязательно)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Добавить</button>
      </form>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Загрузка…</p>
      ) : items.length === 0 ? (
        <p className="empty">Пока нет записей. Добавьте первую!</p>
      ) : (
        <ul className="list">
          {items.map((item) => (
            <li key={item.id} className="item">
              <div>
                <strong>{item.name}</strong>
                {item.description && <span>{item.description}</span>}
              </div>
              <time>{new Date(item.createdAt).toLocaleString()}</time>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default App
