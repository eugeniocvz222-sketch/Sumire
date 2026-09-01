import React, { useState, useEffect } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { NotebookShelf } from './components/notebooks/NotebookShelf'
import { SubjectView } from './components/notebooks/SubjectView'
import { TasksView } from './components/tasks/TasksView'
import { ScheduleView } from './components/schedule/ScheduleView'
import { GradesView } from './components/grades/GradesView'
import { ProfileView } from './components/profile/ProfileView'
import { NewSubjectModal } from './components/modals/NewSubjectModal'
import { NewPeriodModal } from './components/modals/NewPeriodModal'
import { SettingsModal } from './components/modals/SettingsModal'
import { SearchModal } from './components/modals/SearchModal'
import { AuthModal } from './components/modals/AuthModal'
import { OnboardingDialog } from './components/modals/OnboardingDialog'
import { AuthScreen } from './components/auth/AuthScreen'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { UpdateNotifier } from './components/common/UpdateNotifier'
import { Toaster } from 'sonner'

const MainApp: React.FC = () => {
  const { user, isAuthenticated, activeView, selectedSemester, createSubject, createPeriod } = useApp()
  const [isNewSubjectOpen, setIsNewSubjectOpen] = useState(false)
  const [isNewPeriodOpen, setIsNewPeriodOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('apuntes_sidebar_collapsed') === 'true'
  })

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('apuntes_sidebar_collapsed', String(next))
      return next
    })
  }

  // Automatic Trigger for New Users
  useEffect(() => {
    if (isAuthenticated) {
      const key = user?.id ? `sumire_onboarding_completed_${user.id}` : 'sumire_onboarding_completed_guest'
      const completed = localStorage.getItem(key)
      if (!completed) {
        // Small delay for smooth entry animation
        const timer = setTimeout(() => {
          setIsOnboardingOpen(true)
        }, 600)
        return () => clearTimeout(timer)
      }
    }
  }, [isAuthenticated, user?.id])

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsSearchOpen((prev) => !prev)
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        const target = e.target as HTMLElement | null
        const isEditable =
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable ||
            Boolean(target.closest('.tiptap')) ||
            Boolean(target.closest('[contenteditable="true"]')))

        if (isEditable) return // Keep default bold functionality in editors!

        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // If not authenticated, show standalone Login/Register screen
  if (!isAuthenticated) {
    return (
      <ErrorBoundary fallbackTitle="Error en la pantalla de autenticación">
        <AuthScreen />
        <Toaster position="bottom-right" theme="dark" richColors closeButton />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen w-screen overflow-hidden bg-[#030306] text-slate-100 antialiased font-sans">
        {/* Sidebar Navigation with Cuatrimestre Switcher & User Profile Card */}
        <Sidebar
          onOpenNewSubject={() => setIsNewSubjectOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenNewPeriod={() => setIsNewPeriodOpen(true)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
          <Header
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenNewSubject={() => setIsNewSubjectOpen(true)}
            onOpenNewPeriod={() => setIsNewPeriodOpen(true)}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={toggleSidebar}
          />

          <main className="flex-1 flex overflow-hidden">
            <ErrorBoundary fallbackTitle="Error al cargar esta sección">
              {activeView === 'shelf' && <NotebookShelf />}
              {activeView === 'subject' && <SubjectView />}
              {activeView === 'tasks' && <TasksView />}
              {activeView === 'schedule' && <ScheduleView />}
              {activeView === 'grades' && <GradesView />}
              {activeView === 'profile' && <ProfileView />}
            </ErrorBoundary>
          </main>
        </div>

        {/* Modals */}
        <NewSubjectModal
          isOpen={isNewSubjectOpen}
          onClose={() => setIsNewSubjectOpen(false)}
          onSave={(data) => createSubject(data)}
          currentSemester={selectedSemester}
        />

        <NewPeriodModal
          isOpen={isNewPeriodOpen}
          onClose={() => setIsNewPeriodOpen(false)}
          onSave={(data) => createPeriod(data)}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
        />

        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
        />

        <OnboardingDialog
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
        />

        {/* In-app Auto Updater Notification Banner */}
        <UpdateNotifier />

        {/* Sonner Toast Notifications Container */}
        <Toaster position="bottom-right" theme="dark" richColors closeButton />
      </div>
    </ErrorBoundary>
  )
}

export function App() {
  return (
    <ErrorBoundary fallbackTitle="Error Crítico de la Aplicación">
      <AppProvider>
        <MainApp />
      </AppProvider>
    </ErrorBoundary>
  )
}

export default App
