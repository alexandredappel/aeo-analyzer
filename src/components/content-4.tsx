import React from 'react'

export default function ContentSection() {
    return (
        <section className="py-16 md:py-20">
            <div className="mx-auto max-w-5xl px-6">
                <div className="grid gap-6 md:grid-cols-2 md:gap-12">
                    <h2 className="text-4xl font-semibold lg:text-5xl">Search behavior has already changed</h2>
                    <div className="space-y-6">
                        <p>
                            Ask yourself: when you need quick answers, do you go to Google first or do you ask ChatGPT, Perplexity or Gemini?
                        </p>
                        <div className="space-y-4">
                            <p>Your customers, or your clients’ customers, now:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Start with conversational AI for speed and clarity</li>
                                <li>Trust answers that cite credible, structured sources</li>
                                <li>Rarely click through to results that AIs don’t surface</li>
                            </ul>
                        </div>
                        <p className="font-semibold">
                            If your pages aren’t visible and understandable by LLMs, you’re simply not part of the conversation.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
