/**
 * @Author: bin
 * @Date: 2025-06-09 10:10:06
 * @LastEditors: bin
 * @LastEditTime: 2026-04-08 17:47:09
 */
import { useEffect } from 'react'

import { message, Button } from 'antd'

const Developing: React.FC = () => {

    useEffect(() => {
        message.info('Developing')
    }, [])

    return (
        <Button onClick={() => message.info('Developing', 0)}>
            Developing
        </Button>
    )
}

export default Developing
