import { useState, useRef, useEffect } from 'react'

import MessageList from './components/MessageList'
import TextareaInput from './components/TextareaInput'

const FetchStreamResponse: React.FC = () => {

    const [answer, setAnswer] = useState({
        id: '0',
        content: 'welcome',
        time: Date.now() + '',
    })

    return (
        <div className='flex w-full h-full'>
            <div className='flex-none w-[260px] bg-[transparent] [box-shadow:var(--shadow-md)] hidden lg:block'>
                <div className='w-full h-full bg-[var(--bg-container)]'></div>
            </div>

            <div className='flex justify-center flex-col w-full h-full p-4 box-border'>
                <MessageList messageItem={answer}></MessageList>

                <TextareaInput></TextareaInput>
            </div>
        </div>
    )
}

export default FetchStreamResponse
