import { mountApp } from '@/app/mount'

// Standalone-базовые стили документа (html/body/#root, скроллбар и т.п.).
// Подключаются только здесь — при монтировании в хост через Module Federation
// документ принадлежит хосту, и эти стили не грузятся.
import '@/app/styles/base.css'

mountApp(document.getElementById('root')!)
