import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import BaseButton from '@/components/ui/BaseButton.vue'

describe('BaseButton', () => {
    it('renders default slot content', () => {
        const wrapper = mount(BaseButton, {
            slots: {
                default: 'Click Me'
            }
        })
        expect(wrapper.text()).toContain('Click Me')
    })

    it('emits click event when clicked', async () => {
        const wrapper = mount(BaseButton)
        await wrapper.trigger('click')
        expect(wrapper.emitted()).toHaveProperty('click')
    })

    it('does not emit click when disabled', async () => {
        const wrapper = mount(BaseButton, {
            props: {
                disabled: true
            }
        })
        await wrapper.trigger('click')
        expect(wrapper.emitted('click')).toBeFalsy()
        expect(wrapper.classes()).toContain('base-button--disabled')
    })

    it('applies variant classes', () => {
        const wrapper = mount(BaseButton, {
            props: {
                variant: 'danger'
            }
        })
        expect(wrapper.classes()).toContain('base-button--danger')
    })

    it('renders icons when props are provided', () => {
        const wrapper = mount(BaseButton, {
            props: {
                leftIcon: 'icon-left',
                rightIcon: 'icon-right'
            }
        })
        expect(wrapper.find('.base-button__icon--left').exists()).toBe(true)
        expect(wrapper.find('.base-button__icon--right').exists()).toBe(true)
    })
})
