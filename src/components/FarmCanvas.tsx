import React from 'react'

export default function FarmCanvas({ onClickHuman, onClickShed }:{onClickHuman:()=>void,onClickShed:()=>void}){
  return (
    <div className="relative h-96 bg-gradient-to-b from-green-200 to-green-100 rounded overflow-hidden">
      {/* Simple SVG chickens & eggs */}
      <div className="absolute left-6 bottom-6">
        <svg width="120" height="80" viewBox="0 0 120 80">
          <ellipse cx="30" cy="60" rx="26" ry="12" fill="#fef3c7" />
          <circle cx="30" cy="50" r="18" fill="#fde047" />
          <circle cx="40" cy="45" r="3" fill="#000" />
        </svg>
      </div>

      <div className="absolute left-48 bottom-12">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <ellipse cx="20" cy="22" rx="12" ry="8" fill="#fff7ed" />
          <circle cx="20" cy="18" r="7" fill="#fef3c7" />
        </svg>
      </div>

      <div className="absolute right-44 bottom-16 cursor-pointer" onClick={onClickHuman}>
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-yellow-300 flex items-center justify-center">🙂</div>
          <div className="text-sm">Human</div>
        </div>
      </div>

      <div className="absolute right-6 top-8 cursor-pointer" onClick={onClickShed}>
        <div className="w-28 h-20 bg-red-500 rounded border-2 border-yellow-400 flex items-center justify-center text-white font-bold">Shed</div>
      </div>

      {/* Some eggs on the ground */}
      <div className="absolute left-20 bottom-28">
        <div className="w-6 h-8 bg-white rounded-full shadow-md" />
      </div>

    </div>
  )
}
