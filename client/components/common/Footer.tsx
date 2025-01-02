import React from 'react'

const Footer = () => {
  return (
    <footer className="border-t border-slate-700 mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-slate-500">
          <p className="text-sm">
            Made with ♠️ by{' '}
            <a 
              href="https://github.com/izuchukwu-eric" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300"
            >
              Eric.eth
            </a>
          </p>
        </div>
    </footer>
  )
}

export default Footer