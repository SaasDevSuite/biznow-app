"use client"

import React from "react"
import Link from "next/link"
import {motion} from "framer-motion"
import {ArrowLeft, Facebook, Github, Linkedin, Mail, MessageSquare, Scale, Shield} from "lucide-react"
import {Button} from "@/components/ui/button"
import {ThemeToggle} from "@/components/theme-toggle"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background grid pattern */}
      <div 
        className="absolute inset-0 opacity-10 dark:opacity-5 z-0"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(55, 65, 81, 0.1) 1px, transparent 1px), 
                            linear-gradient(to bottom, rgba(55, 65, 81, 0.1) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />

      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <Button variant="ghost" asChild>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          <ThemeToggle />
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl space-y-8 z-10 my-8"
        >
          {/* Contact Us Section */}
          <div className="bg-card border-2 border-blue-600/20 dark:border-blue-800/30 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-6 flex justify-center">
              <div className="bg-white/20 dark:bg-black/20 p-4 rounded-full">
                <Mail className="h-10 w-10 text-white" />
              </div>
            </div>
            
            <div className="p-8">
              <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-6">
                Contact Us
              </h1>
              
              <div className="text-center mb-8">
                <p className="text-lg text-foreground">
                  Have a question, suggestion, or need support?
                </p>
                <p className="text-lg text-foreground">
                  Reach out — we&apos;d love to hear from you.
                </p>
              </div>
              
              {/* Contact Cards */}
              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl p-6 text-white shadow-lg flex flex-col items-center"
                >
                  <MessageSquare className="h-10 w-10 mb-4" />
                  <h2 className="text-xl font-bold mb-2">General Inquiries</h2>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl p-6 text-white shadow-lg flex flex-col items-center"
                >
                  <MessageSquare className="h-10 w-10 mb-4" />
                  <h2 className="text-xl font-bold mb-2">Support</h2>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl p-6 text-white shadow-lg flex flex-col items-center"
                >
                  <Shield className="h-10 w-10 mb-4" />
                  <h2 className="text-xl font-bold mb-2">Privacy Requests</h2>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl p-6 text-white shadow-lg flex flex-col items-center"
                >
                  <Scale className="h-10 w-10 mb-4" />
                  <h2 className="text-xl font-bold mb-2">Legal & Terms</h2>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-6 rounded-xl shadow-lg text-white mx-auto max-w-md relative z-10"
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-black p-3 rounded-full shadow-lg">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-center pt-6">
                  <a href="mailto:info@syigen.com" className="text-white text-lg font-bold underline">
                    info@syigen.com
                  </a>
                </div>
              </motion.div>
              
              {/* Social Media */}
              <div className="mt-12 text-center">
                <p className="text-lg text-foreground mb-6">
                  Follow us on socials and be part of the future of business intelligence.
                </p>
                <div className="flex justify-center gap-6">
                  <motion.a 
                    href="https://github.com/SaasDevSuite/biznow-app"
                    target="_blank" 
                    rel="noopener noreferrer"
                    whileHover={{ y: -5 }}
                    className="bg-emerald-500 p-3 rounded-lg text-white"
                  >
                    <Github className="h-6 w-6" />
                  </motion.a>
                  <motion.a 
                    href="https://www.linkedin.com/company/syigen-ltd/posts/?feedView=all"
                    target="_blank" 
                    rel="noopener noreferrer"
                    whileHover={{ y: -5 }}
                    className="bg-blue-500 p-3 rounded-lg text-white"
                  >
                    <Linkedin className="h-6 w-6" />
                  </motion.a>
                  <motion.a 
                    href="https://www.facebook.com/profile.php?id=61573171048704"
                    target="_blank" 
                    rel="noopener noreferrer"
                    whileHover={{ y: -5 }}
                    className="bg-pink-500 p-3 rounded-lg text-white"
                  >
                    <Facebook className="h-6 w-6" />
                  </motion.a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}