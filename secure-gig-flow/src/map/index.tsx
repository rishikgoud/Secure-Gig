import { useState, useEffect } from 'react';
import { MapFilters } from './MapFilters';
import { NearbyMap } from './NearbyMap';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useNearby } from '@/hooks/useNearby';
import { MapFilters as MapFiltersType } from '@/api/types';

interface NearbyMapContainerProps {
  className?: string;
}

export const NearbyMapContainer = ({ className }: NearbyMapContainerProps) => {
  const { latitude, longitude, loading: locationLoading, error: locationError } = useGeolocation();
  
  const [filters, setFilters] = useState<MapFiltersType>({
    lat: latitude || 20.5937, // Default to India center
    lng: longitude || 78.9629,
    radius: 50,
  });

  // Update filters when location is detected
  useEffect(() => {
    if (latitude !== null && longitude !== null && !locationLoading) {
      setFilters(prev => ({
        ...prev,
        lat: latitude,
        lng: longitude,
      }));
    }
  }, [latitude, longitude, locationLoading]);

  const { data: mapData, isLoading: mapLoading, error: mapError } = useNearby(filters);

  const entities = mapData?.entities || [];
  const center: [number, number] = [filters.lat, filters.lng];

  return (
    <div className={`space-y-4 ${className}`}>
      <MapFilters
        filters={filters}
        onFiltersChange={setFilters}
      />
      
      <NearbyMap
        entities={entities}
        isLoading={locationLoading || mapLoading}
        error={locationError ? new Error(locationError) : mapError}
        center={center}
      />
    </div>
  );
};

// Export individual components for flexibility
export { MapFilters } from './MapFilters';
export { NearbyMap } from './NearbyMap';
export { useGeolocation } from '@/hooks/useGeolocation';
export { useNearby } from '@/hooks/useNearby';
