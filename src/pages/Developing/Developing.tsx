/**
 * @Author: bin
 * @Date: 2025-06-09 10:10:06
 * @LastEditors: bin
 * @LastEditTime: 2026-02-11 16:31:53
 */
import { useEffect } from 'react'

import { message, Button } from 'antd'

const Developing: React.FC = () => {

    useEffect(() => {
        message.info('Developing')
    }, [])

    return (
        <Button onClick={() => message.info('Developing')}>
            Developing
        </Button>
    )
}

export default Developing
