import { LiaBanSolid } from 'react-icons/lia'
import Image from 'next/image'

export default function FeaturesSection() {
    return (
        <section id="about" className="py-16 md:py-20 scroll-mt-24 md:scroll-mt-28">
            <div className="mx-auto max-w-5xl px-6">
                <div className="grid items-center gap-12 md:grid-cols-2 md:gap-12 lg:grid-cols-2 lg:gap-24">
                    <div>
                        <div className="md:pr-6 lg:pr-0">
                            <h2 className="text-4xl font-semibold lg:text-5xl">Why ranking on Google isn’t enough anymore</h2>
                            <p className="mt-6">
                                Ranking on Google is no longer enough.
                                <br />
                                <br />
                                Without AI optimization, you face:
                                <br />
                                Conversational AIs now deliver full, instant answers — cutting clicks to websites and bypassing even high-ranking pages.
                            </p>
                        </div>
                        <ul className="mt-8 divide-y border-y *:flex *:items-center *:gap-3 *:py-3">
                            <li>
                                <LiaBanSolid className="size-5 flex-none" />
                                Falling organic traffic despite strong Google rankings
                            </li>
                            <li>
                                <LiaBanSolid className="size-5 flex-none" />
                                Content that AIs can’t parse, extract, or cite
                            </li>
                            <li>
                                <LiaBanSolid className="size-5 flex-none" />
                                Pages invisible to AI crawlers due to JavaScript-heavy builds
                            </li>
                            <li>
                                <LiaBanSolid className="size-5 flex-none" />
                                Missing structured data preventing AIs from understanding your content
                            </li>
                        </ul>
                        <p className="mt-6 font-semibold">
                            If your site isn’t built for LLMs, it’s invisible in a growing share of user searches.
                        </p>
                    </div>
                    <div className="border-border/50 relative rounded-3xl border p-3">
                        <div className="bg-linear-to-b relative overflow-hidden rounded-2xl from-zinc-300 to-transparent p-px dark:from-zinc-700">
                            <Image 
                                src="/homepage/data-analysis.jpg" 
                                alt="Data analysis visualization showing charts and metrics" 
                                width={600}
                                height={400}
                                className="rounded-[15px] object-cover w-full h-auto" 
                                sizes="(max-width: 1024px) 90vw, 600px" 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
