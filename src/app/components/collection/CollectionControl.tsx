import {
  Button,
  ButtonGroup,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react'
import { ChevronDown } from 'lucide-react'
import React from 'react'

type CollectionOption = 'all' | 'today' | 'week'

interface CollectionControlProps {
  apiId: number
  initialOption: CollectionOption
  onStartCollection: (apiId: number, option: CollectionOption) => void
  isDisabled: boolean
}

const CollectionControl: React.FC<CollectionControlProps> = ({
  apiId,
  initialOption,
  onStartCollection,
  isDisabled,
}) => {
  const [selectedOption, setSelectedOption] =
    React.useState<CollectionOption>(initialOption)

  const optionsMap: Record<CollectionOption, string> = {
    all: '采集全部',
    today: '采集今日',
    week: '采集一周',
  }

  const handleSelectionChange = (option: CollectionOption) => {
    setSelectedOption(option)
  }

  return (
    <ButtonGroup variant="flat">
      <Button
        color="primary"
        onClick={() => onStartCollection(apiId, selectedOption)}
        isDisabled={isDisabled}
      >
        {optionsMap[selectedOption]}
      </Button>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button color="primary" isIconOnly>
            <ChevronDown />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="采集选项"
          selectedKeys={[selectedOption]}
          className="max-w-[300px]"
        >
          {Object.keys(optionsMap).map((key) => (
            <DropdownItem
              key={key}
              onClick={() => handleSelectionChange(key as CollectionOption)}
            >
              {optionsMap[key as CollectionOption]}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </ButtonGroup>
  )
}

export default CollectionControl
