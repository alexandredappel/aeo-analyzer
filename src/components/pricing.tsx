"use client"

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Pricing() {
    const router = useRouter()

    const [isLoading, setIsLoading] = React.useState(false)

    const handleUpgrade = React.useCallback(async () => {
        try {
            setIsLoading(true)
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/auth/sign-up?intent=upgrade')
                return
            }

            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY })
            })

            if (!response.ok) {
                const err = await response.json().catch(() => ({} as any))
                throw new Error(err?.message || 'Failed to create checkout session')
            }

            const data: { checkoutUrl?: string } = await response.json()
            if (data.checkoutUrl) {
                window.location.assign(data.checkoutUrl)
                return
            }
            // Optionally show a user-facing notification here
            // e.g., toast.warning('No checkout URL returned by the server')

        } catch (_error) {
            // Optionally show a user-facing error notification

        } finally {
            setIsLoading(false)
        }
    }, [router])

    return (
        <section id="pricing" className="py-16 md:py-32 scroll-mt-24 md:scroll-mt-28">
            <div className="mx-auto max-w-5xl px-6">
                <div className="mx-auto max-w-2xl space-y-6 text-center">
                    <h1 className="text-center text-4xl font-semibold lg:text-5xl">Pricing</h1>
                </div>

                <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-5 md:gap-0">
                    <div className="rounded-(--radius) flex flex-col justify-between space-y-8 border p-6 md:col-span-2 md:my-2 md:rounded-r-none md:border-r-0 lg:p-10">
                        <div className="space-y-4">
                            <div>
                                <h2 className="font-medium">Free Plan</h2>
                                <span className="my-3 block text-2xl font-semibold">0$ / mo</span>
                                <p className="text-muted-foreground text-sm">5 analysis per month</p>
                            </div>

                            <Button
                                asChild
                                variant="outline"
                                className="w-full">
                                <Link href="">Get Started</Link>
                            </Button>

                            <hr className="border-dashed" />

                            <ul className="list-outside space-y-3 text-sm">
                                {['Complete GEO score analysis', 'Full analysis suite', 'Actionable recommendations', 'PDF export reports'].map((item, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center gap-2">
                                        <Check className="size-3" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="rounded-(--radius) border p-6 shadow-lg shadow-gray-950/5 md:col-span-3 lg:p-10 bg-primary text-primary-foreground">
                        <div className="space-y-4">
                            <div>
                                <h2 className="font-bold text-primary-foreground">Early Bird Pricing</h2>
                                <span className="my-3 block text-2xl font-semibold">
                                    <span className="mr-2 line-through opacity-80">$29 / mo</span>
                                    $14.50 / mo
                                </span>
                                <p className="text-sm opacity-90">100 analysis per month</p>
                            </div>

                            <Button
                                onClick={handleUpgrade}
                                disabled={isLoading}
                                variant="outline"
                                className="w-full bg-white !text-primary hover:bg-white/90">
                                {isLoading ? 'Redirecting...' : 'Upgrade'}
                            </Button>

                            <hr className="border-dashed border-primary-foreground/30" />

                            <ul className="list-outside space-y-3 text-sm">
                                {['Complete GEO score analysis', 'Full analysis suite', 'Actionable recommendations', 'PDF export reports'].map((item, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center gap-2">
                                        <Check className="size-3" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
