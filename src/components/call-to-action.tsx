import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trackAnalysisStart } from '@/utils/analytics'
import { LiaLinkSolid } from 'react-icons/lia'
import { Badge } from '@/components/ui/badge'
import { normalizeAndValidate } from '@/utils/url'

export default function CallToAction() {
    const router = useRouter()
    const [url, setUrl] = useState('')
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const value = url.trim()
        const normalized = normalizeAndValidate(value)
        if (!normalized) {
            setError('Please enter a valid URL')
            return
        }
        setError(null)
        trackAnalysisStart(normalized)
        router.push(`/report?url=${encodeURIComponent(normalized)}`)
    }

    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl">Take action now and lead tomorrow</h2>
                    <p className="mt-4">In a year, Generative Engine Optimization will be as essential as SEO. Today, it’s your unfair advantage.</p>

                    <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-2xl md:max-w-3xl lg:mt-12">
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
                                <Button aria-label="submit" size="lg" className="rounded-[calc(var(--radius)+0.5rem)] h-14 md:h-16 px-6 md:px-8 text-base md:text-lg">
                                    <span>Analyze</span>
                                </Button>
                            </div>
                        </div>
                        {error && <p className="text-red-600 text-sm mt-2 text-left">{error}</p>}
                        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                            <Badge className="bg-[#0068c9]/10 text-[#00296b] border-transparent px-3 py-1 text-sm">Instant results</Badge>
                            <Badge className="bg-[#0068c9]/10 text-[#00296b] border-transparent px-3 py-1 text-sm">No sign-up</Badge>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    )
}
