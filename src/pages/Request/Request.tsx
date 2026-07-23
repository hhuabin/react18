import { useEffect } from 'react'

import message from '@/components/Message'

import { basePost, baseGet } from '@/api/axios'
import { baseFetch } from '@/api/fetch'

const Request: React.FC = () => {

    const handlePost = () => {
        basePost({
            userId: '123',
        }).then((res) => {
            console.log(res)
        }).catch((err) => {
            message.error(err.data?.err_msg)
        })
    }

    const handleGet = () => {
        baseGet({
            userId: '123',
        }).then((res) => {
            console.log(res)
        }).catch((err) => {
            message.error(err.data?.err_msg)
        })
    }

    const handleFetch = () => {
        baseFetch({
            userId: '123',
        }).then((res) => {
            console.log(res)
        }).catch((err) => {
            message.error(err.data?.err_msg)
        })
    }

    const handleShowLoadingPost = () => {
        basePost({
            userId: '123',
            showLoading: true,
        }).then((res) => {
            console.log(res)
        }).catch((err) => {
            message.error(err.data?.err_msg)
        })
    }

    const handleShowLoadingGet = () => {
        baseGet({
            userId: '123',
            showLoading: true,
        }).then((res) => {
            console.log(res)
        }).catch((err) => {
            message.error(err.data?.err_msg)
        })
    }

    const handleShowLoadingFetch = () => {
        baseFetch({
            userId: '123',
            showLoading: true,
        }).then((res) => {
            console.log(res)
        }).catch((err) => {
            message.error(err.data?.err_msg)
        })
    }

    const handleCancelLastPost = () => {
        basePost({
            userId: '123',
            showLoading: true,
            cancelLastRequest: true,
        }).then((res) => {
            console.log(res)
        }).catch((err) => {
            message.error(err.data?.err_msg)
        })
    }

    const handleCancelLastGet = () => {
        baseGet({
            userId: '123',
            showLoading: true,
            cancelLastRequest: true,
        }).then((res) => {
            console.log(res)
        }).catch((err) => {
            message.error(err.data?.err_msg)
        })
    }

    const handleCancelLastFetch = () => {
        baseFetch({
            userId: '123',
            showLoading: true,
            cancelLastRequest: true,
        }).then((res) => {
            console.log(res)
        }).catch((err) => {
            message.error(err.data?.err_msg)
        })
    }

    const handleRetryPost = () => {
        basePost({
            userId: '123',
            showLoading: true,
            maxRequestRetryNumber: 3,
        }).then((res) => {
            console.log(res)
        }).catch((err) => {
            message.error(err.data?.err_msg)
        })
    }

    const handleRetryGet = () => {
        baseGet({
            userId: '123',
            showLoading: true,
            maxRequestRetryNumber: 3,
        }).then((res) => {
            console.log(res)
        }).catch((err) => {
            message.error(err.data?.err_msg)
        })
    }

    const handleRetryFetch = () => {
        baseFetch({
            userId: '123',
            showLoading: true,
            maxRequestRetryNumber: 3,
        }).then((res) => {
            console.log(res)
        }).catch((err) => {
            message.error(err.data?.err_msg)
        })
    }

    return (
        <>
            <div className='w-full mb-5'>
                <div className='w-full p-4 text-[16px] leading-[24px]'>Base Request</div>
                <div className='w-full px-4'>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--border-default)] rounded-md m-2 text-[16px] bg-[var(--bg-container)] select-none
                            text-[var(--text-primary)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => handlePost()}
                    >
                        <span>BasePost</span>
                    </button>

                    <button
                        type='button'
                        className='px-[16px] border border-[var(--border-default)] rounded-md m-2 text-[16px] bg-[var(--bg-container)] select-none
                            text-[var(--text-primary)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => handleGet()}
                    >
                        <span>BaseGet</span>
                    </button>

                    <button
                        type='button'
                        className='px-[16px] border border-[var(--border-default)] rounded-md m-2 text-[16px] bg-[var(--bg-container)] select-none
                            text-[var(--text-primary)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => handleFetch()}
                    >
                        <span>BaseFetch</span>
                    </button>
                </div>
            </div>

            <div className='w-full mb-5'>
                <div className='w-full p-4 text-[16px] leading-[24px]'>Show Loading Request</div>
                <div className='w-full px-4'>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--border-default)] rounded-md m-2 text-[16px] bg-[var(--bg-container)] select-none
                            text-[var(--text-primary)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => handleShowLoadingPost()}
                    >
                        <span>LoadingPost</span>
                    </button>

                    <button
                        type='button'
                        className='px-[16px] border border-[var(--border-default)] rounded-md m-2 text-[16px] bg-[var(--bg-container)] select-none
                            text-[var(--text-primary)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => handleShowLoadingGet()}
                    >
                        <span>LoadingGet</span>
                    </button>

                    <button
                        type='button'
                        className='px-[16px] border border-[var(--border-default)] rounded-md m-2 text-[16px] bg-[var(--bg-container)] select-none
                            text-[var(--text-primary)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => handleShowLoadingFetch()}
                    >
                        <span>LoadingFetch</span>
                    </button>
                </div>
            </div>

            <div className='w-full mb-5'>
                <div className='w-full p-4 text-[16px] leading-[24px]'>Cancel Previous Request</div>
                <div className='w-full px-4'>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--border-default)] rounded-md m-2 text-[16px] bg-[var(--bg-container)] select-none
                            text-[var(--text-primary)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => handleCancelLastPost()}
                    >
                        <span>CancelPost</span>
                    </button>

                    <button
                        type='button'
                        className='px-[16px] border border-[var(--border-default)] rounded-md m-2 text-[16px] bg-[var(--bg-container)] select-none
                            text-[var(--text-primary)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => handleCancelLastGet()}
                    >
                        <span>CancelGet</span>
                    </button>

                    <button
                        type='button'
                        className='px-[16px] border border-[var(--border-default)] rounded-md m-2 text-[16px] bg-[var(--bg-container)] select-none
                            text-[var(--text-primary)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => handleCancelLastFetch()}
                    >
                        <span>CancelFetch</span>
                    </button>
                </div>
            </div>

            <div className='w-full mb-5'>
                <div className='w-full p-4 text-[16px] leading-[24px]'>Retry Request</div>
                <div className='w-full px-4'>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--border-default)] rounded-md m-2 text-[16px] bg-[var(--bg-container)] select-none
                            text-[var(--text-primary)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => handleRetryPost()}
                    >
                        <span>RetryPost</span>
                    </button>

                    <button
                        type='button'
                        className='px-[16px] border border-[var(--border-default)] rounded-md m-2 text-[16px] bg-[var(--bg-container)] select-none
                            text-[var(--text-primary)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => handleRetryGet()}
                    >
                        <span>RetryGet</span>
                    </button>

                    <button
                        type='button'
                        className='px-[16px] border border-[var(--border-default)] rounded-md m-2 text-[16px] bg-[var(--bg-container)] select-none
                            text-[var(--text-primary)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => handleRetryFetch()}
                    >
                        <span>RetryFetch</span>
                    </button>
                </div>
            </div>
        </>
    )
}

export default Request
