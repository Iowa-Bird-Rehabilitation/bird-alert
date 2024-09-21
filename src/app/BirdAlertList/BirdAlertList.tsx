'use client'

import { MapPinIcon, BirdIcon, TruckIcon, HomeIcon, CheckCircleIcon, MoreHorizontalIcon, UserIcon, ListIcon, MapIcon, ArrowLeftIcon, NavigationIcon, ChevronUpIcon, ChevronDownIcon, ShieldIcon, FilterIcon, XIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import RescueDetails from '../RescueDetails/RescueDetails'
import Airtable from 'airtable'

// rescue status is a list of statuses that is the same as the statuses in airtable under the column 'VolunteerStatus' in the Bird Alerts table
type RescueStatus = 'Pending' | 'In Route' | 'Rescued' | 'Delivered'

// type Bird has variables from the airtable database. Rescuer name is the same as the 'Current Volunteer'
interface Bird {
  id: string,
  species: string,
  location: string,
  destination: string,
  status: RescueStatus,
  rescuerName: string
}

export default function BirdAlertList() {
    // creates the variables needed to set up the bird alert list
    const [location, setLocation] = useState<string>('Des Moines, IA')
    const [birdRescues, setBirdRescues] = useState<Bird[]>([])
    const [selectedRescue, setSelectedRescue] = useState<Bird | null>(null)
    const [activeView, setActiveView] = useState<'list' | 'admin'>('list')
    const [selectedStatuses, setSelectedStatuses] = useState<RescueStatus[]>(['Pending', 'In Route', 'Rescued', 'Delivered'])
    // const [selectedBirdTypes, setSelectedBirdTypes] = useState<BirdType[]>(['Songbird', 'Raptor', 'Waterfowl', 'Shorebird', 'Other'])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showAcceptForm, setShowAcceptForm] = useState(false)
    const [rescuerName, setRescuerName] = useState('')
    const [rescuerPhone, setRescuerPhone] = useState('')

    // connection to airtable and the Bird Alert table.
    const airtable = new Airtable({ apiKey: process.env.NEXT_PUBLIC_AIRTABLE_ACCESS_TOKEN })
    const base = airtable.base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID!)

    // colors for status
    const getStatusColor = (status: RescueStatus) => {
        switch (status) {
          case 'Pending': return 'bg-rose-600 hover:bg-rose-800'
          case 'In Route': return 'bg-amber-600 hover:bg-amber-800'
          case 'Rescued': return 'bg-violet-700 hover:bg-violet-800'
          case 'Delivered': return 'bg-teal-700'
        }
      }

      // this function collects the records from airtable and converts them to type 'Bird'
      const fetchBirdRescues = async () => {
        setIsLoading(true)
        setError(null)
        try {
          // airtable fetch
          const records = await base('Bird Alerts').select().all()

          //conversion
          const rescues: Bird[] = records.map((record) => ({
            id: record.get('_id') as string,
            species: record.get('Type of Bird') as string,
            location: record.get('Full Pick Up Address') as string,
            destination: record.get('Drop Off Address') as string,
            status: record.get('VolunteerStatus') as RescueStatus,
            rescuerName: record.get('Current Volunteer') as string,
            possibleVolunteers: record.get("Possible Volunteers") as object[]
          }))

          //sets state variable
          setBirdRescues(rescues)
        } catch (error) {
          console.error('Error fetching bird rescues:', error)
          setError('Failed to fetch bird rescues. Please try again later.')
        }
        setIsLoading(false)
      }
    
    console.log(birdRescues)

    useEffect(() => {
    fetchBirdRescues()
    }, [])
    

    return (
        <div className="space-y-4">
      <Card className="bg-fill bg-center text-white rounded-none" style={{ backgroundImage: "url('../images/birds.jpg')" }}>
       
          <CardTitle className="text-2xl font-bold px-8 pt-12 pb-2">Iowa Bird Rehabilitation</CardTitle>
        
        <CardContent>
          <div className="flex items-center text-sm text-stone-300 pb-6">
            <MapPinIcon className="mr-2 h-4 w-4" />
            <span>My Location: {location}</span>
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4 px-8 py-4">
      {selectedRescue ? (
        <RescueDetails rescue={selectedRescue} onBack={() => setSelectedRescue(null)} selectedRescue={selectedRescue} setSelectedRescue={setSelectedRescue} fetchBirdRescues={fetchBirdRescues}/>
      ) : (
        <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
          <CardHeader className="bg-stone-100 border-b border-stone-200">
            <CardTitle className="text-lg md:text-xl font-semibold text-stone-800">Available Rescues</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {/* <FilterOptions /> */}
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="w-8 h-8 border-t-2 border-lime-500 rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-32 text-red-500">
                <p>{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {birdRescues.filter(bird => 
                  selectedStatuses.includes(bird.status) && bird.status !== "Delivered"
                ).map(rescue => (
                  <Card key={rescue.id} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          {/* <span className="text-2xl">{getBirdTypeIcon(rescue.birdType)}</span> */}
                          <CardTitle className="text-lg font-semibold">{rescue.species}</CardTitle>
                        </div>
                        <Badge variant="secondary" className={`${getStatusColor(rescue.status)} text-white h-10`}>
                          {rescue.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-stone-600">
                          <MapPinIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{rescue.location}</span>
                        </div>
                        <div className="flex items-center text-sm text-stone-600">
                          <HomeIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{rescue.destination}</span>
                        </div>
                        <div className="flex items-center text-sm text-stone-600">
                          <TruckIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                          {/* <span>{rescue.distance}</span> */}
                          <span>Current Volunteer: <span className='bold-text'>{rescue.rescuerName ? rescue.rescuerName : "AVAILABLE"}</span> </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-stone-50 p-4">
                      <Button 
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input shadow-sm hover:text-accent-foreground h-9 px-4 py-2 w-full bg-white hover:bg-stone-50 transition-colors duration-200 ease-in-out text-black"
                        onClick={() => setSelectedRescue(rescue)}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
    </div>
    )
}
