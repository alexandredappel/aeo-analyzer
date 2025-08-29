import Link from 'next/link'
import HeaderClient from '@/components/header.client'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
export const dynamic = 'force-dynamic'

const menuItems = [
    { name: 'Features', href: '#features' },
    { name: 'About', href: '#about' },
    { name: 'Pricing', href: '#pricing' },
]

export async function HeroHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()


  const email = user?.email ?? null

  return <HeaderClient initialUserEmail={email} />
}
