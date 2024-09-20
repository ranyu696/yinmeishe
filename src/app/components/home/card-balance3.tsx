import { Card, CardBody } from '@nextui-org/react'
import { Community } from '../icons/community'

export const CardBalance3 = () => {
  return (
    <Card className="w-full rounded-xl bg-success px-3 shadow-md xl:max-w-sm">
      <CardBody className="py-5">
        <div className="flex gap-2.5">
          <Community />
          <div className="flex flex-col">
            <span className="text-white">Card Insurance</span>
            <span className="text-xs text-white">1311 Cars</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 py-2">
          <span className="text-xl font-semibold text-white">$3,910</span>
          <span className="text-xs text-danger">- 4.5%</span>
        </div>
        <div className="flex items-center gap-6">
          <div>
            <div>
              <span className="text-xs font-semibold text-danger">↓</span>
              <span className="text-xs">100,930</span>
            </div>
            <span className="text-xs text-white">USD</span>
          </div>

          <div>
            <div>
              <span className="text-xs font-semibold text-danger">↑</span>
              <span className="text-xs">4,120</span>
            </div>
            <span className="text-xs text-white">USD</span>
          </div>

          <div>
            <div>
              <span className="text-xs font-semibold text-danger">⭐</span>
              <span className="text-xs">125</span>
            </div>
            <span className="text-xs text-white">VIP</span>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
