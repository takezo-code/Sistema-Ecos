import React, { createContext, useContext, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { cn } from '../../lib/utils'

const SidebarContext = createContext(undefined)

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

export function SidebarProvider({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}) {
  const [openState, setOpenState] = useState(false)
  const open = openProp !== undefined ? openProp : openState
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function AceternitySidebar({ children, open, setOpen, animate }) {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  )
}

export function SidebarBody(props) {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...props} />
    </>
  )
}

export function DesktopSidebar({ className, children, ...props }) {
  const { open, setOpen, animate } = useSidebar()
  return (
    <motion.div
      className={cn(
        'h-full min-h-0 overflow-hidden py-5 px-2.5 hidden md:flex md:flex-col bg-transparent border-r border-white/6 shrink-0',
        className,
      )}
      animate={{
        width: animate ? (open ? 280 : 64) : 280,
      }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function MobileSidebar({ className, children, ...props }) {
  const { open, setOpen } = useSidebar()
  return (
    <div
      className={cn(
        'h-10 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-neutral-950/90 border-b border-white/6 w-full shrink-0',
      )}
      {...props}
    >
      <div className="flex justify-end z-20 w-full">
        <Menu
          className="text-neutral-200 cursor-pointer"
          size={20}
          onClick={() => setOpen(!open)}
        />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={cn(
              'fixed h-full w-full inset-0 bg-neutral-950 p-10 z-[100] flex flex-col justify-between',
              className,
            )}
          >
            <div
              className="absolute right-10 top-10 z-50 text-neutral-200 cursor-pointer"
              onClick={() => setOpen(!open)}
            >
              <X size={22} />
            </div>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function SidebarLink({ link, className, onClick, active = false, ...props }) {
  const { open, animate } = useSidebar()
  const showLabel = !animate || open

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault()
      onClick(e)
    } else if (!link.href || link.href === '#') {
      e.preventDefault()
    }
  }

  return (
    <a
      href={link.href || '#'}
      onClick={handleClick}
      className={cn(
        // Layout estável: ícone sempre no mesmo slot — sem trocar justify-center/start
        'relative flex w-full min-h-[3.75rem] items-center rounded-2xl py-5',
        active
          ? 'text-violet-300 bg-white/[0.07]'
          : 'text-neutral-400 hover:text-neutral-100 hover:bg-white/[0.05]',
        className,
      )}
      {...props}
    >
      <span className="flex h-6 w-10 shrink-0 items-center justify-center">
        {link.icon}
      </span>
      <motion.span
        initial={false}
        animate={{
          opacity: showLabel ? 1 : 0,
          maxWidth: showLabel ? 180 : 0,
          marginLeft: showLabel ? 4 : 0,
        }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="overflow-hidden whitespace-nowrap text-[1.05rem] font-medium leading-none tracking-wide"
      >
        {link.label}
      </motion.span>
    </a>
  )
}
