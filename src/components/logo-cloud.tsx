import { InfiniteSlider } from '@/components/motion-primitives/infinite-slider'
import { ProgressiveBlur } from '@/components/motion-primitives/progressive-blur'

export const LogoCloud = () => {
    return (
        <section className="bg-background pb-6 md:pb-8">
            <div className="group relative m-auto max-w-6xl px-6">
                <div className="flex flex-col items-start md:flex-row md:items-center">
                    <div className="w-full md:max-w-44 md:border-r md:pr-6">
                        <p className="text-center md:text-end text-base md:text-sm font-medium">Get listed on</p>
                    </div>
                    <div className="relative pt-6 pb-4 md:pb-6 md:w-[calc(100%-11rem)]">
                        <InfiniteSlider
                            speedOnHover={20}
                            speed={40}
                            gap={112}>
                            <div className="flex md:justify-center"><img className="mx-0 md:mx-auto h-5 w-auto dark:invert" src="/homepage/chatgpt-logo.png" alt="ChatGPT Logo" height="20" width="auto" /></div>
                            <div className="flex md:justify-center"><img className="mx-0 md:mx-auto h-5 w-auto dark:invert" src="/homepage/claude-logo.png" alt="Claude Logo" height="20" width="auto" /></div>
                            <div className="flex md:justify-center"><img className="mx-0 md:mx-auto h-5 w-auto dark:invert" src="/homepage/perplexity-logo.png" alt="Perplexity Logo" height="20" width="auto" /></div>
                            <div className="flex md:justify-center"><img className="mx-0 md:mx-auto h-5 w-auto dark:invert" src="/homepage/gemini-logo.png" alt="Gemini Logo" height="20" width="auto" /></div>
                            <div className="flex md:justify-center"><img className="mx-0 md:mx-auto h-5 w-auto dark:invert" src="/homepage/copilot-logo.png" alt="Copilot Logo" height="20" width="auto" /></div>
                            <div className="flex md:justify-center"><img className="mx-0 md:mx-auto h-5 w-auto dark:invert" src="/homepage/deepseek-logo.png" alt="DeepSeek Logo" height="20" width="auto" /></div>
                        </InfiniteSlider>

                        <div className="bg-linear-to-r from-background absolute inset-y-0 left-0 w-20"></div>
                        <div className="bg-linear-to-l from-background absolute inset-y-0 right-0 w-20"></div>
                        <ProgressiveBlur
                            className="pointer-events-none absolute left-0 top-0 h-full w-20"
                            direction="left"
                            blurIntensity={1}
                        />
                        <ProgressiveBlur
                            className="pointer-events-none absolute right-0 top-0 h-full w-20"
                            direction="right"
                            blurIntensity={1}
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
