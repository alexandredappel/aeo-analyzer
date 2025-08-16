import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LiaSearchSolid, LiaSitemapSolid, LiaFileAltSolid, LiaUniversalAccessSolid, LiaBookReaderSolid, LiaFlaskSolid } from 'react-icons/lia'
import { ReactNode } from 'react'

export default function Features() {
    return (
        <section id="features" className="bg-background py-16 md:py-20 scroll-mt-24 md:scroll-mt-28">
            <div className="@container mx-auto max-w-5xl px-6">
                <div className="text-left md:text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl">Turn your website into an AI-cited source</h2>
                    <p className="mt-4 max-w-3xl mx-auto">
                        Forget theory, here’s how you make AI engines see you.
                        <br />
                        Run a full AI visibility audit of your site, checking how well LLMs like ChatGPT, Claude, and Gemini can find, understand, and quote your content.
                        <br />
                        <br />
                        You’ll see exactly what’s blocking you and get clear, prioritized actions to fix it.
                    </p>
                </div>
                <div className="@min-4xl:max-w-full @min-4xl:grid-cols-3 mx-auto mt-8 grid max-w-sm gap-6 md:mt-16 md:grid-cols-3">
                    <Card className="group shadow-zinc-950/5 bg-gradient-to-b from-surface to-primary/10">
                        <CardHeader className="pb-3 text-left md:text-center">
                            <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground mx-auto">
                                <LiaSearchSolid className="size-6" aria-hidden />
                            </div>
                            <CardTitle className="mt-6 text-left md:text-center">Discoverability</CardTitle>
                        </CardHeader>
                        <CardContent className="text-left md:text-center">
                            <p className="text-sm font-medium">Can AI engines find you?</p>
                            <p className="mt-2 text-sm">We assess crawlability, sitemaps, robots rules, internal links, and server responses so AI engines reliably find your pages, even with JavaScript rendering, redirects, or parameterized URLs creating crawl traps.</p>
                        </CardContent>
                    </Card>

                    <Card className="group shadow-zinc-950/5 bg-gradient-to-b from-surface to-primary/10">
                        <CardHeader className="pb-3 text-left md:text-center">
                            <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground mx-auto">
                                <LiaSitemapSolid className="size-6" aria-hidden />
                            </div>
                            <CardTitle className="mt-6 text-left md:text-center">Structured Data</CardTitle>
                        </CardHeader>
                        <CardContent className="text-left md:text-center">
                            <p className="text-sm font-medium">Is your schema complete and consistent?</p>
                            <p className="mt-2 text-sm">We validate schema presence, coverage, and correctness across entities, properties, and IDs, ensuring consistent JSON‑LD that lets AIs extract facts, build knowledge graphs, and confidently cite your pages.</p>
                        </CardContent>
                    </Card>

                    <Card className="group shadow-zinc-950/5 bg-gradient-to-b from-surface to-primary/10">
                        <CardHeader className="pb-3 text-left md:text-center">
                            <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground mx-auto">
                                <LiaFileAltSolid className="size-6" aria-hidden />
                            </div>
                            <CardTitle className="mt-6 text-left md:text-center">LLM Formatting</CardTitle>
                        </CardHeader>
                        <CardContent className="text-left md:text-center">
                            <p className="text-sm font-medium">Is your content ready to be cited?</p>
                            <p className="mt-2 text-sm">We evaluate hierarchy, headings, summaries, and semantically rich blocks that LLMs can quote. Clear sections, lists, and context reduce hallucinations and increase inclusion in AI answers with citations.</p>
                        </CardContent>
                    </Card>

                    <Card className="group shadow-zinc-950/5 bg-gradient-to-b from-surface to-primary/10">
                        <CardHeader className="pb-3 text-left md:text-center">
                            <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground mx-auto">
                                <LiaUniversalAccessSolid className="size-6" aria-hidden />
                            </div>
                            <CardTitle className="mt-6 text-left md:text-center">Accessibility</CardTitle>
                        </CardHeader>
                        <CardContent className="text-left md:text-center">
                            <p className="text-sm font-medium">Can every crawler and user access it?</p>
                            <p className="mt-2 text-sm">We audit semantics, ARIA, contrast, keyboard support, and performance so every user and crawler can access content. Clean DOM, meaningful links, and robust navigation improve indexing and AI understanding.</p>
                        </CardContent>
                    </Card>

                    <Card className="group shadow-zinc-950/5 bg-gradient-to-b from-surface to-primary/10">
                        <CardHeader className="pb-3 text-left md:text-center">
                            <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground mx-auto">
                                <LiaBookReaderSolid className="size-6" aria-hidden />
                            </div>
                            <CardTitle className="mt-6 text-left md:text-center">Readability</CardTitle>
                        </CardHeader>
                        <CardContent className="text-left md:text-center">
                            <p className="text-sm font-medium">Is it concise, clear, and modular?</p>
                            <p className="mt-2 text-sm">We measure clarity, sentence length, vocabulary, and structure. Concise, modular copy with plain language and consistent terminology helps AIs parse intent, extract key points, and present scannable answers.</p>
                        </CardContent>
                    </Card>

                    <Card className="group shadow-zinc-950/5 bg-gradient-to-b from-surface to-primary/10">
                        <CardHeader className="pb-3 text-left md:text-center">
                            <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground mx-auto">
                                <LiaFlaskSolid className="size-6" aria-hidden />
                            </div>
                            <CardTitle className="mt-6 text-left md:text-center">Labs & Future Standards</CardTitle>
                        </CardHeader>
                        <CardContent className="text-left md:text-center">
                            <p className="text-sm font-medium">Is your page ready for future standards?</p>
                            <p className="mt-2 text-sm">We test emerging patterns: AI‑readable feeds, structured snippets, provenance signals, and RAG‑friendly formats. Early adoption prepares pages for evolving LLM ecosystems and upcoming web standards.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}
