import { useState } from 'react'

import Modal from '@/components/Modal'
import { Modal as AntdModal } from 'antd'

const ModalComponents: React.FC = () => {

    const [visible, setVisible] = useState(false)
    const [antdVisiable, setAntdVisiable] = useState(false)

    return (
        <div>
            <div className='mt-[12px]'>
                <button
                    type='button'
                    className='px-[16px] border border-[var(--color-border)] rounded-md text-[16px] bg-[var(--primary-color)] select-none
                        text-[#FFF] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                    onClick={() => setVisible(!visible)}
                >
                    <span>open modal</span>
                </button>
                <button
                    type='button'
                    className='px-[16px] border border-[var(--color-border)] rounded-md text-[16px] bg-[var(--primary-color)] select-none
                        text-[#FFF] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                    onClick={() => setAntdVisiable(!antdVisiable)}
                >
                    <span>open antd modal</span>
                </button>
            </div>

            <AntdModal
                open={antdVisiable}
                onCancel={() => setAntdVisiable(false)}
            ></AntdModal>

            <Modal
                visible={visible}
                mask={true}
                title='提示'
                closable={true}
                onClose={() => setVisible(false)}
            >
                我是一个弹窗
            </Modal>
        </div>
    )
}

export default ModalComponents
