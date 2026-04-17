import { useEffect, useState, useCallback, memo } from 'react'

import { useDebounce } from '@/hooks/utils/useDebounceThrottle'

type MessageItem = {
    id: string;
    content: string;
    time: string;
}
type Props = {
    messageItem: MessageItem
}

const MessageList: React.FC<Props> = memo(({ messageItem }: Props) => {

    const [messageQueue, setMessageQueue] = useState<MessageItem[]>([{
        id: '0',
        content: 'welcome',
        time: Date.now() + '',
    }])

    useEffect(() => {
        // TODO 找到对应的 messageId，修改消息的值
        for (let i = messageQueue.length - 1; i >= 0; i--) {
            if (messageQueue[i].id === messageItem.id) {
                messageQueue[i] = messageItem
                break
            }
        }
        changeMessageQueue([...messageQueue])
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messageItem])

    const [changeMessageQueue] = useDebounce((messageQueue: MessageItem[]) => {
        setMessageQueue(messageQueue)
    }, 500)

    // TODO 渲染消息队列，有需要可以做模拟滚动
    if (!!messageQueue.length) {
        return (
            <div className='flex-auto w-full min-h-8 p-2 mb-4'>
                MessageList
            </div>
        )
    } else {
        return (
            <h2 className='w-full py-4 text-[2rem] text-center font-bold'>DeepSeek 流式问答演示</h2>
        )
    }
}, (prevProps, newProps) => prevProps === newProps)

export default MessageList
