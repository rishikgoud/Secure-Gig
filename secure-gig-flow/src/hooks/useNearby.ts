import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { MapFilters, MapEntitiesResponse } from '@/api/types';
import { mockMapEntities, filterMockEntities } from '@/map/mockData';

// Query key factory
export const nearbyQueryKeys = {
  entities: (filters: MapFilters) => ['nearby', 'entities', filters] as const,
};

export const useNearby = (filters: MapFilters) => {
  return useQuery({
    queryKey: nearbyQueryKeys.entities(filters),
    queryFn: async (): Promise<MapEntitiesResponse> => {
      try {
        // Try to fetch from API first
        const response = await apiClient.getMapEntities(filters);
        return response;
      } catch (error) {
        console.warn('API unavailable, falling back to mock data:', error);
        
        // Fallback to mock data if API fails
        const filteredEntities = filterMockEntities(mockMapEntities, filters);
        return {
          entities: filteredEntities,
          total: filteredEntities.length,
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's a network error - just use mock data
      if (failureCount >= 1) return false;
      return true;
    },
    retryDelay: 1000,
  });
};
