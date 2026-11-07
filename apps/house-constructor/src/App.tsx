import { Builder } from './constructor/Builder'

// Standalone-обёртка для локальной разработки. В standalone-режиме нет хоста,
// который передал бы токен доступа, поэтому серверные данные (проекты и
// прайс-лист) не загружаются — 3D-вид, чертёж и смета работают локально.
export default function App() {
  return <Builder themeMode="light" />
}
