'use client'

import BirdAlertList from '../components/BirdAlertList'

export default function BirdRescueApp() {
  return (
    <div className="flex flex-col min-h-screen bg-stone-100">
      <div className="flex-grow overflow-y-auto pb-16">
        <BirdAlertList ></BirdAlertList>
      </div>
      <div className=" bg-stone-100 pb-4 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-stone-400 text-center	">COPYRIGHT &copy; Iowa Bird Rehabilitation 2012-2024. ALL RIGHTS RESERVED.
          </p>
        </div>
    </div>
  )
}
