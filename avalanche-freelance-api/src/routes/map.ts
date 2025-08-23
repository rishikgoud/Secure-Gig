import { Router } from 'express';
import { z } from 'zod';
import { logger } from '../config/logger.js';

const router = Router();

// Mock data for map entities (in production, this would come from database)
const mockMapEntities = [
  {
    id: '1',
    role: 'freelancer',
    name: 'React Developer',
    location: {
      lat: 28.6139,
      lng: 77.2090,
      city: 'New Delhi',
      country: 'India'
    },
    skills: ['React', 'TypeScript', 'Node.js'],
    rating: 4.8,
    reviewCount: 45,
    description: 'Experienced full-stack developer specializing in React and blockchain integration.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '2',
    role: 'client',
    name: 'E-commerce Platform',
    location: {
      lat: 19.0760,
      lng: 72.8777,
      city: 'Mumbai',
      country: 'India'
    },
    skills: ['E-commerce', 'Payment Integration'],
    budget: '$5,000 - $10,000',
    description: 'Looking for a team to build a modern e-commerce platform with crypto payments.',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '3',
    role: 'freelancer',
    name: 'Solidity Developer',
    location: {
      lat: 12.9716,
      lng: 77.5946,
      city: 'Bangalore',
      country: 'India'
    },
    skills: ['Solidity', 'Web3.js', 'Smart Contracts'],
    rating: 4.9,
    reviewCount: 67,
    description: 'Blockchain specialist with 5+ years experience in DeFi and NFT projects.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '4',
    role: 'client',
    name: 'DeFi Dashboard',
    location: {
      lat: 22.5726,
      lng: 88.3639,
      city: 'Kolkata',
      country: 'India'
    },
    skills: ['DeFi', 'Analytics', 'Data Visualization'],
    budget: '$8,000 - $15,000',
    description: 'Need a comprehensive DeFi analytics dashboard with real-time data.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '5',
    role: 'freelancer',
    name: 'UI/UX Designer',
    location: {
      lat: 13.0827,
      lng: 80.2707,
      city: 'Chennai',
      country: 'India'
    },
    skills: ['UI/UX', 'Figma', 'Web3 Design'],
    rating: 4.7,
    reviewCount: 32,
    description: 'Creative designer specializing in Web3 and blockchain user interfaces.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '6',
    role: 'client',
    name: 'NFT Marketplace',
    location: {
      lat: 17.3850,
      lng: 78.4867,
      city: 'Hyderabad',
      country: 'India'
    },
    skills: ['NFT', 'Marketplace', 'IPFS'],
    budget: '$12,000 - $20,000',
    description: 'Building a next-generation NFT marketplace with advanced features.',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face'
  }
];

// Validation schema for map filters
const mapFiltersSchema = z.object({
  role: z.enum(['client', 'freelancer', 'all']).optional(),
  skills: z.string().optional(),
  radius: z.coerce.number().min(1).max(1000).optional(),
  search: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
});

// GET /api/map/entities - Get map entities with filters
router.get('/entities', async (req, res) => {
  try {
    const filters = mapFiltersSchema.parse(req.query);
    
    logger.info('Fetching map entities', { filters });

    // Filter entities based on provided filters
    let filteredEntities = [...mockMapEntities];

    // Role filter
    if (filters.role && filters.role !== 'all') {
      filteredEntities = filteredEntities.filter(entity => entity.role === filters.role);
    }

    // Skills filter
    if (filters.skills && filters.skills.trim()) {
      const searchSkills = filters.skills.toLowerCase().split(',').map(s => s.trim());
      filteredEntities = filteredEntities.filter(entity => {
        return searchSkills.some(skill =>
          entity.skills.some(entitySkill => entitySkill.toLowerCase().includes(skill))
        );
      });
    }

    // Search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filteredEntities = filteredEntities.filter(entity => {
        return entity.name.toLowerCase().includes(searchTerm) ||
               entity.description?.toLowerCase().includes(searchTerm) ||
               entity.skills.some(skill => skill.toLowerCase().includes(searchTerm));
      });
    }

    // Radius filter (simplified distance calculation)
    if (filters.radius && filters.lat && filters.lng) {
      filteredEntities = filteredEntities.filter(entity => {
        const distance = Math.sqrt(
          Math.pow(entity.location.lat - filters.lat!, 2) + 
          Math.pow(entity.location.lng - filters.lng!, 2)
        );
        const maxDistance = filters.radius! / 111; // Rough conversion: 1 degree ≈ 111km
        return distance <= maxDistance;
      });
    }

    const response = {
      entities: filteredEntities,
      total: filteredEntities.length,
    };

    logger.info('Map entities fetched successfully', { 
      total: response.total,
      filters 
    });

    return res.json(response);
  } catch (error) {
    logger.error('Failed to fetch map entities', { error });
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid filters',
        details: error.issues,
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch map entities',
    });
  }
});

export default router;
