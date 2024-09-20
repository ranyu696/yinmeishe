'use client'

import { Button, ButtonGroup } from '@nextui-org/react'
import parse from 'html-react-parser'
import React, { useState } from 'react'

interface ChapterContentProps {
  content: string
}

const ChapterContent: React.FC<ChapterContentProps> = ({ content }) => {
  const [fontSize, setFontSize] = useState('medium')

  const fontSizeClass = {
    small: 'text-base',
    medium: 'text-lg',
    large: 'text-xl',
  }[fontSize]

  return (
    <>
      <div className="mb-4">
        <ButtonGroup>
          <Button onClick={() => setFontSize('small')}>小</Button>
          <Button onClick={() => setFontSize('medium')}>中</Button>
          <Button onClick={() => setFontSize('large')}>大</Button>
        </ButtonGroup>
      </div>
      <div
        className={`prose mb-8 max-w-none text-pretty indent-8 leading-loose tracking-widest ${fontSizeClass}`}
      >
        {parse(content)}
      </div>
    </>
  )
}

export default ChapterContent
