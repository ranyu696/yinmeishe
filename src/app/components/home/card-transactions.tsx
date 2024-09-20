import { Avatar, Card, CardBody } from '@nextui-org/react'

const items = [
  {
    name: 'Jose Perez',
    picture: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    amount: '4500 USD',
    date: '9/20/2021',
  },
  {
    name: 'Jose Perez',
    picture: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    amount: '4500 USD',
    date: '9/20/2021',
  },
  {
    name: 'Jose Perez',
    picture: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    amount: '4500 USD',
    date: '9/20/2021',
  },
  {
    name: 'Jose Perez',
    picture: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    amount: '4500 USD',
    date: '9/20/2021',
  },
  {
    name: 'Jose Perez',
    picture: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    amount: '4500 USD',
    date: '9/20/2021',
  },
]

export const CardTransactions = () => {
  return (
    <Card className=" rounded-xl bg-default-50 px-3 shadow-md">
      <CardBody className="gap-4 py-5">
        <div className="flex justify-center gap-2.5">
          <div className="flex flex-col rounded-xl border-2 border-dashed border-divider px-6 py-2">
            <span className="text-xl font-semibold text-default-900">
              Latest Transactions
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-6 ">
          {items.map((item) => (
            <div key={item.name} className="grid w-full grid-cols-4">
              <div className="w-full">
                <Avatar
                  isBordered
                  color="secondary"
                  src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
                />
              </div>

              <span className="font-semibold  text-default-900">
                {item.name}
              </span>
              <div>
                <span className="text-xs text-success">{item.amount}</span>
              </div>
              <div>
                <span className="text-xs text-default-500">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}
