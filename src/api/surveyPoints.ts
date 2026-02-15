/**
 * Survey Points API
 *
 * API functions for fetching, updating, and deleting survey points.
 */

import axios from 'axios';
import type { SurveyPoint } from '@routesurvey/survey-core';

// Base API URL - adjust based on environment
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface FetchPointsResponse {
    success: boolean;
    data: SurveyPoint[];
}

export interface PatchPointResponse {
    success: boolean;
    data: SurveyPoint;
}

export interface DeletePointResponse {
    success: boolean;
}

/**
 * Fetch all survey points for a route
 */
export async function fetchSurveyPoints(routeId: string): Promise<SurveyPoint[]> {
    const response = await axios.get<FetchPointsResponse>(
        `${API_BASE}/routes/${routeId}/points`
    );
    return response.data.data || [];
}

/**
 * Update a survey point (PATCH)
 */
export async function patchSurveyPoint(
    pointId: string,
    data: Partial<SurveyPoint>
): Promise<SurveyPoint> {
    const response = await axios.patch<PatchPointResponse>(
        `${API_BASE}/points/${pointId}`,
        data
    );
    return response.data.data;
}

/**
 * Delete a survey point (soft delete)
 */
export async function deleteSurveyPoint(pointId: string): Promise<void> {
    await axios.delete<DeletePointResponse>(`${API_BASE}/points/${pointId}`);
}

/**
 * Update photo notes for a specific photo
 */
export async function updatePhotoNotes(
    pointId: string,
    photoId: string,
    notes: string
): Promise<void> {
    await axios.patch(`${API_BASE}/points/${pointId}/photos/${photoId}`, {
        photoNotes: notes,
    });
}

export default {
    fetchSurveyPoints,
    patchSurveyPoint,
    deleteSurveyPoint,
    updatePhotoNotes,
};
