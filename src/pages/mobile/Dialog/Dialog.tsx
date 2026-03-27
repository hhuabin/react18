import { useState, useEffect } from 'react'

import { Dialog } from '@/components/mobile'
import { Dialog as DialogMobile } from 'antd-mobile'

const DialogComponent: React.FC = () => {

    const [dialogVisiable, setDialogVisiable] = useState(false)

    return (
        <>
            <div className='w-full mb-5'>
                <div className='w-full p-4 text-[16px] leading-[24px]'>组件式调用</div>
                <div className='w-full px-4'>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => setDialogVisiable(!dialogVisiable)}
                    >
                        <span>open dialog</span>
                    </button>
                </div>
            </div>

            <div className='w-full mb-5'>
                <div className='w-full p-4 text-[16px] leading-[24px]'>DialogMobile</div>
                <div className='w-full px-4'>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => DialogMobile.confirm({
                            content: 'DialogMobile',
                        })}
                    >
                        <span>open dialog mobile</span>
                    </button>
                </div>
            </div>

            <Dialog
                visible={dialogVisiable}
            ></Dialog>
        </>
    )
}

export default DialogComponent
