/**
 * @Author: bin
 * @Date: 2025-12-08 15:54:41
 * @LastEditors: bin
 * @LastEditTime: 2026-02-09 15:20:36
 */
// 定义节点结构
class TreeNode<T> {
    value: T
    left: TreeNode<T> | null
    right: TreeNode<T> | null
    constructor(
        value: T,
        left: TreeNode<T> | null = null,
        right: TreeNode<T> | null = null,
    ) {
        this.value = value
        this.left = left
        this.right = right
    }
}

/**
 * @description 广度优先创建二叉树，并返回根节点
 * @param arr 待处理数组
 * @returns 二叉树根节点
 * 该函数主要在`queue`中，queue按照数组顺序纳入节点到队列中
 * 在循环中从队列中取出第一个节点，给节点新增左子节点和右子节点，左子节点和右子节点push到队列中
 * 因为首个节点已经被弹出，左右子节点又排到了队列的靠前位置，如此往复循环遍历需要处理的数组到最后
 */
export const BFSCreateTreeNode = <T>(arr: (T | null)[]): TreeNode<T> | null => {
    if (arr.length === 0 || arr[0] === null) return null
    // 创建第一个节点队列，队列用于存储待处理的节点，同时新增后续的节点
    const root = new TreeNode(arr[0] as T)
    const queue: TreeNode<T>[] = [root]
    // console.log(queue)
    let i = 1

    while (i < arr.length && queue.length > 0) {
        // 删除并且获取数组第一个节点
        const currentNode = queue.shift()!

        // 添加左子节点
        if (i < arr.length && arr[i] !== null) {
            currentNode.left = new TreeNode(arr[i] as T)
            // 添加子节点到队列中，这样queue.length > 0
            queue.push(currentNode.left)
        }
        i++

        // 添加右子节点
        if (i < arr.length && arr[i] !== null) {
            currentNode.right = new TreeNode(arr[i] as T)
            // 添加子节点到队列中，这样queue.length > 0
            queue.push(currentNode.right)
        }
        i++
    }

    return root
}

/* // 创建出来的二叉树实例
TreeNode {
    value: 1,
    left: TreeNode {
        value: 2,
        left: TreeNode { value: 4, left: null, right: null },
        right: TreeNode { value: 5, left: null, right: null }
    },
    right: TreeNode {
        value: 3,
        left: TreeNode { value: 6, left: null, right: null },
        right: TreeNode { value: 7, left: null, right: null }
    }
} */

/**
 * @description 广度优先遍历二叉树
 * @param root 二叉树根节点
 * @returns 二叉树节点值数组
 * 该函数主要在`queue`中，`queue`先弹出首个节点，同时添加改节点的左右子节点到队列中，原来的左节点就会排在队列首位了
 * 最后在`queue`中就会按照广度优先顺序排列，result也会根据`queue`依次取值
 */
export const BFSTreeNode = <T>(root: TreeNode<T> | null): T[] => {
    if (!root) return []

    const result: T[] = []
    const queue: TreeNode<T>[] = [root]       // 初始化队列，放入根节点

    while (queue.length > 0) {
        const currentNode = queue.shift()!    // 取出队列第一个节点
        result.push(currentNode.value)        // 记录节点值

        // 将左右子节点加入队列
        if (currentNode.left) queue.push(currentNode.left)
        if (currentNode.right) queue.push(currentNode.right)
    }

    return result
}

/**
 * @description 前序遍历二叉树
 */
export const preOrderTraversal = <T>(root: TreeNode<T> | null): T[] => {
    const result: T[] = []

    // 递归获取节点值
    const traverse = (node: TreeNode<T> | null) => {
        if (!node) return
        result.push(node.value)
        traverse(node.left)
        traverse(node.right)
    }

    traverse(root)
    return result
}

/**
 * @description 中序遍历二叉树
 */
export const inOrderTraversal = <T>(root: TreeNode<T> | null): T[] => {
    const result: T[] = []

    // 递归获取节点值
    const traverse = (node: TreeNode<T> | null) => {
        if (!node) return
        traverse(node.left)
        result.push(node.value)
        traverse(node.right)
    }

    traverse(root)
    return result
}

/**
 * @description 后序遍历二叉树
 */
export const postOrderTraversal = <T>(root: TreeNode<T> | null): T[] => {
    const result: T[] = []

    // 递归获取节点值
    const traverse = (node: TreeNode<T> | null) => {
        if (!node) return
        traverse(node.left)
        traverse(node.right)
        result.push(node.value)
    }

    traverse(root)
    return result
}
