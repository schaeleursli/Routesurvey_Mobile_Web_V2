import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

// Create a dummy component for testing if no simple one exists
const HelloWorld = {
    template: '<div>Hello World</div>'
}

describe('HelloWorld', () => {
    it('renders properly', () => {
        const wrapper = mount(HelloWorld)
        expect(wrapper.text()).toContain('Hello World')
    })
})
