import { useEffect, useState } from 'react'

import MessageList from './components/MessageList'

const FetchStreamResponse: React.FC = () => {

    const [inputText, setInputText] = useState('')
    const [answer, setAnswer] = useState({
        id: '0',
        content: 'welcome',
        time: Date.now() + '',
    })
    const [isLoading, setIsLoading] = useState(false)

    const fetchOpenAIStream = async (prompt: string) => {
        setIsLoading(true)
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer cookie',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                stream: true, // 启用流式传输
            }),
        })

        const reader = response.body!.getReader()
        const decoder = new TextDecoder()
        let result = ''

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const { done, value } = await reader.read()
            if (done) {
                setIsLoading(false)
                break
            }
            const chunk = decoder.decode(value)
            const lines = chunk.split('\n').filter(line => line.trim() !== '')

            for (const line of lines) {
                if (line.startsWith('data:')) {
                    const data = line.replace('data: ', '')
                    if (data === '[DONE]') {
                        setIsLoading(false)
                        break
                    }
                    const json = JSON.parse(data)
                    const content = json.choices[0]?.delta?.content || ''
                    result += content
                    // setAnswer(result) // 更新 React 状态
                }
            }
        }
    }

    const sendRequest = () => {

    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // 监听回车键，当回车键和 Shift 一起按下则忽略
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()         // 阻止默认换行行为
            const inputValue = event.currentTarget.value
            // fetchOpenAIStream(inputValue)
        }
    }

    return (
        <div className='flex w-full h-full'>
            <div className='flex-none w-[260px] bg-[transparent] hidden lg:block'>
                <div className='w-full h-full bg-[var(--bg-container)]'></div>
            </div>

            <div className='flex justify-center flex-col w-full h-full p-4 box-border'>
                <MessageList messageItem={answer}></MessageList>

                <div className='relative flex flex-col w-full border border-[var(--border-default)] rounded-3xl bg-[var(--bg-container)] overflow-hidden'>
                    <div className='relative flex min-h-14 flex-auto pb-3 px-5 pt-4 items-start'>
                        <textarea
                            name='search'
                            className='block w-full min-h-8 h-auto outline-none resize-none text-[var(--text-primary)] bg-[transparent]'
                            rows={2}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="询问任何问题"
                            disabled={isLoading}
                            onKeyDown={(event) => handleKeyDown(event)}
                        />
                    </div>

                    <div className='w-full pb-3'>
                        <div className='flex justify-end mx-5 flex-auto'>
                            <button
                                type='button'
                                className='block w-9 h-9 rounded-full text-[1em] bg-[var(--color-primary)] select-none
                                    text-[var(--text-inverse)] leading-8 hover:border-[var(--item-hover)]'
                                onClick={() => sendRequest()}
                            >
                                <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                                    <line x1='50' y1='25' x2='50' y2='80' stroke='currentColor' strokeWidth='8' strokeLinecap='round' strokeLinejoin='round' />
                                    <polyline points='25,50 50,20 75,50' fill='none' stroke='currentColor' strokeWidth='8' strokeLinecap='round' strokeLinejoin='round'></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FetchStreamResponse
