'use client'

import { MapPinIcon, BirdIcon, TruckIcon, HomeIcon, CheckCircleIcon, MoreHorizontalIcon, UserIcon, ListIcon, MapIcon, ArrowLeftIcon, NavigationIcon, ChevronUpIcon, ChevronDownIcon, ShieldIcon, FilterIcon, XIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'
import Airtable from 'airtable'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'


type RescueStatus = 'Pending' | 'In Route' | 'Rescued' | 'Delivered'

interface Bird {
  id: string,
  species: string,
  location: string,
  destination: string,
  status: RescueStatus,
  rescuerName: string
}

export default function RescueDetails({ rescue, onBack, selectedRescue, setSelectedRescue, fetchBirdRescues }: { rescue: Bird, onBack: () => void, selectedRescue: any, setSelectedRescue: any, fetchBirdRescues: any }) {
    const [location, setLocation] = useState<string>('Des Moines, IA')
    const [birdRescues, setBirdRescues] = useState<Bird[]>([])
    // const [selectedRescue, setSelectedRescue] = useState<Bird | null>(null)
    const [activeView, setActiveView] = useState<'list' | 'admin'>('list')
    const [selectedStatuses, setSelectedStatuses] = useState<RescueStatus[]>(['Pending', 'In Route', 'Rescued', 'Delivered'])
    // const [selectedBirdTypes, setSelectedBirdTypes] = useState<BirdType[]>(['Songbird', 'Raptor', 'Waterfowl', 'Shorebird', 'Other'])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showAcceptForm, setShowAcceptForm] = useState(false)
    const [rescuerName, setRescuerName] = useState('')
    const [rescuerPhone, setRescuerPhone] = useState('')
    const [localRescuerName, setLocalRescuerName] = useState(rescuerName)
    const [localRescuerPhone, setLocalRescuerPhone] = useState(rescuerPhone)
    const [formError, setFormError] = useState<string | null>(null)
    const [volunteers, setVolunteers] = useState<any[]>([])

    const airtable = new Airtable({ apiKey: process.env.NEXT_PUBLIC_AIRTABLE_ACCESS_TOKEN })
    const base = airtable.base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID!)


    const getStatusColor = (status: RescueStatus) => {
        switch (status) {
          case 'Pending': return 'bg-lime-600'
          case 'In Route': return 'bg-red-700'
          case 'Rescued': return 'bg-emerald-700'
          case 'Delivered': return 'bg-teal-700'
        }
      }

      const handleStatusChange = async (newStatus: RescueStatus) => {
        console.log(selectedRescue)
        if (selectedRescue) {
          setIsLoading(true)
          try {
            const updatedFields = { VolunteerStatus: newStatus }
            
            if (newStatus === 'Pending') {
              setShowAcceptForm(true)
              setIsLoading(false)
              return
            }
    
            await updateRescueInAirtable(selectedRescue.id, updatedFields)
    
            const updatedBird = {
              ...selectedRescue,
              ...updatedFields,
            }
            setBirdRescues(birdRescues.map(bird => 
              bird.id === selectedRescue.id ? updatedBird : bird
            ))
            setSelectedRescue(updatedBird)
    
          } catch (error) {
            console.error('Error updating bird rescue status:', error)
            setError('Failed to update rescue status. Please try again.')
          }
          setIsLoading(false)
          if (newStatus !== "In Route") {
            setSelectedRescue(null)
          }
        
          fetchBirdRescues()
        }
        
      }  

      function handleAcceptClick() {
        setShowAcceptForm(true)
        handleStatusChange('In Route');
      }

      const handleSubmit = async (e: React.FormEvent) => {
        // e.preventDefault()
        // setFormError(null)
        // try {
        //     // await handleAcceptSubmit(e)
        //     setRescuerName(localRescuerName)
        //     setRescuerPhone(localRescuerPhone)
        // } catch (error) {
        //     console.error('Error in form submission:', error)
        //     setFormError('Failed to submit form. Please try again.')
        // }
        }

        const fetchVolunteers = async () => {
            setIsLoading(true)
            setError(null)
            try {
              const records = await base('Rescue and Transport Team').select().all()
              const volunteers = records.map((record) => ({
                id: record.get('_id') as string,
                name: record.get('Name') as string
              }))
              setVolunteers(volunteers)
            } catch (error) {
              console.error('Error fetching bird rescues:', error)
              setError('Failed to fetch bird rescues. Please try again later.')
            }
            setIsLoading(false)
          }

        
        function acceptForm( ) {
            return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowAcceptForm(false)}>
                    <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                        <CardTitle className="text-lg md:text-xl font-semibold text-stone-800">Accept Rescue</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => setShowAcceptForm(false)}>
                            <XIcon className="h-4 w-4" />
                        </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            {/* <Label htmlFor="rescuerName">Your Name</Label>
                            <Input
                            id="rescuerName"
                            value={localRescuerName}
                            onChange={(e) => setLocalRescuerName(e.target.value)}
                            required
                            /> */}
                            <Label> Your Name</Label>
                            <select>
                                {populateNameOptions()}
                            </select>
                                  
                                
                        </div>
                        <div className="space-y-2">
                            {/* <Label htmlFor="rescuerPhone">Your Phone Number</Label>
                            <Input
                            id="rescuerPhone"
                            value={localRescuerPhone}
                            onChange={(e) => setLocalRescuerPhone(e.target.value)}
                            required
                            /> */}
                        </div>
                        {formError && (
                            <div className="text-red-500 text-sm">{formError}</div>
                        )}
                        <Button type="submit" className="w-full bg-lime-600 hover:bg-lime-700 text-white">
                            Accept Rescue
                        </Button>
                        </form>
                    </CardContent>
                    </Card>
                </div>
                )
        }

        
        
        function populateNameOptions() {            
            const volunteerOptions = volunteers.filter((vol) => selectedRescue.possibleVolunteers.includes(vol.id))
    
            const volunteerOptionElements = volunteerOptions.map((vol) => {
                return (
                    <option>
                        {vol.name}
                    </option>
                )
            })
        
            return volunteerOptionElements
        }

       
    

    //   const fetchBirdRescues = async () => {
    //     setIsLoading(true)
    //     setError(null)
    //     try {
    //       const records = await base('Bird Alerts').select().all()
    //       const rescues: Bird[] = records.map(record => ({
    //         id: record.get('_id') as string,
    //         species: record.get('Type of Bird') as string,
    //         location: record.get('Full Pick Up Address') as string,
    //         destination: record.get('Drop Off Address') as string,
    //         status: record.get('VolunteerStatus') as RescueStatus,
    //         rescuerName: record.get('Current Volunteer') as string
    
    //       }))
    //       setBirdRescues(rescues)
    //     } catch (error) {
    //       console.error('Error fetching bird rescues:', error)
    //       setError('Failed to fetch bird rescues. Please try again later.')
    //     }
    //     setIsLoading(false)
    //   }
    
      const updateRescueInAirtable = async (id: string, fields: any) => {
        // console.log('Updating Airtable record:', id, 'with fields:', fields)
        try {
          const updatedRecords = await base('Bird Alerts').update([
            {
              id,
              fields: fields
            }
          ])
          console.log('Airtable update response:', updatedRecords)
          return updatedRecords
        } catch (error) {
          console.error('Error updating Airtable:', error)
          throw error
        }
      }

      

    useEffect(() => {
        fetchVolunteers()
    }, [])
    

    return (
        <Card className="border shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="bg-stone-100 border-b border-stone-200 px-4 py-2">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
            <CardTitle className="text-lg md:text-xl font-semibold text-stone-800">Rescue Details</CardTitle>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
              {/* <span className="mr-2 text-2xl">{getBirdTypeIcon(rescue.birdType)}</span> */}
              <span className="font-medium text-stone-700">{rescue.species}</span>
            </div>
            <Badge variant="secondary" className={`${getStatusColor(rescue.status)} text-white`}>
              {rescue.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 py-4 space-y-4">
          {/* <img 
            src={rescue.image} 
            alt={rescue.species} 
            className="w-full h-48 object-cover rounded-md shadow-md"
          /> */}
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-stone-50 p-3 rounded-md">
              <div className="flex items-center overflow-hidden">
                <MapPinIcon className="mr-2 h-5 w-5 flex-shrink-0 text-stone-500" />
                <span className="text-stone-700 truncate">{rescue.location}</span>
              </div>
              <a href={`https://maps.google.com/?q=${rescue.location}` } target='_blank'>
                    Directions
              </a>
            </div>
            <div className="flex items-center justify-between bg-stone-50 p-3 rounded-md">
              <div className="flex items-center overflow-hidden">
                <HomeIcon className="mr-2 h-5 w-5 flex-shrink-0 text-stone-500" />
                <span className="text-stone-700 truncate">{rescue.destination}</span>
              </div>


              <a href={`https://maps.google.com/?q=${rescue.destination}` } target='_blank'>
                    Directions
              </a>
            </div>
            <div className="flex items-center bg-stone-50 p-3 rounded-md">
              <TruckIcon className="mr-2 h-5 w-5 flex-shrink-0 text-stone-500" />
              <span>Current Volunteer: <span className='bold-text'>{rescue.rescuerName ? rescue.rescuerName : "AVAILABLE"}</span> </span>
  
              {/* <span className="text-stone-700">{rescue.distance}</span> */}
            </div>
          </div>
          <div className="space-y-4">
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full bg-white hover:bg-stone-50 transition-colors duration-200 ease-in-out">
                  <MoreHorizontalIcon className="mr-2 h-4 w-4" />
                  Change Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {(['Pending', 'In Route', 'Pending', 'Rescued'] as RescueStatus[]).map((status) => (
                  <DropdownMenuItem key={status} onSelect={() => handleStatusChange(status)}>
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu> */}
            {
                showAcceptForm && 
                acceptForm()
            }
            {rescue.status === 'Pending' && (
              <Button className="w-full bg-lime-600 hover:bg-lime-700 text-white transition-colors duration-200" onClick={handleAcceptClick}>
                Accept Rescue
              </Button>
            )}
            {rescue.status === 'In Route' && (
              <Button className="w-full bg-red-700 hover:bg-red-800 text-white transition-colors duration-200" onClick={() => handleStatusChange('Rescued')}>
                Mark as rescued
              </Button>
            )}
            {rescue.status === 'Rescued' && (
              <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white transition-colors duration-200" onClick={() => handleStatusChange('Delivered')}>
                Mark as Delivered
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
}