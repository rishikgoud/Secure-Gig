import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapEntity } from '@/api/types';
import { MapPin, User, Briefcase, Star, ExternalLink } from 'lucide-react';
import L from '@/lib/leaflet';

// Custom marker icons
const createCustomIcon = (color: string) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const clientIcon = createCustomIcon('#ef4444'); // red
const freelancerIcon = createCustomIcon('#22c55e'); // green

interface NearbyMapProps {
  entities: MapEntity[];
  isLoading: boolean;
  error: Error | null;
  center: [number, number];
  className?: string;
}

export const NearbyMap = ({ entities, isLoading, error, center, className }: NearbyMapProps) => {
  const markers = useMemo(() => {
    return entities.map((entity) => ({
      ...entity,
      icon: entity.role === 'client' ? clientIcon : freelancerIcon,
    }));
  }, [entities]);

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Nearby Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Unable to load map data. Please check your connection and try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Nearby Map
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
              Clients
            </Badge>
            <Badge variant="outline" className="text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              Freelancers
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="relative h-[520px] w-full">
          {isLoading && (
            <div className="absolute inset-0 z-10 bg-background/50 flex items-center justify-center">
              <div className="space-y-2 text-center">
                <Skeleton className="h-4 w-32 mx-auto" />
                <Skeleton className="h-3 w-24 mx-auto" />
              </div>
            </div>
          )}
          
          <MapContainer
            center={center}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
            className="rounded-b-lg"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MarkerClusterGroup
              chunkedLoading
              maxClusterRadius={50}
              spiderfyOnMaxZoom={true}
              showCoverageOnHover={false}
            >
              {markers.map((entity) => (
                <Marker
                  key={entity.id}
                  position={[entity.location.lat, entity.location.lng]}
                  icon={entity.icon}
                >
                  <Popup maxWidth={300} className="custom-popup">
                    <div className="space-y-3 p-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {entity.role === 'client' ? (
                            <Briefcase className="h-4 w-4 text-red-500" />
                          ) : (
                            <User className="h-4 w-4 text-green-500" />
                          )}
                          <span className="font-semibold capitalize">
                            {entity.role}
                          </span>
                        </div>
                        <Badge variant={entity.role === 'client' ? 'destructive' : 'default'}>
                          {entity.role}
                        </Badge>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-1">{entity.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {entity.description}
                        </p>
                      </div>

                      {entity.skills && entity.skills.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-1">Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {entity.skills.slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                                {skill}
                              </Badge>
                            ))}
                            {entity.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                +{entity.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {entity.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">{entity.rating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">
                            ({entity.reviewCount || 0} reviews)
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs text-muted-foreground">
                          {entity.location.city}, {entity.location.country}
                        </span>
                        <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        </div>
        
        <div className="p-3 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            Showing {entities.length} {entities.length === 1 ? 'result' : 'results'} in your area
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
