import {
    BFSCreateTreeNode,
    BFSTreeNode,
    preOrderTraversal,
    inOrderTraversal,
    postOrderTraversal,
} from '../../../src/utils/algorithm/binaryTree'

describe('binaryTree utils', () => {
    test('BFSCreateTreeNode returns null for empty input', () => {
        expect(BFSCreateTreeNode([])).toBeNull()
        expect(BFSCreateTreeNode([null])).toBeNull()
    })

    test('BFSCreateTreeNode and BFSTreeNode rebuild a complete binary tree in breadth-first order', () => {
        const root = BFSCreateTreeNode([1, 2, 3, 4, 5, 6, 7])

        expect(root).not.toBeNull()
        expect(BFSTreeNode(root)).toEqual([1, 2, 3, 4, 5, 6, 7])
    })

    test('all traversals return expected orders for a complete binary tree', () => {
        const root = BFSCreateTreeNode([1, 2, 3, 4, 5, 6, 7])

        expect(preOrderTraversal(root)).toEqual([1, 2, 4, 5, 3, 6, 7])
        expect(inOrderTraversal(root)).toEqual([4, 2, 5, 1, 6, 3, 7])
        expect(postOrderTraversal(root)).toEqual([4, 5, 2, 6, 7, 3, 1])
    })

    test('traversals handle sparse trees created from breadth-first input with null placeholders', () => {
        const root = BFSCreateTreeNode([1, 2, 3, null, 4, null, 5])

        expect(BFSTreeNode(root)).toEqual([1, 2, 3, 4, 5])
        expect(preOrderTraversal(root)).toEqual([1, 2, 4, 3, 5])
        expect(inOrderTraversal(root)).toEqual([2, 4, 1, 3, 5])
        expect(postOrderTraversal(root)).toEqual([4, 2, 5, 3, 1])
    })

    test('traversals return empty arrays for null roots', () => {
        expect(BFSTreeNode(null)).toEqual([])
        expect(preOrderTraversal(null)).toEqual([])
        expect(inOrderTraversal(null)).toEqual([])
        expect(postOrderTraversal(null)).toEqual([])
    })
})
