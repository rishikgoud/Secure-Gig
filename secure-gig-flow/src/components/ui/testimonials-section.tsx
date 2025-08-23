import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Quote } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Full-Stack Developer",
      avatar: "👩‍💻",
      quote: "Finally, a platform where I get paid instantly after delivering quality work. No more waiting weeks for payment!",
      rating: 5,
      project: "Built e-commerce platform",
      earnings: "$4,500"
    },
    {
      name: "Marcus Rodriguez",
      role: "UI/UX Designer", 
      avatar: "👨‍🎨",
      quote: "The escrow system gives me confidence that my work is protected. Clients can't disappear with my designs anymore.",
      rating: 5,
      project: "Mobile app redesign",
      earnings: "$2,800"
    },
    {
      name: "David Kim",
      role: "Tech Startup Founder",
      avatar: "👨‍💼",
      quote: "As a client, I love the transparency. Funds are locked safely until I'm satisfied with the work. No trust issues!",
      rating: 5,
      project: "Hired 3 freelancers",
      savings: "85% less fees"
    },
    {
      name: "Elena Vasquez",
      role: "Content Writer",
      avatar: "✍️",
      quote: "The AI dispute resolution saved me from a difficult client situation. Fair, fast, and completely transparent.",
      rating: 5,
      project: "Blog content creation",
      earnings: "$1,200"
    },
    {
      name: "James Thompson",
      role: "Blockchain Developer",
      avatar: "⚡",
      quote: "Being part of a truly decentralized marketplace feels amazing. This is the future of freelancing!",
      rating: 5,
      project: "Smart contract audit",
      earnings: "$6,000"
    },
    {
      name: "Lisa Park",
      role: "Marketing Agency Owner",
      avatar: "📈",
      quote: "We've hired 15+ freelancers through SecureGig. The quality and reliability is unmatched in the industry.",
      rating: 5,
      project: "Team expansion",
      savings: "90% fewer disputes"
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-gradient-to-b from-muted/20 via-background to-muted/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-primary rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-secondary rounded-full blur-2xl animate-float" style={{animationDelay: '3s'}} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4 md:space-y-6 mb-12 md:mb-16">
          <Badge className="bg-gradient-indigo-violet text-white px-4 py-2 text-sm md:text-base">
            Success Stories
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold">
            <span className="text-foreground">Trusted by </span>
            <span className="text-gradient-indigo">Thousands</span>
            <span className="text-foreground"> of Users</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Join freelancers and clients who are already experiencing the future of secure, 
            decentralized work relationships.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="card-web3 relative group overflow-hidden">
              <CardContent className="p-8">
                {/* Quote icon */}
                <Quote className="h-8 w-8 text-primary/30 mb-4" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-muted-foreground mb-6 italic leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>

                {/* Stats */}
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="text-sm text-primary font-medium">{testimonial.project}</div>
                  {testimonial.earnings && (
                    <div className="text-xs text-muted-foreground">
                      Earned: <span className="text-secondary font-semibold">{testimonial.earnings}</span>
                    </div>
                  )}
                  {testimonial.savings && (
                    <div className="text-xs text-muted-foreground">
                      Saved: <span className="text-secondary font-semibold">{testimonial.savings}</span>
                    </div>
                  )}
                </div>

                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 md:mt-16">
          <p className="text-base md:text-lg text-muted-foreground mb-4">
            Ready to join our community of successful freelancers and clients?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Badge className="bg-gradient-teal-blue text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base cursor-pointer hover:scale-105 transition-transform">
              ⚡ 2,000+ Projects Completed
            </Badge>
            <Badge className="bg-gradient-secondary text-accent-foreground px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base cursor-pointer hover:scale-105 transition-transform">
              💰 $500K+ Paid Securely
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;