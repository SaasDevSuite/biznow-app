"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Newspaper, TrendingUp, BarChart3, Zap, Shield, Clock, ArrowRight, CheckCircle } from "lucide-react"
import { motion, useInView } from "framer-motion"
import { useCursorAnimation } from "@/hooks/useCursorAnimation"
import { fetchLatestNews } from "@/actions/news/landing"
import { UserProfileButton } from "@/components/user-profile-button"

// Add type for news items
type NewsItem = {
  id: string
  title: string
  category: string
  sentiment: string
  content: string
  date: Date
  url: string
}

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 },
}

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
      <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className={className}
      >
        {children}
      </motion.div>
  )
}

export default function LandingPage() {
  useCursorAnimation();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadNews() {
      try {
        console.log("Fetching latest news...");
        setIsLoading(true);
        const latestNews = await fetchLatestNews(3);
        console.log("Fetched news:", latestNews);

        if (!latestNews || latestNews.length === 0) {
          console.log("No news items returned from server action");
        }

        setNewsItems(latestNews || []);
      } catch (error) {
        console.error("Failed to fetch latest news:", error);
        setNewsItems([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadNews();
  }, []);

  // Transform database news to match the format used in the UI
  const transformedNews = newsItems.map(news => ({
    id: news.id,
    title: news.title,
    category: news.category || "GENERAL",
    sentiment: news.sentiment || "Neutral",
    impact: 7.5, // Default impact score
    summary: news.content,
    readTime: `${Math.max(2, Math.ceil(news.content.length / 500))} min read`,
    trending: Math.random() > 0.7,
  }));

  // Add fallback news if nothing is returned
  const displayNews = transformedNews.length > 0 ? transformedNews : [
    {
      id: "fallback-1",
      title: "No news available at the moment",
      category: "GENERAL",
      sentiment: "Neutral",
      impact: 5.0,
      summary: "Please check back later for the latest business news and insights.",
      readTime: "1 min read",
      trending: false
    }
  ];

  return (
      <div className="min-h-screen flex flex-col overflow-x-hidden relative">
        {/* Cursor animation elements */}
        <div
            id="cursor-bg"
            className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500 ease-out"
            style={{ background: "transparent" }}
        ></div>

        {/* Header */}
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50"
        >
          <div className="container mx-auto py-4 px-4 flex justify-between items-center">
            <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Image
                  src="/biznow-logo.webp"
                  alt="Biznow Logo"
                  width={120}
                  height={48}
                  className="h-8 w-auto"
              />
            </motion.div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {/* Check if user is logged in */}
              <UserProfileButton />
            </div>
          </div>
        </motion.header>

        <main>
          {/* Enhanced Hero Section */}
          <section className="relative py-20 px-4 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20" />

            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                  animate={{
                    x: [0, 100, 0],
                    y: [0, -100, 0],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200/20 dark:bg-blue-800/20 rounded-full blur-3xl"
              />
              <motion.div
                  animate={{
                    x: [0, -100, 0],
                    y: [0, 100, 0],
                  }}
                  transition={{
                    duration: 25,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/20 dark:bg-purple-800/20 rounded-full blur-3xl"
              />
            </div>

            <div className="container mx-auto text-center max-w-4xl relative z-10">
              <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="mb-6"
              >
                <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
                  🚀 Now with AI-Powered Insights
                </Badge>
              </motion.div>

              <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-tight"
              >
                Business Intelligence
                <br />
                <span className="text-4xl md:text-5xl">That Keeps You Ahead</span>
              </motion.h1>

              <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed"
              >
                Transform raw business news into actionable insights with our AI-powered platform. Get real-time sentiment
                analysis, market impact scores, and personalized alerts.
              </motion.p>

              <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                      asChild
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
                  >
                    <Link href="/sign-up" className="flex items-center gap-2">
                      Sign Up for full access <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-2">
                    <Link href="#news-preview">See Live Demo</Link>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Stats */}
              <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">10K+</div>
                  <div className="text-sm text-muted-foreground">News Sources</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">90%</div>
                  <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">Daily</div>
                  <div className="text-sm text-muted-foreground">Real-time Updates</div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Enhanced News Preview Section */}
          <AnimatedSection>
            <section id="news-preview" className="py-20 bg-gradient-to-b from-muted/30 to-background">
              <div className="container mx-auto px-4">
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                  <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-4">
                    Latest Business Insights
                  </motion.h2>
                  <motion.p variants={fadeInUp} className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    See how our AI analyzes and categorizes business news in real-time
                  </motion.p>
                </motion.div>

                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
                >
                  {isLoading ? (
                    // Simple loading state for the news cards
                    Array(3).fill(0).map((_, index) => (
                      <motion.div key={index} variants={fadeInUp} className="h-80 animate-pulse">
                        <Card className="h-full bg-muted/30"></Card>
                      </motion.div>
                    ))
                  ) : (
                    displayNews.map((news) => (
                      <motion.div
                        key={news.id}
                        variants={fadeInUp}
                        whileHover={{ y: -10, scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <Card className="h-full flex flex-col border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 dark:from-background dark:to-blue-950/30">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <Badge variant={
                                news.sentiment === "Positive" 
                                  ? "default"  // Use default (primary) for positive
                                  : news.sentiment === "Negative" 
                                    ? "destructive" 
                                    : "secondary"  // Use secondary for neutral
                              }>
                                {news.sentiment}
                              </Badge>
                              {news.trending && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" /> Trending
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-xl mt-2 line-clamp-2">{news.title}</CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" /> {news.readTime}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="flex-grow">
                            <p className="text-muted-foreground line-clamp-3">{news.summary}</p>
                          </CardContent>
                          <CardFooter className="flex justify-between items-center">
                            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/50">
                              {news.category}
                            </Badge>
                            <Button variant="ghost" size="sm" className="gap-1">
                              Read more <ArrowRight className="h-4 w-4" />
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                  <Button
                      asChild
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
                  >
                    <Link href="/sign-up" className="flex items-center gap-2">
                      Unlock Full Access <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </section>
          </AnimatedSection>

          {/* Enhanced Features Section */}
          <AnimatedSection>
            <section className="py-20">
              <div className="container mx-auto px-4">
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                  <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-4">
                    Why Choose Biznow
                  </motion.h2>
                  <motion.p variants={fadeInUp} className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Powerful features designed to give you the competitive edge
                  </motion.p>
                </motion.div>

                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
                >
                  {[
                    {
                      icon: Newspaper,
                      title: "Curated Intelligence",
                      description:
                          "AI-powered curation filters 10,000+ sources to deliver only the news that impacts your business.",
                      gradient: "from-blue-500 to-cyan-500",
                    },
                    {
                      icon: TrendingUp,
                      title: "Sentiment Analysis",
                      description:
                          "Advanced NLP algorithms analyze market sentiment with 99.9% accuracy to predict market movements.",
                      gradient: "from-purple-500 to-pink-500",
                    },
                    {
                      icon: BarChart3,
                      title: "Impact Scoring",
                      description:
                          "Proprietary algorithms score each news item's potential impact on your industry and portfolio.",
                      gradient: "from-green-500 to-emerald-500",
                    },
                  ].map((feature, index) => (
                      <motion.div key={index} variants={fadeInUp} whileHover={{ y: -10 }} className="text-center group">
                        <motion.div
                            className={`bg-gradient-to-r ${feature.gradient} p-4 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                            whileHover={{ rotate: 5 }}
                        >
                          <feature.icon className="h-10 w-10 text-white" />
                        </motion.div>
                        <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                      </motion.div>
                  ))}
                </motion.div>

                {/* Additional Features Grid */}
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {[
                    { icon: Zap, title: "Real-time Alerts", description: "Instant notifications for breaking news" },
                    { icon: Shield, title: "Enterprise Security", description: "Bank-level encryption and compliance" },
                    { icon: Clock, title: "24/7 Monitoring", description: "Round-the-clock market surveillance" },
                  ].map((feature, index) => (
                      <motion.div
                          key={index}
                          variants={scaleIn}
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300"
                      >
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <feature.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">{feature.title}</h4>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </motion.div>
                  ))}
                </motion.div>
              </div>
            </section>
          </AnimatedSection>

          {/* CTA Section */}
          <AnimatedSection>
            <section className="py-20">
              <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-3xl p-12 text-center text-white relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Stay Ahead?</h2>
                    <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                      Join thousands of professionals who rely on Biznow for critical business intelligence.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
                          <Link href="/sign-up" className="flex items-center gap-2">
                            Sign Up for Free <ArrowRight className="h-5 w-5" />
                          </Link>
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="text-lg px-8 py-6 border-white/20 text-white hover:bg-white/10 dark:text-white dark:border-white/20 dark:hover:bg-white/10 bg-blue-600/10 border-blue-600/20 hover:bg-blue-600/20"
                        >
                          <Link href="#contact">Contact Sales</Link>
                        </Button>
                      </motion.div>
                    </div>
                    <div className="mt-8 flex items-center justify-center gap-6 text-sm opacity-80">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        14-day free trial
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        No credit card required
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>
          </AnimatedSection>
        </main>

        {/* Enhanced Footer */}
        <motion.footer
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-b from-muted to-muted/50 py-16 mt-auto"
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="md:col-span-2">
                <Image
                    src="/biznow-logo.webp"
                    alt="Biznow Logo"
                    width={100}
                    height={40}
                    className="h-8 w-auto mb-4"
                />
                <p className="text-muted-foreground mb-4 max-w-md">
                  Business news analytics that keeps you ahead of the market. Transform information into intelligence with
                  AI-powered insights.
                </p>
                <div className="flex gap-4">{/* Social media icons would go here */}</div>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link href="#" className="hover:text-primary transition-colors">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-primary transition-colors">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-primary transition-colors">
                      API
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-primary transition-colors">
                      Integrations
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link href="#" className="hover:text-primary transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-primary transition-colors">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-primary transition-colors">
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-primary transition-colors">
                      Press
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-muted-foreground mb-4 md:mb-0">
                ©  {new Date().getFullYear()} Syigen Pvt Ltd. All rights reserved.
              </div>
              <div className="flex gap-6 text-sm text-muted-foreground">
                <Link href="/privacy-policy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
  )
}
