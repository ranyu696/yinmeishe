import { Divider } from '@nextui-org/divider'
import { Image } from '@nextui-org/react'

interface Props {
  children: React.ReactNode
}

export const AuthLayoutWrapper = ({ children }: Props) => {
  return (
    <div className="flex h-screen">
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="absolute inset-0 z-0 md:hidden">
          <Image
            className="size-full"
            src="https://nextui.org/gradients/docs-right.png"
            alt="gradient"
          />
        </div>
        {children}
      </div>

      <div className="my-10 hidden md:block">
        <Divider orientation="vertical" />
      </div>

      <div className="relative hidden flex-1 items-center justify-center p-6 md:flex">
        <div className="absolute inset-0 z-0">
          <Image
            className="size-full"
            src="https://nextui.org/gradients/docs-right.png"
            alt="gradient"
          />
        </div>

        <div className="z-10">
          <h1 className="text-[45px] font-bold">NextUI Dashboard Template</h1>
          <div className="mt-4 font-light text-slate-400">
            几乎可以肯定享乐明智的承担责任驱逐宁愿憎恨价值这个疼痛的折磨跑了设计师曾经明确地生活了哪些事情
          </div>
        </div>
      </div>
    </div>
  )
}
