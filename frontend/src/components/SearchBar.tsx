import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
  compact?: boolean;
}
export function SearchBar({
  onSearch,
  loading,
  compact
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };
  const suggestions = ["Quick healthy dinner under 30 minutes", "High protein vegetarian meals", "Low sugar desserts with chocolate", "Recipes using chicken and rice"];
  if (compact) {
    return <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="text" placeholder="Search recipes..." value={query} onChange={e => setQuery(e.target.value)} className="pl-10 h-10" />
          </div>
          <Button type="submit" size="sm" disabled={loading} className="shrink-0">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </Button>
        </div>
      </form>;
  }
  return <div className="w-full max-w-3xl mx-auto px-2 sm:px-0">
      <form onSubmit={handleSubmit} className="relative">
        <motion.div className="relative group" initial={false} animate={isFocused ? {
        scale: 1.02
      } : {
        scale: 1
      }} transition={{
        type: "spring",
        stiffness: 300,
        damping: 25
      }}>
          {/* Animated glow background */}
          <motion.div className="absolute -inset-1 gradient-sunset rounded-2xl blur-lg" initial={{
          opacity: 0.3
        }} animate={{
          opacity: loading ? [0.4, 0.7, 0.4] : isFocused ? 0.5 : 0.3,
          scale: loading ? [1, 1.02, 1] : 1
        }} transition={{
          duration: loading ? 1.5 : 0.3,
          repeat: loading ? Infinity : 0,
          ease: "easeInOut"
        }} />
          
          <div className="relative flex flex-col sm:flex-row gap-2 p-2 bg-card rounded-xl border border-border shadow-card transition-shadow duration-300 group-hover:shadow-lg">
            <div className="relative flex-1">
              <motion.div animate={{
              rotate: isFocused ? [0, 15, -15, 0] : 0,
              scale: isFocused ? [1, 1.2, 1] : 1
            }} transition={{
              duration: 0.5,
              ease: "easeOut"
            }}>
                <Sparkles className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-primary/60" />
              </motion.div>
              <Input type="text" placeholder="Describe what you're craving..." value={query} onChange={e => setQuery(e.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} className="pl-10 sm:pl-12 h-12 sm:h-14 text-base sm:text-lg border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0" />
            </div>
            <motion.div whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }}>
              <Button type="submit" variant="hero" size="lg" disabled={loading} className="shrink-0 w-full sm:w-auto h-12 sm:h-auto relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {loading ? <motion.div key="loading" initial={{
                  opacity: 0,
                  y: 10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  y: -10
                }} className="flex items-center">
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      <span className="ml-2">Searching...</span>
                    </motion.div> : <motion.div key="search" initial={{
                  opacity: 0,
                  y: 10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  y: -10
                }} className="flex items-center">
                      <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="ml-2 py-[15px]">Find Recipes</span>
                    </motion.div>}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </form>

      {/* Quick Suggestions with staggered animation */}
      <motion.div initial={{
      opacity: 0,
      y: 10
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.3
    }} className="mt-4 sm:mt-6 flex flex-wrap gap-2 justify-center">
        <span className="text-xs sm:text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-left mb-1 sm:mb-0">Try:</span>
        {suggestions.slice(0, 3).map((suggestion, index) => <motion.button key={index} initial={{
        opacity: 0,
        scale: 0.9
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        delay: 0.4 + index * 0.1
      }} whileHover={{
        scale: 1.05,
        y: -2
      }} whileTap={{
        scale: 0.95
      }} onClick={() => {
        setQuery(suggestion);
        onSearch(suggestion);
      }} className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors line-clamp-1">
            {suggestion}
          </motion.button>)}
        <span className="hidden sm:inline-flex gap-2">
          {suggestions.slice(3).map((suggestion, index) => <motion.button key={index + 3} initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          delay: 0.7 + index * 0.1
        }} whileHover={{
          scale: 1.05,
          y: -2
        }} whileTap={{
          scale: 0.95
        }} onClick={() => {
          setQuery(suggestion);
          onSearch(suggestion);
        }} className="text-sm px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors">
              {suggestion}
            </motion.button>)}
        </span>
      </motion.div>
    </div>;
}