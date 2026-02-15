/**
 * Block Registry - Maps block types to Vue components
 * 
 * CENTRAL REGISTRY for all permit block components
 */

import PermitSummaryBlock from '@/components/permits/blocks/PermitSummaryBlock.vue';
import VehicleLoadBlock from '@/components/permits/blocks/VehicleLoadBlock.vue';
import RouteDefinitionBlock from '@/components/permits/blocks/RouteDefinitionBlock.vue';
import ClearanceObstructionsBlock from '@/components/permits/blocks/ClearanceObstructionsBlock.vue';
import BridgeListBlock from '@/components/permits/blocks/BridgeListBlock.vue';
import EscortWindowsBlock from '@/components/permits/blocks/EscortWindowsBlock.vue';
import TractionBrakingBlock from '@/components/permits/blocks/TractionBrakingBlock.vue';
import SweptPathBlock from '@/components/permits/blocks/SweptPathBlock.vue';
import EvidenceAnnexBlock from '@/components/permits/blocks/EvidenceAnnexBlock.vue';
import StateAddendaBlock from '@/components/permits/blocks/StateAddendaBlock.vue';
import EngineeringSummaryBlock from '@/components/permits/blocks/EngineeringSummaryBlock.vue';
import AxleLoadSheetBlock from '@/components/permits/blocks/AxleLoadSheetBlock.vue';

/**
 * Block type to component mapping
 */
export const BLOCK_REGISTRY = {
    'permit_summary': PermitSummaryBlock,
    'vehicle_load': VehicleLoadBlock,
    'route_definition': RouteDefinitionBlock,
    'clearance_obstructions': ClearanceObstructionsBlock,
    'bridge_list': BridgeListBlock,
    'escort_windows': EscortWindowsBlock,
    'traction_braking': TractionBrakingBlock,
    'swept_path': SweptPathBlock,
    'evidence_annex': EvidenceAnnexBlock,
    'state_addenda': StateAddendaBlock,
    // Phase 2.0: Engineering Integration
    'engineering_summary': EngineeringSummaryBlock,
    'axle_load_sheet': AxleLoadSheetBlock
};

/**
 * Get component for a block type
 * @param {string} blockType - Block type from template
 * @returns {Component|null} Vue component or null
 */
export function getBlockComponent(blockType) {
    return BLOCK_REGISTRY[blockType] || null;
}

/**
 * Check if block type is implemented
 * @param {string} blockType - Block type from template
 * @returns {boolean} True if implemented
 */
export function isBlockImplemented(blockType) {
    return BLOCK_REGISTRY[blockType] !== null;
}
