"use client"
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React from 'react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { LogoutButton } from '@/components/logout-button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function HeaderClient({ initialUserEmail }: { initialUserEmail: string | null }) {
  const [menuState, setMenuState] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [userEmail, setUserEmail] = React.useState<string | null>(initialUserEmail)
  const router = useRouter()

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Keep header in sync with client auth state immediately
  React.useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {

      setUserEmail(session?.user?.email ?? null)
      // Trigger server re-render to sync SSR header
      try { router.refresh() } catch {}
    })
    return () => { subscription.unsubscribe() }
  }, [router])

  return (
    <header>
      <nav
        data-state={menuState && 'active'}
        className="fixed z-20 w-full px-2">
        <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12', isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5')}>
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2">
                {/* Image logo EVOTHA si disponible */}
                <img src="/evotha-long.png" alt="EVOTHA" className="h-6 w-auto md:h-8" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                {/* Fallback vector logo */}
                <span className="sr-only">EVOTHA</span>
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {[
                  { name: 'Features', href: '#features' },
                  { name: 'About', href: '#about' },
                  { name: 'Pricing', href: '#pricing' },
                ].map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-accent-foreground block duration-150">
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {[
                    { name: 'Features', href: '#features' },
                    { name: 'About', href: '#about' },
                    { name: 'Pricing', href: '#pricing' },
                  ].map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-accent-foreground block duration-150">
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <div className="hidden lg:flex items-center gap-3">
                  {userEmail ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Avatar>
                          <AvatarFallback>{userEmail.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{userEmail}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="mailto:alexandre@evadigital.fr">Contact Support</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <LogoutButton />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button asChild size="sm" variant="outline" className="bg-white !text-primary border-primary hover:bg-[#0068c9]/5">
                      <Link href="/auth/login">Login</Link>
                    </Button>
                  )}
                </div>
                <Button
                  asChild
                  size="sm"
                  className={cn(isScrolled ? 'lg:inline-flex' : 'hidden')}>
                  <Link href="#hero">
                    <span>Analyze now</span>
                  </Link>
                </Button>
              </div>
            </div>

            {/* User nav (mobile) */}
            <div className="absolute right-10 top-1/2 -translate-y-1/2 z-30 lg:hidden">
              {userEmail ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar>
                      <AvatarFallback>{userEmail.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{userEmail}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="mailto:alexandre@evadigital.fr">Contact Support</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <LogoutButton />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild size="sm" variant="outline" className="bg-white !text-primary border-primary hover:bg-[#0068c9]/5">
                  <Link href="/auth/login">Login</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}


