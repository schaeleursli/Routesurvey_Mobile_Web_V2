/**
 * Equipment Specification Types
 * 
 * These types MUST match the backend EffectiveSpec schema exactly.
 * All units: imperial (inches, lbs)
 */

export interface Point3D {
    x: number
    y: number
    z: number
}

export interface MassProperties {
    mass: number // pounds
    center_of_gravity: Point3D
}

export type TireType = 'single' | 'dual'

export interface TireSpec {
    type: TireType
    diameter: number // inches
    width: number // inches
    load_rating?: number // lbs
}

export type LoadDistributionType = 'hydraulic' | 'fixed'
export type SteeringMode = 'independent' | 'coordinated' | 'front_only' | 'rear_only'

export interface AxleGroup {
    name: string
    position: number // inches from front
    num_axles: number
    axle_spacing: number // inches
    tire_spec: TireSpec
    load_distribution: LoadDistributionType
    load_rating?: number // lbs
}

export interface AxleLine {
    name: string
    position: number // inches from front
    num_tires_across: number
    tire_spec: TireSpec
    steering_mode: SteeringMode
    load_rating?: number
}

// Equipment Modules

export interface TractorSpec {
    module_type: 'tractor'
    manufacturer: string
    model: string
    wheelbase: number
    overall_length: number
    overall_height: number
    fifth_wheel_height: number
    fifth_wheel_setback: number
    steer_axle: AxleGroup
    drive_axles: AxleGroup[]
    mass_properties: MassProperties
}

export type TrailerType = 'flatbed' | 'stepdeck' | 'double_drop' | 'lowboy' | 'rgn'

export interface TrailerSpec {
    module_type: 'trailer'
    trailer_type: TrailerType
    manufacturer?: string
    model?: string
    overall_length: number
    overall_width: number
    overall_height: number
    deck_length: number
    deck_width: number
    deck_height: number
    is_extendable: boolean
    min_length?: number
    max_length?: number
    extension_type?: 'telescopic' | 'beam_inserts'
    kingpin_to_center: number
    has_removable_gooseneck: boolean
    axle_groups: AxleGroup[]
    mass_properties: MassProperties
}

export interface JeepDollySpec {
    module_type: 'jeep'
    manufacturer?: string
    model?: string
    overall_length: number
    fifth_wheel_height: number
    drawbar_length: number
    axle_groups: AxleGroup[]
    mass_properties: MassProperties
}

export interface BoosterSpec {
    module_type: 'booster'
    manufacturer?: string
    model?: string
    overall_length: number
    deck_height: number
    axle_groups: AxleGroup[]
    mass_properties: MassProperties
}

export interface SPMTSpec {
    module_type: 'spmt'
    manufacturer: string
    model: string
    num_axle_lines: number
    axle_lines: AxleLine[]
    overall_length: number
    overall_width: number
    deck_height: number
    has_ppu: boolean
    ppu_mass?: number
    mass_properties: MassProperties
}

export interface CargoSpec {
    name: string
    mass: number
    length: number
    width: number
    height: number
    center_of_gravity: Point3D
    placement_offset: number
}

// Assemblies

export interface OpenDeckTrainAssembly {
    assembly_type: 'open_deck_train'
    tractor: TractorSpec
    jeep?: JeepDollySpec
    trailer: TrailerSpec
    booster?: BoosterSpec
    cargo: CargoSpec
}

export interface SPMTAssembly {
    assembly_type: 'spmt'
    spmt_units: SPMTSpec[]
    cargo: CargoSpec
    arrangement: 'side_by_side' | 'front_to_back' | 'custom'
}

export type EffectiveSpec = OpenDeckTrainAssembly | SPMTAssembly
