import { useEffect } from 'react'

import message from '@/components/Message'

import { axiosBasePost, axiosBaseGet } from '@/api/axios'
import { fetchBasePost } from '@/api/fetch'

const Request: React.FC = () => {

    const handlePost = () => {
        axiosBasePost({
            userId: '123',
        }).then((res) => {
            console.log(res)
        }).catch((err) => {
            message.error(err.data?.message)
        })
    }

    const handleGet = () => {
        axiosBaseGet({
            userId: '123',
        }).then((res) => {
            console.log(res)
        }).catch((err) => {
            message.error(err.data?.message)
        })
    }

    const handleFetch = () => {
        fetchBasePost({
            userId: '123',
        }).then((res) => {
            console.log(res)
        }).catch((err) => {
            message.error(err.data?.message)
        })
    }

    const handleShowLoadingPost = () => {
        axiosBasePost({
            userId: '123',
            showLoading: true,
        }).then((res) => {
            console.log(res)
        }).catch((err) => {
            message.error(err.data?.message)
        })
    }

    const handleShowLoadingGet = () => {
        axiosBaseGet({
            userId: '123',
            showLoading: true,
        }).then((res) => {
            console.log(res)
        }).catch((err) => {
            message.error(err.data?.message)
        })
    }

    const handleShowLoadingFetch = () => {
        fetchBasePost({
            userId: '123',
            showLoading: true,
        }).then((res) => {
            console.log(res)
        }).catch((err) => {
            message.error(err.data?.message)
        })
    }

    const handleCancelLastPost = () => {
        axiosBasePost({
            userId: '123',
            showLoading: true,
            cancelLastRequest: true,
        }).then((res) => {
            console.log(res)
        }).catch((err) => {
            message.error(err.data?.message)
        })
    }

    const handleCancelLastGet = () => {
        axiosBaseGet({
            userId: '123',
            showLoading: true,
            cancelLastRequest: true,
        }).then((res) => {
            console.log(res)
        }).catch((err) => {
            message.error(err.data?.message)
        })
    }

    const handleCancelLastFetch = () => {
        fetchBasePost({
            userId: '123',
            showLoading: true,
            cancelLastRequest: true,
        }).then((res) => {
            console.log(res)
        }).catch((err) => {
            message.error(err.data?.message)
        })
    }

    const handleRetryPost = () => {
        axiosBasePost({
            userId: '123',
            showLoading: true,
            maxRequestRetryNumber: 3,
        }).then((res) => {
            console.log(res)
        }).catch((err) => {
            message.error(err.data?.message)
        })
    }

    const handleRetryGet = () => {
        axiosBaseGet({
            userId: '123',
            showLoading: true,
            maxRequestRetryNumber: 3,
        }).then((res) => {
            console.log(res)
        }).catch((err) => {
            message.error(err.data?.message)
        })
    }

    const handleRetryFetch = () => {
        fetchBasePost({
            userId: '123',
            showLoading: true,
            maxRequestRetryNumber: 3,
        }).then((res) => {
            console.log(res)
        }).catch((err) => {
            message.error(err.data?.message)
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
                        <span>axiosBasePost</span>
                    </button>

                    <button
                        type='button'
                        className='px-[16px] border border-[var(--border-default)] rounded-md m-2 text-[16px] bg-[var(--bg-container)] select-none
                            text-[var(--text-primary)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => handleGet()}
                    >
                        <span>axiosBaseGet</span>
                    </button>

                    <button
                        type='button'
                        className='px-[16px] border border-[var(--border-default)] rounded-md m-2 text-[16px] bg-[var(--bg-container)] select-none
                            text-[var(--text-primary)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => handleFetch()}
                    >
                        <span>fetchBasePost</span>
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
