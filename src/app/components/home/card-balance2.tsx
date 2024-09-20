import { Card, CardBody } from '@nextui-org/react'
import { Community } from '../icons/community'

export const CardBalance2 = () => {
  return (
    <Card className="w-full rounded-xl bg-default-50 px-3 shadow-md xl:max-w-sm">
      <CardBody className="py-5">
        <div className="flex gap-2.5">
          <Community />
          <div className="flex flex-col">
            <span className="text-default-900">Health Insurance</span>
            <span className="text-xs text-default-900">+2400 People</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 py-2">
          <span className="text-xl font-semibold text-default-900">
            $12,138
          </span>
          <span className="text-xs text-danger">- 4.5%</span>
        </div>
        <div className="flex items-center gap-6">
          <div>
            <div>
              <span className="text-xs font-semibold text-success-600">↓</span>
              <span className="text-xs">11,930</span>
            </div>
            <span className="text-xs text-default-900">USD</span>
          </div>

          <div>
            <div>
              <span className="text-xs font-semibold text-danger">↑</span>
              <span className="text-xs">54,120</span>
            </div>
            <span className="text-xs text-default-900">USD</span>
          </div>

          <div>
            <div>
              <span className="text-xs font-semibold text-danger">⭐</span>
              <span className="text-xs">150</span>
            </div>
            <span className="text-xs text-default-900">VIP</span>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
