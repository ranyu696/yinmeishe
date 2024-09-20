import {
  Button,
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react'
import parse from 'html-react-parser'
import React from 'react'

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  content: string
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
}) => {
  return (
    <Modal size="xl" isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          <Card>
            <CardBody className="novel-content">{parse(content)}</CardBody>
          </Card>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={onClose}>
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default PreviewModal
