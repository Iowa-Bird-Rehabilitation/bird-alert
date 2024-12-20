import React from 'react'
import { Card } from './ui/card'

export default function BestPractices() {
  return (
        <Card className="mr-4 ml-4 p-4 max-w-screen-md min-w-96 m-auto">
            <div>
                <h2 className='text-center mb-4 font-bold'>Bird Alert Best Practices:</h2>
            </div>

            <div className='mb-3'>
                <h2 className='font-bold'>Only change your own Bird Alert:</h2>
                <p className='text-stone-800 text-sm'>
                    Once you pick up an alert, 
                    you should be the only person making changes on that alert (Unless it is an alert that requires two people, in this case you should coordinate with the other
                    volunteer to ensure that the correct changes are made).
                </p>
            </div>

            <div className='mb-3'>
                <h2 className='font-bold'>Keep your Bird Alert up to date:</h2>
                <p className='text-stone-800 text-sm'>
                    If you are actively working on a Bird Alert, it is important to update the alert accordingly. For example if you have rescued the bird and 
                    are now transporting it to IBR, make sure to click the "Mark As Rescued" button in the alert. Keeping the alert updated helps IBR keep track of 
                    the current status of all active alerts.
                </p>
            </div>

            <div className='mb-3'>
                <h2 className='font-bold'>Read your Bird Alert closely:</h2>
                <p className='text-stone-800 text-sm'>
                    All of the applicable information about the rescue/transport will be in the details of the Bird Alert. Make sure to read carefully so you do not miss any 
                    important details, including the notes given by IBR about the alert.
                </p>
            </div>

            <div className='mb-5'>
                <h2 className='font-bold'>Using the volunteer notes section:</h2>
                <p className='text-stone-800 text-sm mb-2'>
                    The volunteer notes section gives you a way to communicate with other volunteers. However this should not be used as a messaging board.
                    These notes allow volunteers to provide important updates about the alert, that may be valuable to IBR or other volunteers. 
                </p>

                <p className='text-stone-800 text-sm mb-2'>
                    For example,
                    if you are qualified to pick up an alert, but cannot do so for a period of time, you can add to the notes section stating as such. If another volunteer can immediately 
                    pick up the Bird Alert, they can add another note stating that they have done so and then pick up the alert.
                </p>

                <p className='text-stone-800 text-sm'>
                    This allows other volunteers that may be involved to be updated on the current status of the alert.
                </p>
            </div>

            <div>
                <h2 className='text-center mb-4 font-bold'>FAQ's:</h2>
            </div>

            <div className='mb-3'>
                <h2 className='font-bold'>What do each of the status badges mean?</h2>
                <p className='text-stone-800 text-sm mb-2'>
                    <span className='font-semibold'>Pending</span> - The bird alert has not been picked up yet, and is waiting for a qualified volunteer to do so.
                </p>
                <p className='text-stone-800 text-sm mb-2'>
                    <span className='font-semibold'>In Route</span> - The bird alert has been picked up by a volunteer and they are now on their way to the scene.
                </p>
                <p className='text-stone-800 text-sm mb-2'>
                    <span className='font-semibold'>On Scene</span> - The volunteer has arrived on the scene of the bird alert and is actively working to resolve the alert.
                </p>
                <p className='text-stone-800 text-sm mb-2'>
                    <span className='font-semibold'>Rescued</span> - The bird has been rescued, either released on site, or is now in transit to the IBR facility. 
                </p>
                <p className='text-stone-800 text-sm mb-2'>
                    <span className='font-semibold'>Delivered</span> - The bird has been dropped off at the IBR facility.
                </p>
            </div>

            <div className='mb-3'>
                <h2 className='font-bold'>Why is my name not available to select?</h2>
                <p className='text-stone-800 text-sm'>
                    The list of names available to select for each bird alert is automatically determined when the bird alert is created by IBR.
                    This is based off of current skills, training, and location. If you believe that the system has incorrectly left your 
                    name off of an alert, please speak to IBR.
                </p>
            </div>
            
            <div className='mb-3'>
                <h2 className='font-bold'>What should I do if there is an emergency?:</h2>
                <p className='text-stone-800 text-sm'>
                    At the bottom of the page there is a call button that will call IBR directly. This should only be used in an emergency where
                    reaching IBR immediately is critical.
                </p>
            </div>    
        </Card>
  )
}
