import { useState, useRef } from 'react'

import styles from './TextareaInput.module.less'

const TextareaInput: React.FC = () => {

    const [inputText, setInputText] = useState('')
    const inputRef = useRef<HTMLTextAreaElement>(null)

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

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!inputRef.current) return

        setInputText(e.target.value)

        inputRef.current.style.height = 'auto'
        inputRef.current.style.height = inputRef.current.scrollHeight + 'px'
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
        <div className={styles['textarea-input'] + ' relative flex flex-col w-full border border-[var(--border-default)] rounded-3xl bg-[var(--bg-container)] [box-shadow:var(--shadow-md)] overflow-hidden'}>
            <div className='relative'>
                <textarea
                    ref={inputRef}
                    name='search'
                    className={styles['textarea']}
                    rows={2}
                    value={inputText}
                    onChange={(e) => handleInput(e)}
                    placeholder="询问任何问题"
                    disabled={isLoading}
                    onKeyDown={(event) => handleKeyDown(event)}
                />
            </div>

            <div className='w-full py-3'>
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
    )
}

export default TextareaInput
