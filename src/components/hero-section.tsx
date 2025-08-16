import React, { useState } from 'react'
import { SendHorizontal } from 'lucide-react'
import { LiaLinkSolid, LiaCheckCircleSolid } from 'react-icons/lia'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TextEffect } from '@/components/ui/text-effect'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { HeroHeader } from './header'
import { LogoCloud } from './logo-cloud'
import { useRouter } from 'next/navigation'
import { trackAnalysisStart } from '@/utils/analytics'
import { normalizeAndValidate } from '@/utils/url'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export default function HeroSection() {
    const router = useRouter()
    const [url, setUrl] = useState('')
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const value = url.trim()
        const normalized = normalizeAndValidate(value)
        if (!normalized) {
            setError("Please enter a valid URL")
            return
        }
        setError(null)
        trackAnalysisStart(normalized)
        router.push(`/report?url=${encodeURIComponent(normalized)}`)
    }
    return (
        <>
            <HeroHeader />

            <main className="overflow-hidden [--color-primary-foreground:var(--color-white)] [--color-primary:var(--color-green-600)]">
                <section id="hero" className="scroll-mt-24 md:scroll-mt-28">
                    <div className="relative mx-auto max-w-6xl px-6 pb-0 pt-32 lg:pt-48">
                        <div className="relative z-10 mx-auto max-w-4xl text-center">
                            <Badge className="mx-auto mb-4 bg-[#0068c9]/10 text-[#00296b] border-transparent px-3 py-1 md:px-3.5 md:py-1.5 text-sm [&>svg]:size-4 gap-1.5">
                                <LiaCheckCircleSolid />
                                <span>Spot & Fix AI Issues in 1 Click</span>
                            </Badge>
                            <TextEffect
                                preset="fade-in-blur"
                                speedSegment={0.3}
                                as="h1"
                                className="text-balance text-4xl font-semibold md:text-5xl">
                                Make your site the source AI engines cite first
                            </TextEffect>
                            <TextEffect
                                per="line"
                                preset="fade-in-blur"
                                speedSegment={0.3}
                                delay={0.5}
                                as="p"
                                className="mx-auto mt-6 max-w-2xl text-pretty text-lg">
                                Run a one-click audit that makes your content visible and understandable by LLMs like ChatGPT. Get a crystal-clear report with precise actions to boost your AI visibility.
                            </TextEffect>

                            <AnimatedGroup
                                variants={{
                                    container: {
                                        visible: {
                                            transition: {
                                                staggerChildren: 0.05,
                                                delayChildren: 0.75,
                                            },
                                        },
                                    },
                                    ...transitionVariants,
                                }}
                                className="mt-12">
                                <form onSubmit={handleSubmit} className="mx-auto max-w-2xl md:max-w-3xl">
                                    <div className="bg-background has-[input:focus]:ring-muted relative grid grid-cols-[1fr_auto] items-center rounded-[calc(var(--radius)+0.75rem)] border px-3 py-2 gap-2 shadow shadow-zinc-950/5 has-[input:focus]:ring-2">
                                        <LiaLinkSolid className="pointer-events-none absolute inset-y-0 left-5 my-auto size-6 md:size-7" />

                                        <input
                                            placeholder="Enter URL"
                                            aria-label="Enter URL"
                                            className="h-14 md:h-16 w-full bg-transparent pl-14 md:pl-16 focus:outline-none text-base md:text-lg"
                                            type="text"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                        />

                                        <div className="pr-2">
                                            <Button
                                                aria-label="submit"
                                                size="lg"
                                                className="rounded-[calc(var(--radius)+0.5rem)] h-14 md:h-16 px-6 md:px-8 text-base md:text-lg">
                                                <span>Analyze</span>
                                            </Button>
                                        </div>
                                    </div>
                                    {error && (
                                        <p className="text-red-600 text-sm mt-2 text-left">{error}</p>
                                    )}
                                </form>

                                {/* Logo cloud directement sous l'input */}
                                <div className="mt-10">
                                    <LogoCloud />
                                </div>

                                <div
                                    aria-hidden
                                    className="bg-radial from-primary/50 dark:from-primary/25 relative mx-auto mt-8 max-w-3xl to-transparent to-55% text-left">
                                    <div className="bg-background border-border/50 absolute inset-0 mx-auto w-[28rem] -translate-x-3 -translate-y-12 rounded-[2rem] border p-2 [mask-image:linear-gradient(to_bottom,#000_50%,transparent_90%)] sm:-translate-x-6">
                                        <div className="relative h-[26rem] overflow-hidden rounded-[1.5rem] border p-2 pb-12 before:absolute before:inset-0 before:bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_6px)] before:opacity-50"></div>
                                    </div>
                                    <div className="bg-muted dark:bg-background/50 border-border/50 mx-auto w-[28rem] translate-x-6 rounded-[2rem] border p-2 backdrop-blur-3xl [mask-image:linear-gradient(to_bottom,#000_50%,transparent_90%)] sm:translate-x-8">
                                        <div className="bg-background space-y-2 overflow-hidden rounded-[1.5rem] border p-2 shadow-xl dark:bg-white/5 dark:shadow-black dark:backdrop-blur-3xl">
                                            <AppComponent />

                                            <div className="bg-muted rounded-[1rem] p-4 pb-16 dark:bg-white/5"></div>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] mix-blend-overlay [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:opacity-5"></div>
                                </div>
                            </AnimatedGroup>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}

const AppComponent = () => {
    return (
        <div className="relative rounded-[1rem] bg-white/5 p-4 overflow-hidden">
            <img 
                src="/homepage/example-analysis.jpg" 
                alt="Example analysis interface showing performance metrics for Hugging Face website"
                className="w-full h-auto rounded-lg object-cover"
            />
        </div>
    )
}
