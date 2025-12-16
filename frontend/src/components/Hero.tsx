import { SearchBar } from './SearchBar';
import { motion } from 'framer-motion';

interface HeroProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

export function Hero({ onSearch, loading }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-muted/50 to-secondary/30 py-20 lg:py-32">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              AI-Powered Recipe Discovery
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-serif text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-tight"
          >
            Find Your Perfect{' '}
            <span className="text-gradient-sunset">Recipe</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            Describe what you're craving, your dietary needs, or ingredients you have — 
            and let AI find the perfect recipes for you.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <SearchBar onSearch={onSearch} loading={loading} />
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
          >
            {[
              { emoji: '🎯', title: 'Smart Filters', desc: 'Time, nutrition & more' },
              { emoji: '🥗', title: 'Dietary Aware', desc: 'Protein, carbs, fats' },
              { emoji: '💾', title: 'Save Favorites', desc: 'Build your collection' },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-4 rounded-xl bg-card/50 border border-border/50"
              >
                <span className="text-3xl mb-2">{feature.emoji}</span>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
