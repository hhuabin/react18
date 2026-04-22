import { useState, useEffect } from 'react'

import Picker, {
    SinglePicker,
    type PickerOption,
    type PickerColumn,
    type PickerConfirmEventParams,
} from '@/components/mobile/Picker'
import type {
    PickerOption as SinglePickerOption,
    PickerConfirmEventParams as SinglePickerConfirmEventParams,
} from '@/components/mobile/Picker/SinglePicker'

import {
    singlePickerColumns1,
    singlePickerColumns2,
    pickerColumns11,
    pickerColumns12,
    pickerColumns21,
    pickerColumns22,
    pickerColumns31,
    pickerColumns32,
} from './columns'

const PickerComponent: React.FC = () => {

    const [singlePickerValue, setSinglePickerValue] = useState('')
    const [singlePickerVisible, setSinglePickerVisible] = useState(false)

    const [pickerValue1, setPickerValue1] = useState('')
    const [pickerVisible1, setPickerVisible1] = useState(false)
    const [pickerColumns1, setPickerColumns1] = useState(pickerColumns11)

    const [pickerValue2, setPickerValue2] = useState('')
    const [pickerVisible2, setPickerVisible2] = useState(false)
    const [pickerColumns2, setPickerColumns2] = useState(pickerColumns21)

    const [pickerValue3, setPickerValue3] = useState('')
    const [pickerVisible3, setPickerVisible3] = useState(false)
    const [pickerColumns3, setPickerColumns3] = useState(pickerColumns31)

    const changeSinglePickerVisible = () => {
        setSinglePickerVisible(!singlePickerVisible)
    }
    const handleConfirmSinglePicker = ({ selectOption, selectValue }: SinglePickerConfirmEventParams) => {
        console.log('selectOption', selectOption)
        setSinglePickerValue(selectOption.value as string)
    }

    const changePickerVisible1 = () => {
        setPickerVisible1(!pickerVisible1)
    }
    const handleConfirmPicker1 = ({ selectedIndexs, selectedOptions, selectedValues }: PickerConfirmEventParams) => {
        console.log('selectedOptions', selectedIndexs, selectedOptions, selectedValues)
        const selectedValue = selectedValues.join(', ')
        setPickerValue1(selectedValue)
    }
    const changePickerColumns1 = () => {
        setPickerColumns1(pickerColumns12)
    }

    const changePickerVisible2 = () => {
        setPickerVisible2(!pickerVisible2)
    }
    const handleConfirmPicker2 = ({ selectedIndexs, selectedOptions, selectedValues }: PickerConfirmEventParams) => {
        console.log('selectedOptions', selectedIndexs, selectedOptions, selectedValues)
        const selectedValue = selectedValues.join(', ')
        setPickerValue2(selectedValue)
    }
    const changePickerColumns2 = () => {
        setPickerColumns2(pickerColumns22)
    }

    const changePickerVisible3 = () => {
        setPickerVisible3(!pickerVisible3)
    }
    const handleConfirmPicker3 = ({ selectedIndexs, selectedOptions, selectedValues }: PickerConfirmEventParams) => {
        console.log('selectedOptions', selectedIndexs, selectedOptions, selectedValues)
        const selectedValue = selectedValues.join(', ')
        setPickerValue3(selectedValue)
    }
    const changePickerColumns3 = () => {
        setPickerColumns3(pickerColumns32)
    }

    /* useEffect(() => {
        setTimeout(() => {
            changePickerColumns3()
        }, 3000)
    }, []) */

    return (
        <>
            <div className='w-full min-h-screen bg-[var(--bg-layout)]'>
                <div className='w-full p-6 text-[var(--text-primary)] text-[16px]'>MobilePicker单列选择器</div>
                <ul role='list' className='w-[43.875rem] mx-auto rounded-[1rem] bg-[var(--bg-container)] text-[var(--text-primary)] text-[2rem] leading-10'>
                    <li className='relative w-full after:content-[""] after:absolute after:right-0 after:bottom-0 after:w-[42rem] after:h-px
                        after:bg-[var(--border-light)] after:scale-y-50 last:after:hidden hover:bg-[var(--item-hover)]'
                    >
                        <button
                            type='button'
                            className='flex justify-between w-full min-h-[5.5rem] py-6 px-unit30 box-border text-left overflow-hidden active:bg-[var(--item-active)]'
                            onClick={() => changeSinglePickerVisible()}
                        >
                            <div className='flex-none min-w-64 mr-10'>MobilePicker</div>
                            <div className='flex justify-between items-center w-full min-h-10 text-[var(--text-primary)]'
                            >
                                <div className='w-full h-full text-[#999] break-all'>{ singlePickerValue || '单列选择器' }</div>
                                <div className='flex-none w-8 h-8 ml-[0.75rem]'>
                                    <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                                        <polyline points='35,20 65,50 35,80' fill='none' stroke='var(--fill-default)' strokeWidth='8' strokeLinecap='round'>
                                        </polyline>
                                    </svg>
                                </div>
                            </div>
                        </button>
                    </li>
                </ul>

                <div className='w-full p-6 text-[var(--text-primary)] text-[16px]'>单列选择器</div>
                <ul role='list' className='w-[43.875rem] mx-auto rounded-[1rem] bg-[var(--bg-container)] text-[var(--text-primary)] text-[2rem] leading-10'>
                    <li className='relative w-full after:content-[""] after:absolute after:right-0 after:bottom-0 after:w-[42rem] after:h-px
                        after:bg-[var(--border-light)] after:scale-y-50 last:after:hidden hover:bg-[var(--item-hover)]'
                    >
                        <button
                            type='button'
                            className='flex justify-between w-full min-h-[5.5rem] py-6 px-unit30 box-border text-left overflow-hidden active:bg-[var(--item-active)]'
                            onClick={() => changePickerVisible1()}
                        >
                            <div className='flex-none min-w-64 mr-10'>Picker</div>
                            <div className='flex justify-between items-center w-full min-h-10 text-[var(--text-primary)]'
                            >
                                <div className='w-full h-full text-[#999] break-all'>{ pickerValue1 || '单列选择器' }</div>
                                <div className='flex-none w-8 h-8 ml-[0.75rem]'>
                                    <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                                        <polyline points='35,20 65,50 35,80' fill='none' stroke='var(--fill-default)' strokeWidth='8' strokeLinecap='round'>
                                        </polyline>
                                    </svg>
                                </div>
                            </div>
                        </button>
                    </li>
                </ul>

                <div className='w-full p-6 text-[var(--text-primary)] text-[16px]'>多列选择器</div>
                <ul role='list' className='w-[43.875rem] mx-auto rounded-[1rem] bg-[var(--bg-container)] text-[var(--text-primary)] text-[2rem] leading-10'>
                    <li className='relative w-full after:content-[""] after:absolute after:right-0 after:bottom-0 after:w-[42rem] after:h-px
                        after:bg-[var(--border-light)] after:scale-y-50 last:after:hidden hover:bg-[var(--item-hover)]'
                    >
                        <button
                            type='button'
                            className='flex justify-between w-full min-h-[5.5rem] py-6 px-unit30 box-border text-left overflow-hidden active:bg-[var(--item-active)]'
                            onClick={() => changePickerVisible2()}
                        >
                            <div className='flex-none min-w-64 mr-10'>Picker</div>
                            <div className='flex justify-between items-center w-full min-h-10 text-[var(--text-primary)]'
                            >
                                <div className='w-full h-full text-[#999] break-all'>{ pickerValue2 || '多列选择器' }</div>
                                <div className='flex-none w-8 h-8 ml-[0.75rem]'>
                                    <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                                        <polyline points='35,20 65,50 35,80' fill='none' stroke='var(--fill-default)' strokeWidth='8' strokeLinecap='round'>
                                        </polyline>
                                    </svg>
                                </div>
                            </div>
                        </button>
                    </li>
                </ul>

                <div className='w-full p-6 text-[var(--text-primary)] text-[16px]'>级联选择器</div>
                <ul role='list' className='w-[43.875rem] mx-auto rounded-[1rem] bg-[var(--bg-container)] text-[var(--text-primary)] text-[2rem] leading-10'>
                    <li className='relative w-full after:content-[""] after:absolute after:right-0 after:bottom-0 after:w-[42rem] after:h-px
                        after:bg-[var(--border-light)] after:scale-y-50 last:after:hidden hover:bg-[var(--item-hover)]'
                    >
                        <button
                            type='button'
                            className='flex justify-between w-full min-h-[5.5rem] py-6 px-unit30 box-border text-left overflow-hidden active:bg-[var(--item-active)]'
                            onClick={() => changePickerVisible3()}
                        >
                            <div className='flex-none min-w-64 mr-10'>Picker</div>
                            <div className='flex justify-between items-center w-full min-h-10 text-[var(--text-primary)]'
                            >
                                <div className='w-full h-full text-[#999] break-all'>{ pickerValue3 || '级联选择器' }</div>
                                <div className='flex-none w-8 h-8 ml-[0.75rem]'>
                                    <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                                        <polyline points='35,20 65,50 35,80' fill='none' stroke='var(--fill-default)' strokeWidth='8' strokeLinecap='round'>
                                        </polyline>
                                    </svg>
                                </div>
                            </div>
                        </button>
                    </li>
                </ul>

                <div className='flex w-full justify-center my-8'>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--border-default)] rounded-md text-[16px] bg-[var(--bg-container)] select-none
                            text-[var(--text-primary)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => changePickerColumns1()}
                    >
                        <span>点击改变单列数据</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--border-default)] rounded-md text-[16px] bg-[var(--bg-container)] select-none
                            text-[var(--text-primary)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => changePickerColumns2()}
                    >
                        <span>点击改变多列数据</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--border-default)] rounded-md text-[16px] bg-[var(--bg-container)] select-none
                            text-[var(--text-primary)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => changePickerColumns3()}
                    >
                        <span>点击改变级联数据</span>
                    </button>
                </div>
            </div>
            <SinglePicker
                visible={singlePickerVisible}
                defaultIndex={2}
                loading={true}
                onChangeVisible={(value) => setSinglePickerVisible(value)}
                columns={singlePickerColumns2}
                onConfirm={handleConfirmSinglePicker}
                onCancel={() => setSinglePickerVisible(false)}
            ></SinglePicker>
            {/* 单列选择器 */}
            <Picker
                visible={pickerVisible1}
                onChangeVisible={(value) => setPickerVisible1(value)}
                defaultIndexs={[2]}
                columns={pickerColumns1}
                onConfirm={handleConfirmPicker1}
                onCancel={() => setPickerVisible1(false)}
            ></Picker>
            {/* 多列选择器 */}
            <Picker
                visible={pickerVisible2}
                onChangeVisible={(value) => setPickerVisible2(value)}
                defaultIndexs={[1, 2]}
                columns={pickerColumns2}
                onConfirm={handleConfirmPicker2}
                onCancel={() => setPickerVisible2(false)}
            ></Picker>
            {/* 级联选择器 */}
            <Picker
                visible={pickerVisible3}
                onChangeVisible={(value) => setPickerVisible3(value)}
                defaultIndexs={[0, 0, 0]}
                columns={pickerColumns3}
                columnsFieldNames={{ label: 'cityName' }}
                onConfirm={handleConfirmPicker3}
                onCancel={() => setPickerVisible3(false)}
            ></Picker>
        </>
    )
}

export default PickerComponent

