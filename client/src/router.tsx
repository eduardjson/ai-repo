import { createRootRoute, createRoute, createRouter, Outlet, useNavigate } from '@tanstack/react-router'
import { Box, CircularProgress } from '@mui/material'
import { useEffect } from 'react'

import { AppLayout } from './routes/__root'
import { DashboardPage } from './routes/index'
import { LoginPage } from './routes/auth/login'
import { ProductListPage } from './routes/products/index'
import { ProductDetailPage } from './routes/products/$productId'
import { ProductAddPage } from './routes/products/add'
import { WarehouseListPage } from './routes/warehouses/index'
import { ObjectListPage } from './routes/objects/index'
import { ShipmentListPage } from './routes/shipments/index'
import { PriceListPage } from './routes/prices/index'
import { EmployeeListPage } from './routes/employees/index'
import { EmployeeDetailPage } from './routes/employees/$employeeId'
import { ChatPage } from './routes/chat/index'
import { ConstructorPage } from './routes/constructor/index'
import { TransferListPage } from './routes/transfers/index'

import { useAppSelector } from './store/hooks'

function AuthGuard() {
  const { isAuthenticated, isLoading } = useAppSelector((s) => s.auth)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: '/auth/login' })
    }
  }, [isLoading, isAuthenticated, navigate])

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}><CircularProgress /></Box>
  }

  if (!isAuthenticated) return null

  return <Outlet />
}

const rootRoute = createRootRoute({
  component: AppLayout,
})

const authRoutes = createRoute({
  getParentRoute: () => rootRoute,
  id: 'auth',
})

const loginRoute = createRoute({
  getParentRoute: () => authRoutes,
  path: '/auth/login',
  component: LoginPage,
})

const privateRoutes = createRoute({
  getParentRoute: () => rootRoute,
  id: '_private',
  component: AuthGuard,
})

const indexRoute = createRoute({
  getParentRoute: () => privateRoutes,
  path: '/',
  component: DashboardPage,
})

const productsRoute = createRoute({
  getParentRoute: () => privateRoutes,
  path: '/products',
  component: ProductListPage,
})

const productDetailRoute = createRoute({
  getParentRoute: () => privateRoutes,
  path: '/products/$productId',
  component: ProductDetailPage,
})

const productAddRoute = createRoute({
  getParentRoute: () => privateRoutes,
  path: '/products/add',
  component: ProductAddPage,
})

const warehousesRoute = createRoute({
  getParentRoute: () => privateRoutes,
  path: '/warehouses',
  component: WarehouseListPage,
})

const objectsRoute = createRoute({
  getParentRoute: () => privateRoutes,
  path: '/objects',
  component: ObjectListPage,
})

const shipmentsRoute = createRoute({
  getParentRoute: () => privateRoutes,
  path: '/shipments',
  component: ShipmentListPage,
})

const pricesRoute = createRoute({
  getParentRoute: () => privateRoutes,
  path: '/prices',
  component: PriceListPage,
})

const employeesRoute = createRoute({
  getParentRoute: () => privateRoutes,
  path: '/employees',
  component: EmployeeListPage,
})

const employeeDetailRoute = createRoute({
  getParentRoute: () => privateRoutes,
  path: '/employees/$employeeId',
  component: EmployeeDetailPage,
})

const chatRoute = createRoute({
  getParentRoute: () => privateRoutes,
  path: '/chat',
  component: ChatPage,
})

const constructorRoute = createRoute({
  getParentRoute: () => privateRoutes,
  path: '/constructor',
  component: ConstructorPage,
})

const transfersRoute = createRoute({
  getParentRoute: () => privateRoutes,
  path: '/transfers',
  component: TransferListPage,
})

const routeTree = rootRoute.addChildren([
  authRoutes.addChildren([loginRoute]),
  privateRoutes.addChildren([
    indexRoute,
    productsRoute,
    productDetailRoute,
    productAddRoute,
    warehousesRoute,
    objectsRoute,
    shipmentsRoute,
    pricesRoute,
    employeesRoute,
    employeeDetailRoute,
    chatRoute,
    constructorRoute,
    transfersRoute,
  ]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
