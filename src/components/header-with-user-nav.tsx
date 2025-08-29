import { HeroHeader } from '@/components/header'
import UserNav from '@/components/user-nav'

export default async function HeaderWithUserNav() {
  return (
    <>
      <HeroHeader />
      <div className="fixed top-3 right-4 z-30">
        <UserNav />
      </div>
    </>
  )
}


