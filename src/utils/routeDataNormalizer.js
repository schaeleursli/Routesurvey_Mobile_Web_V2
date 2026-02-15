export function normalizeRoutePoint(point) {
    if (!point || typeof point !== 'object') return point;

    const rawData = point.data ?? point.Data;
    const normalizedData = typeof rawData === 'string'
        ? rawData
        : rawData != null
            ? JSON.stringify(rawData)
            : '';

    return {
        ...point,
        id: point.id ?? point.Id ?? point.pointId,
        lat: point.lat ?? point.Lat ?? point.latitude,
        lng: point.lng ?? point.Lng ?? point.longitude,
        alt: point.alt ?? point.Alt,
        head: point.head ?? point.Head,
        distance: point.distance ?? point.Distance,
        type: point.type ?? point.Type,
        data: normalizedData,
        dateAdded: point.dateAdded ?? point.DateAdded
    };
}

export function normalizeRoutePoints(points) {
    if (!Array.isArray(points)) return [];
    return points.map(normalizeRoutePoint);
}

export function normalizeRouteData(route) {
    if (!route || typeof route !== 'object') return route;

    const normalized = { ...route };

    const rawPoints =
        route.pointsData ??
        route.PointsData ??
        route.points ??
        route.Points;

    if (rawPoints) {
        const normalizedPoints = normalizeRoutePoints(rawPoints);
        normalized.pointsData = normalizedPoints;
        if (!normalized.points) normalized.points = normalizedPoints;
    }

    normalized.title = normalized.title ?? route.Title ?? route.routeTitle ?? route.RouteTitle;
    normalized.name = normalized.name ?? route.RouteName ?? route.routeName ?? normalized.title;
    normalized.note = normalized.note ?? route.Note ?? route.note;
    normalized.start = normalized.start ?? route.Start ?? route.start;
    normalized.end = normalized.end ?? route.End ?? route.end;
    normalized.distance = normalized.distance ?? route.Distance ?? route.distance;
    normalized.dateAdded = normalized.dateAdded ?? route.DateAdded ?? route.createdAt ?? route.created_at;

    if (route.RouteData) {
        try {
            const parsed = typeof route.RouteData === 'string'
                ? JSON.parse(route.RouteData)
                : route.RouteData;

            if (parsed && (parsed.pointsData || parsed.PointsData)) {
                parsed.pointsData = normalizeRoutePoints(parsed.pointsData || parsed.PointsData);
            }

            normalized.RouteData = parsed;
        } catch (error) {
            // Keep original RouteData if parsing fails.
        }
    }

    return normalized;
}
