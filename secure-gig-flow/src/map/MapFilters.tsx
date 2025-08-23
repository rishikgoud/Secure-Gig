import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { MapFilters as MapFiltersType } from '@/api/types';
import { Search, Filter, X } from 'lucide-react';

interface MapFiltersProps {
  filters: MapFiltersType;
  onFiltersChange: (filters: MapFiltersType) => void;
  className?: string;
}

export const MapFilters = ({ filters, onFiltersChange, className }: MapFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRoleChange = (value: string) => {
    onFiltersChange({
      ...filters,
      role: value === 'all' ? undefined : (value as 'client' | 'freelancer'),
    });
  };

  const handleSkillsChange = (value: string) => {
    onFiltersChange({
      ...filters,
      skills: value || undefined,
    });
  };

  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value || undefined,
    });
  };

  const handleRadiusChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      radius: value[0],
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      lat: filters.lat,
      lng: filters.lng,
    });
  };

  const hasActiveFilters = filters.role || filters.skills || filters.search || filters.radius;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 px-2 text-xs"
            >
              {isExpanded ? 'Less' : 'More'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Always visible: Search and Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search projects, skills..."
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={filters.role || 'all'} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="client">Clients</SelectItem>
                <SelectItem value="freelancer">Freelancers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Expandable filters */}
        {isExpanded && (
          <div className="space-y-4 pt-2 border-t">
            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Input
                id="skills"
                placeholder="React, Solidity, Web3.js (comma-separated)"
                value={filters.skills || ''}
                onChange={(e) => handleSkillsChange(e.target.value)}
              />
              {filters.skills && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {filters.skills.split(',').map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill.trim()}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label>Search Radius: {filters.radius || 50} km</Label>
              <Slider
                value={[filters.radius || 50]}
                onValueChange={handleRadiusChange}
                max={500}
                min={10}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>10 km</span>
                <span>500 km</span>
              </div>
            </div>
          </div>
        )}

        {/* Active filters summary */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {filters.role && (
              <Badge variant="outline" className="text-xs">
                Role: {filters.role}
              </Badge>
            )}
            {filters.skills && (
              <Badge variant="outline" className="text-xs">
                Skills: {filters.skills.split(',').length} selected
              </Badge>
            )}
            {filters.search && (
              <Badge variant="outline" className="text-xs">
                Search: "{filters.search}"
              </Badge>
            )}
            {filters.radius && (
              <Badge variant="outline" className="text-xs">
                Radius: {filters.radius}km
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
