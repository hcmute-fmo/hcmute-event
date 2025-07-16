import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/client/LandingPage'
import AuthLayout from './components/layouts/AuthLayout'
import DashboardLayout from './components/layouts/DashboardLayout'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/admin/DashboardPage'
import ManageEventPage from './pages/admin/ManageEventPage'
import ManageUserPage from './pages/admin/ManageUserPage'
import EventDetailPage from './pages/admin/EventDetailPage'
import TestPage from './pages/client/TestPage'
import { Toaster } from "@/components/ui/sonner"

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Toaster />
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<AuthLayout />}>
        <Route path="/dang-nhap" element={<LoginPage />} />
      </Route>

      <Route path="/test" element={<TestPage />} />

      <Route path="/quan-ly/*" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="su-kien" element={<ManageEventPage />} />
        <Route path="su-kien/:id" element={<EventDetailPage />} />
        <Route path="nguoi-dung" element={<ManageUserPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
)
