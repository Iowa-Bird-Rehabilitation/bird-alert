'use client'

import BirdAlertList from '../components/BirdAlertList'

export default function BirdRescueApp() {
  return (
    <div className="flex flex-col min-h-screen bg-stone-100">
      <div className="flex-grow overflow-y-auto pb-16">
        <BirdAlertList ></BirdAlertList>
      </div>
    </div>
  )
}
