/**
 * RouteSurvey Custom Icons Token File
 * Domain-specific SVG icons for surveying entities
 * 
 * Mirrors mobile_v2/lib/design_system/tokens/rs_icons.dart
 */

const BASE_V1 = '/assets/icons/routesurvey/v1';

export const RsIcons = {
    // State / Types
    obstruction: `${BASE_V1}/state/obstruction.svg`,
    observation: `${BASE_V1}/state/observation.svg`,
    information: `${BASE_V1}/state/information.svg`,

    // Main Categories
    road: `${BASE_V1}/main/road.svg`,
    bridge: `${BASE_V1}/main/bridge.svg`,
    powerLine: `${BASE_V1}/main/power_line.svg`,
    railCrossing: `${BASE_V1}/main/rail_crossing.svg`,
    intersection: `${BASE_V1}/main/intersection.svg`,
    overhead: `${BASE_V1}/main/overhead_obstruction.svg`,
    other: `${BASE_V1}/main/other.svg`,

    // Road Subtypes
    roadStraight: `${BASE_V1}/road/straight.svg`,
    roadNarrow: `${BASE_V1}/road/narrow.svg`,
    roadCurvy: `${BASE_V1}/road/curve.svg`,
    roadLeftTurn: `${BASE_V1}/road/left_turn.svg`,
    roadRightTurn: `${BASE_V1}/road/right_turn.svg`,

    // Bridge Subtypes
    bridgeConcrete: `${BASE_V1}/bridge/concrete.svg`,
    bridgeSteel: `${BASE_V1}/bridge/steel.svg`,
    bridgeRock: `${BASE_V1}/bridge/rock.svg`,
    bridgeCulvert: `${BASE_V1}/bridge/culvert.svg`,

    // Intersection Subtypes
    intersectionCross: `${BASE_V1}/intersection/cross.svg`,
    intersectionTJunction: `${BASE_V1}/intersection/t_junction.svg`,
    intersectionRoundabout: `${BASE_V1}/intersection/roundabout.svg`,
    intersectionYJunction: `${BASE_V1}/intersection/y_junction.svg`,

    // Overhead Subtypes
    overheadTunnel: `${BASE_V1}/overhead/tunnel.svg`,
    overheadTrees: `${BASE_V1}/overhead/trees_branches.svg`,
    overheadTrafficLight: `${BASE_V1}/overhead/traffic_light.svg`,
    overheadSignGantry: `${BASE_V1}/overhead/sign_gantry.svg`,
    overheadUnknown: `${BASE_V1}/overhead/unknown.svg`,

    // Powerline Subtypes
    powerlineCommunication: `${BASE_V1}/powerline/communication.svg`,
    powerlineResidential: `${BASE_V1}/powerline/residential.svg`,
    powerlineIndustrial: `${BASE_V1}/powerline/industrial.svg`,
    powerlineTransmission: `${BASE_V1}/powerline/transmission.svg`,
    powerlineUnknown: `${BASE_V1}/powerline/unknown.svg`,

    // Rail Crossing Subtypes
    railUncontrolled: `${BASE_V1}/rail/uncontrolled.svg`,
    railControlled: `${BASE_V1}/rail/controlled.svg`,
    railGated: `${BASE_V1}/rail/gated.svg`,
    railSiding: `${BASE_V1}/rail/siding.svg`,
    railUnknown: `${BASE_V1}/rail/unknown.svg`,

    // Other Subtypes
    otherGasStation: `${BASE_V1}/other/gas_station.svg`,
    otherParkingLot: `${BASE_V1}/other/parking_lot.svg`,
    otherGate: `${BASE_V1}/other/gate.svg`,
    otherTollStation: `${BASE_V1}/other/toll_station.svg`,
    otherUnknown: `${BASE_V1}/other/unknown.svg`,

    // Markers
    markerStart: `${BASE_V1}/markers/start.svg`,
    markerEnd: `${BASE_V1}/markers/end.svg`,
    markerObservation: `${BASE_V1}/markers/observation.svg`,
    markerObstruction: `${BASE_V1}/markers/obstruction.svg`,

    // Badges
    badgeBridgeSteel: `${BASE_V1}/badges/bridge_steel.svg`,
    badgePowerTransmission: `${BASE_V1}/badges/power_transmission.svg`,
    badgeRailGated: `${BASE_V1}/badges/rail_gated.svg`,
    badgeUnknown: `${BASE_V1}/badges/unknown.svg`,
} as const;

export type RsIconName = keyof typeof RsIcons;

/**
 * Get icon path by point type
 */
export function getIconForPointType(type: string): string {
    const typeMap: Record<string, string> = {
        bridge: RsIcons.bridge,
        powerline: RsIcons.powerLine,
        power_line: RsIcons.powerLine,
        railroad: RsIcons.railCrossing,
        rail_crossing: RsIcons.railCrossing,
        intersection: RsIcons.intersection,
        road: RsIcons.road,
        overhead: RsIcons.overhead,
        overhead_obstruction: RsIcons.overhead,
        other: RsIcons.other,
        custom: RsIcons.other,
    };
    return typeMap[type?.toLowerCase()] || RsIcons.other;
}
